import type { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { VERIFIED_BADGE_KEY, VERIFIED_BADGE_NAME } from './constants';
import { ForbiddenException, Global, HttpException, HttpStatus, Injectable, Logger, Module, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './decorators';
import { DEFAULT_FRESHNESS_DAYS, NoticeKind, PLAN_PRODUCT_LIMITS, PlanName } from './constants';
import { deleteFromSupabaseStorage, readFromSupabaseStorage, uploadToSupabaseStorage } from './uploads';

type Actor = 'Administration' | 'Pharmacie' | 'Visiteur' | 'Système' | 'Passerelle Paiement';

export function actorOf(user?: AuthUser | 'Système' | 'Passerelle Paiement'): Actor {
  if (user === 'Système' || user === 'Passerelle Paiement') return user;
  if (user?.role === 'ADMIN') return 'Administration';
  if (user?.role === 'PHARMACIST') return 'Pharmacie';
  return 'Visiteur';
}

/** Services transverses : journal d'audit, notifications, paramètres, contrôle d'accès aux établissements. */
@Injectable()
export class CoreService {
  private readonly logger = new Logger(CoreService.name);

  constructor(private readonly prisma: PrismaService) { }

  audit(user: AuthUser | 'Système' | 'Passerelle Paiement' | undefined, action: string, entity: string, entityId?: number, db: Prisma.TransactionClient = this.prisma) {
    const actorUser = typeof user === 'string' ? undefined : user;
    return db.auditLog.create({
      data: { actor: actorOf(user), actorUserId: actorUser?.id, action, entity, entityId },
    });
  }

  getChannelsConfig() {
    const emailConfigured = Boolean(process.env.RESEND_API_KEY?.trim() || process.env.SMTP_WEBHOOK_URL?.trim());
    const smsConfigured = Boolean(process.env.SMS_API_URL?.trim() && process.env.SMS_API_KEY?.trim());
    return {
      emailMode: emailConfigured ? ('live' as const) : ('log' as const),
      smsMode: smsConfigured ? ('live' as const) : ('log' as const),
      emailConfigured,
      smsConfigured,
    };
  }

  async sendEmail(to: string, subject: string, text: string): Promise<{ sent: boolean; mode: 'live' | 'log' }> {
    const from = process.env.EMAIL_FROM?.trim() || 'PharmaConnect <notifications@pharmaconnect.td>';
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const webhookUrl = process.env.SMTP_WEBHOOK_URL?.trim();
    const footer = '\n\n---\nNotification transactionnelle PharmaConnect. Vous pouvez gérer ou désactiver vos alertes depuis Paramètres > Préférences de notification.';
    const fullText = text.includes('Préférences de notification') ? text : `${text}${footer}`;

    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from, to: [to], subject, text: fullText }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
          this.logger.warn(`Échec Resend HTTP ${res.status}`);
          return { sent: false, mode: 'live' };
        }
        return { sent: true, mode: 'live' };
      } catch (err) {
        this.logger.warn(`Erreur réseau Resend: ${(err as Error).message}`);
        return { sent: false, mode: 'live' };
      }
    }

    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject, text: fullText, from }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
          this.logger.warn(`Échec webhook SMTP HTTP ${res.status}`);
          return { sent: false, mode: 'live' };
        }
        return { sent: true, mode: 'live' };
      } catch (err) {
        this.logger.warn(`Erreur réseau SMTP webhook: ${(err as Error).message}`);
        return { sent: false, mode: 'live' };
      }
    }

    this.logger.debug('Canal e-mail non configuré.');
    return { sent: false, mode: 'log' };
  }

  async sendSms(phone: string, message: string): Promise<{ sent: boolean; mode: 'live' | 'log' }> {
    const apiUrl = process.env.SMS_API_URL?.trim();
    const apiKey = process.env.SMS_API_KEY?.trim();
    const sender = process.env.SMS_SENDER_ID?.trim() || 'PharmaConn';

    if (apiUrl && apiKey) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ to: phone, message, sender }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
          this.logger.warn(`Échec passerelle SMS HTTP ${res.status}`);
          return { sent: false, mode: 'live' };
        }
        return { sent: true, mode: 'live' };
      } catch (err) {
        this.logger.warn(`Erreur réseau passerelle SMS: ${(err as Error).message}`);
        return { sent: false, mode: 'live' };
      }
    }

    this.logger.debug('Canal SMS non configuré.');
    return { sent: false, mode: 'log' };
  }

  private async dispatchExternalNotice(pharmacyId: number, title: string, body: string) {
    try {
      const pharmacy = await this.prisma.pharmacy.findUnique({
        where: { id: pharmacyId },
        include: { preferences: true },
      });
      if (!pharmacy) return;

      const prefs = pharmacy.preferences;
      const lowerTitle = title.toLowerCase();
      const shouldSend =
        lowerTitle.includes('abonnement') || lowerTitle.includes('essai') || lowerTitle.includes('paiement')
          ? (prefs?.subscriptionReminders ?? true)
          : lowerTitle.includes('stock') || lowerTitle.includes('rupture')
            ? (prefs?.lowStockAlerts ?? false)
            : (prefs?.notificationMessages ?? true);

      if (!shouldSend) return;

      if (pharmacy.email) {
        await this.sendEmail(pharmacy.email, `[PharmaConnect] ${title}`, body);
      }
      if (pharmacy.phone) {
        await this.sendSms(pharmacy.phone, `PharmaConnect: ${title} - ${body}`);
      }
    } catch (err) {
      this.logger.warn(`Notification externe échouée pour pharmacie #${pharmacyId}: ${(err as Error).message}`);
    }
  }

  async notify(pharmacyId: number, title: string, body: string, kind: NoticeKind = 'info') {
    const notice = await this.prisma.notice.create({ data: { pharmacyId, title, body, kind } });
    void this.dispatchExternalNotice(pharmacyId, title, body);
    void this.emitRealtime('notice', 'created', pharmacyId);
    return notice;
  }

  /** Émet un signal temps réel anonymisé (sans PII) vers Supabase Realtime. */
  async emitRealtime(topic: string, event: string, pharmacyId?: number) {
    try {
      await this.prisma.realtimeSignal.create({
        data: { topic, event, pharmacyId: pharmacyId ?? null },
      });
      // Garde la table compacte (conserve les 200 derniers signaux)
      const stale = await this.prisma.realtimeSignal.findMany({
        orderBy: { id: 'desc' },
        skip: 200,
        take: 100,
        select: { id: true },
      });
      if (stale.length > 0) {
        await this.prisma.realtimeSignal.deleteMany({
          where: { id: { in: stale.map(r => r.id) } },
        });
      }
    } catch (err) {
      this.logger.debug(`Signal temps réel ignoré (${topic}/${event}): ${(err as Error).message}`);
    }
  }

  /** Stockage persistant des images publiques dans Supabase (MediaAsset + Storage si configuré). */
  async persistPublicImage(opts: {
    storedName: string;
    mimeType: string;
    buffer: Buffer;
    sha256: string;
    ownerId?: number;
    pharmacyId?: number;
    entity: string;
    entityId?: number;
  }) {
    await uploadToSupabaseStorage(`public/${opts.storedName}`, opts.buffer, opts.mimeType);
    await this.prisma.mediaAsset.create({
      data: {
        ownerId: opts.ownerId ?? null,
        pharmacyId: opts.pharmacyId ?? null,
        entity: opts.entity,
        entityId: opts.entityId ?? null,
        fileName: opts.storedName,
        mimeType: opts.mimeType,
        size: opts.buffer.length,
        data: new Uint8Array(opts.buffer),
        sha256: opts.sha256,
        isPublic: false,
      },
    });
  }

  async readPublicImage(storedName: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { fileName: storedName },
      orderBy: { id: 'desc' },
    });
    if (asset?.data && asset.data.length > 0) {
      return { buffer: Buffer.from(asset.data), mimeType: asset.mimeType };
    }
    const fromStorage = await readFromSupabaseStorage(`public/${storedName}`);
    if (fromStorage) {
      return { buffer: fromStorage, mimeType: asset?.mimeType || 'application/octet-stream' };
    }
    return null;
  }

  async deletePublicImage(imageUrl?: string | null) {
    if (!imageUrl || !imageUrl.startsWith('/uploads/public/')) return;
    const storedName = imageUrl.slice('/uploads/public/'.length);
    if (!storedName || storedName.includes('/') || storedName.includes('..')) return;
    await this.prisma.mediaAsset.deleteMany({ where: { fileName: storedName } }).catch(() => {});
    await deleteFromSupabaseStorage(`public/${storedName}`);
  }

  /** Limitation de débit distribuée en base PostgreSQL (résistante aux instances Vercel serverless). */
  async assertDistributedRateLimit(bucket: string, rawKey: string, limit: number, windowMs: number) {
    if (process.env.NODE_ENV === 'test') return;
    const keyHash = createHash('sha256').update(`${bucket}:${rawKey}`).digest('hex').slice(0, 40);
    const now = Date.now();
    const recordKey = `${bucket}:${keyHash}`;
    try {
      const existing = await this.prisma.customRecord.findUnique({
        where: { namespace_recordKey: { namespace: 'rate_limit', recordKey } },
      });
      const prev = (existing?.data && typeof existing.data === 'object' ? existing.data : null) as
        | { count?: number; resetAt?: number }
        | null;
      const inWindow = Boolean(prev?.resetAt && prev.resetAt > now);
      const count = inWindow ? Number(prev?.count || 0) + 1 : 1;
      const resetAt = inWindow ? Number(prev?.resetAt) : now + windowMs;
      await this.prisma.customRecord.upsert({
        where: { namespace_recordKey: { namespace: 'rate_limit', recordKey } },
        update: { data: { count, resetAt } },
        create: { namespace: 'rate_limit', recordKey, data: { count, resetAt } },
      });
      if (count > limit) {
        throw new HttpException('Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.', HttpStatus.TOO_MANY_REQUESTS);
      }
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.warn(`Rate-limit DB indisponible (${bucket}): ${(err as Error).message}`);
    }
  }

  async getFreshnessDays(): Promise<number> {
    const s = await this.prisma.setting.findUnique({ where: { key: 'freshnessDays' } });
    const n = Number(s?.value);
    return Number.isInteger(n) && n >= 1 && n <= 365 ? n : DEFAULT_FRESHNESS_DAYS;
  }

  async setFreshnessDays(days: number) {
    await this.prisma.setting.upsert({
      where: { key: 'freshnessDays' },
      update: { value: String(days) },
      create: { key: 'freshnessDays', value: String(days) },
    });
    return days;
  }

  /** Identifiant propriétaire effectif. */
  effectiveUserId(user: AuthUser): number {
    return user.id;
  }

  pharmacyAccessScope(user: AuthUser): Prisma.PharmacyWhereInput | undefined {
    if (user.role === 'ADMIN') return undefined;
    if (user.role === 'PHARMACIST') return { ownerId: this.effectiveUserId(user) };
    throw new ForbiddenException('Accès réservé aux comptes professionnels et administratifs.');
  }

  /** Une officine inconnue ou hors du périmètre du compte donne la même réponse. */
  async assertPharmacyAccess(user: AuthUser, pharmacyId: number, db: Prisma.TransactionClient = this.prisma) {
    const scope = this.pharmacyAccessScope(user);
    const pharmacy = await db.pharmacy.findFirst({ where: { id: pharmacyId, ...scope } });
    if (!pharmacy) throw new NotFoundException('Établissement introuvable.');
    return pharmacy;
  }

  /** Indique si l'officine est validée et dispose d'un essai ou abonnement en cours. */
  isPharmacyActiveAndValid(pharmacy: { status: string; trialEndsAt?: Date | null; subscriptionEndsAt?: Date | null }): boolean {
    if (pharmacy.status !== 'Validée') return false;
    const now = Date.now();
    if (pharmacy.subscriptionEndsAt) return pharmacy.subscriptionEndsAt.getTime() > now;
    if (pharmacy.trialEndsAt) return pharmacy.trialEndsAt.getTime() > now;
    return false;
  }

  /** Bloque les opérations opérationnelles (produits, réponses) si l'officine est refusée, suspendue ou expirée. */
  assertPharmacyOperational(
    pharmacy: { status: string; trialEndsAt?: Date | null; subscriptionEndsAt?: Date | null },
    requireValidated = false,
  ) {
    if (requireValidated && pharmacy.status !== 'Validée') {
      throw new ForbiddenException('Cette action nécessite un établissement validé et actif.');
    }
    if (['Refusée', 'Suspendue', 'Abonnement expiré'].includes(pharmacy.status)) {
      throw new ForbiddenException(`Action impossible : établissement actuellement au statut « ${pharmacy.status} ».`);
    }
    if (pharmacy.status === 'Validée' && !this.isPharmacyActiveAndValid(pharmacy)) {
      throw new ForbiddenException('Abonnement ou période d’essai expiré : renouvelez votre formule pour continuer.');
    }
  }

  /** Détermine la formule active (les 14 jours d'essai gratuit débloquent les fonctionnalités Premium après validation). */
  effectivePlan(pharmacy: { status?: string; subscription: string; trialEndsAt?: Date | null; subscriptionEndsAt?: Date | null }): PlanName {
    if (pharmacy.status && pharmacy.status !== 'Validée') return 'Basic';
    const now = Date.now();
    const inActiveTrial = Boolean(pharmacy.trialEndsAt && pharmacy.trialEndsAt.getTime() > now && !pharmacy.subscriptionEndsAt);
    if (inActiveTrial) return 'Premium';
    if (!this.isPharmacyActiveAndValid({ status: pharmacy.status ?? 'Validée', trialEndsAt: pharmacy.trialEndsAt, subscriptionEndsAt: pharmacy.subscriptionEndsAt })) return 'Basic';
    if (pharmacy.subscription === 'Premium' || pharmacy.subscription === 'Standard') return pharmacy.subscription;
    return 'Basic';
  }

  async assignVerifiedBadge(pharmacyId: number, db: Prisma.TransactionClient) {
    const badge = await db.badge.upsert({
      where: { key: VERIFIED_BADGE_KEY },
      update: { name: VERIFIED_BADGE_NAME, visible: true, expiryDays: null, system: true },
      create: {
        key: VERIFIED_BADGE_KEY, name: VERIFIED_BADGE_NAME, icon: 'shield', visible: true, system: true,
        description: 'Documents administratifs vérifiés par PharmaConnect.',
      },
    });
    await db.pharmacyBadge.upsert({
      where: { pharmacyId_badgeId: { pharmacyId, badgeId: badge.id } },
      update: {},
      create: { pharmacyId, badgeId: badge.id },
    });
  }

  activeProductCount(pharmacyId: number, db: Prisma.TransactionClient = this.prisma) {
    return db.product.count({ where: { pharmacyId, status: { not: 'Archivé' } } });
  }

  /** Vérifie le quota de produits actifs autorisé par la formule de l'officine. */
  async assertProductQuota(pharmacy: { id: number; status?: string; subscription: string; trialEndsAt?: Date | null; subscriptionEndsAt?: Date | null }, db: Prisma.TransactionClient = this.prisma) {
    const plan = this.effectivePlan(pharmacy);
    const limit = PLAN_PRODUCT_LIMITS[plan];
    if (!Number.isFinite(limit)) return;
    const activeCount = await this.activeProductCount(pharmacy.id, db);
    if (activeCount >= limit) {
      throw new ForbiddenException(
        `Limite de la formule ${plan} atteinte (${limit} produits actifs maximum). Passez à la formule supérieure pour ajouter davantage de produits.`,
      );
    }
  }
}

@Global()
@Module({ providers: [CoreService], exports: [CoreService] })
export class CoreModule { }
