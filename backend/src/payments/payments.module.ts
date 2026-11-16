import {
  BadRequestException, Body, ConflictException, Controller, ForbiddenException, Get, Headers, Injectable, Logger, Module, NotFoundException, ServiceUnavailableException,
  Param, ParseIntPipe, Post, Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoreService } from '../common/core.service';
import { AuthUser, CurrentUser, Public, Roles } from '../common/decorators';
import {
  MOBILE_MONEY_PROVIDERS,
  PAYMENT_CURRENCY,
  PERIODS,
  PERIOD_TO_PLAN_FIELD,
  PLAN_NAMES,
  PLAN_PRODUCT_LIMITS,
  Period,
  PlanName,
} from '../common/constants';

// ---------- DTO ----------
export class CreatePaymentDto {
  @ApiProperty({ enum: PLAN_NAMES }) @IsIn(PLAN_NAMES) plan: PlanName;
  @ApiProperty({ enum: ['Mensuel', 'Trimestriel', 'Annuel'] }) @IsIn(['Mensuel', 'Trimestriel', 'Annuel']) period: Period;
  @ApiPropertyOptional({ enum: ['Mobile Money', 'Carte bancaire'], default: 'Mobile Money' })
  @IsOptional() @IsIn(['Mobile Money', 'Carte bancaire']) method?: 'Mobile Money' | 'Carte bancaire';
  @ApiPropertyOptional({ example: 'Airtel Money' }) @IsOptional() @IsString() @MaxLength(80) provider?: string;
  @ApiPropertyOptional({ example: '+23566000000' }) @IsOptional() @IsString() @MaxLength(80) payerPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID('4') requestId?: string;
}

export class PaymentWebhookDto {
  @ApiProperty() @IsString() @MaxLength(100) invoiceRef: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) externalRef?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) amount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @ApiProperty({ enum: ['Confirmé', 'Échoué'] }) @IsIn(['Confirmé', 'Échoué']) status: 'Confirmé' | 'Échoué';
}

function serializePayment(p: {
  id: number;
  pharmacyId: number;
  plan: string;
  amount: number;
  period: string;
  status: string;
  method: string;
  provider: string | null;
  payerPhone: string | null;
  invoiceRef: string;
  externalRef: string | null;
  createdAt: Date;
}) {
  return {
    id: p.id,
    pharmacyId: p.pharmacyId,
    plan: p.plan,
    amount: p.amount,
    period: p.period,
    status: p.status,
    method: p.method,
    provider: p.provider ?? undefined,
    payerPhone: p.payerPhone ?? undefined,
    invoiceRef: p.invoiceRef,
    externalRef: p.externalRef ?? undefined,
    date: p.createdAt.toISOString(),
  };
}

// ---------- Service ----------
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly core: CoreService,
  ) { }

  private operatorGateway(provider: string) {
    const config = {
      'Airtel Money': [process.env.AIRTEL_MONEY_API_URL, process.env.AIRTEL_MONEY_CLIENT_SECRET],
      'Moov Money': [process.env.MOOV_MONEY_API_URL, process.env.MOOV_MONEY_API_KEY],
    }[provider];
    if (!config) return null;
    const [url, key] = config.map(value => value?.trim());
    return url && key ? { url, key } : null;
  }

  getGatewayConfig() {
    const live = (process.env.MOBILE_MONEY_MODE || 'manual_reconciliation') === 'live';
    return {
      mode: live ? 'live' : 'manual_reconciliation',
      methods: ['Mobile Money'],
      operators: MOBILE_MONEY_PROVIDERS.filter(provider => !live || this.operatorGateway(provider)),
    };
  }

  private addMonthsSafe(base: Date, months: number): Date {
    const res = new Date(base);
    const day = res.getUTCDate();
    res.setUTCDate(1);
    res.setUTCMonth(res.getUTCMonth() + months);
    const lastDay = new Date(Date.UTC(res.getUTCFullYear(), res.getUTCMonth() + 1, 0)).getUTCDate();
    res.setUTCDate(Math.min(day, lastDay));
    return res;
  }

  private async dispatchLiveOperatorPush(
    gateway: { url: string; key: string },
    payload: { provider: string; amount: number; currency: string; phone: string; invoiceRef: string; externalRef: string },
  ) {
    const response = await fetch(gateway.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${gateway.key}`,
        'Idempotency-Key': payload.invoiceRef,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    }).catch(() => null);
    if (response?.ok) return true;
    this.logger.warn(`Passerelle ${payload.provider}, demande ${payload.invoiceRef}, transmission à vérifier (HTTP ${response?.status ?? 'indisponible'}).`);
    return false;
  }

  async listByPharmacy(user: AuthUser, pharmacyId: number) {
    await this.core.assertPharmacyAccess(user, pharmacyId);
    const rows = await this.prisma.payment.findMany({ where: { pharmacyId }, orderBy: { createdAt: 'desc' } });
    return rows.map(serializePayment);
  }

  async createRequest(user: AuthUser, pharmacyId: number, dto: CreatePaymentDto) {
    const pharmacy = await this.core.assertPharmacyAccess(user, pharmacyId);
    this.assertCanSubscribe(pharmacy);
    if (dto.method === 'Carte bancaire') {
      throw new BadRequestException('Le paiement par carte sera disponible via une page hébergée par un prestataire.');
    }
    const provider = MOBILE_MONEY_PROVIDERS.find(p => p.toLowerCase() === dto.provider?.trim().toLowerCase());
    const payerPhone = dto.payerPhone?.trim().replace(/[ .()-]/g, '') || '';
    if (!provider || !/^\+?\d{6,15}$/.test(payerPhone)) {
      throw new BadRequestException('Renseignez un opérateur Mobile Money et un numéro valide de 6 à 15 chiffres.');
    }

    const requestId = dto.requestId?.toLowerCase() || randomUUID();
    const invoiceRef = `FACT-${pharmacyId}-${requestId}`;
    const existing = await this.prisma.payment.findUnique({ where: { invoiceRef } });
    if (existing) return this.matchExisting(existing, dto, provider, payerPhone);

    const plan = await this.prisma.plan.findUnique({ where: { name: dto.plan } });
    if (!plan) throw new BadRequestException('Formule tarifaire introuvable.');
    const amount = plan[PERIOD_TO_PLAN_FIELD[dto.period]];
    if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Tarif de la formule invalide.');

    const live = this.getGatewayConfig().mode === 'live';
    const gateway = live ? this.operatorGateway(provider) : null;
    if (live && !gateway) throw new ServiceUnavailableException('Cet opérateur Mobile Money est indisponible.');
    const externalRef = `MM-${pharmacyId}-${requestId}`;
    const payment = await this.prisma.serializable(async tx => {
      const currentPharmacy = await this.core.assertPharmacyAccess(user, pharmacyId, tx);
      this.assertCanSubscribe(currentPharmacy);
      await this.assertCompatibleQuota(pharmacyId, dto.plan, tx);
      const created = await tx.payment.create({
        data: { pharmacyId, plan: dto.plan, amount, period: dto.period, provider, payerPhone, invoiceRef, externalRef },
      });
      await this.core.audit(user, 'Demande de paiement Mobile Money créée', 'Paiement', created.id, tx);
      return created;
    }).catch(error => {
      if (error?.code !== 'P2002') throw error;
      return null;
    });
    if (!payment) {
      const concurrent = await this.prisma.payment.findUniqueOrThrow({ where: { invoiceRef } });
      return this.matchExisting(concurrent, dto, provider, payerPhone);
    }

    const sent = gateway
      ? await this.dispatchLiveOperatorPush(gateway, {
        provider, amount, currency: PAYMENT_CURRENCY, phone: payerPhone, invoiceRef, externalRef,
      })
      : false;
    const latest = gateway ? await this.prisma.payment.findUniqueOrThrow({ where: { id: payment.id } }) : payment;
    return { ...serializePayment(latest), dispatch: gateway ? (sent ? 'sent' : 'uncertain') : 'manual' };
  }

  private assertCanSubscribe(pharmacy: { status: string; trialEndsAt: Date | null; subscriptionEndsAt: Date | null }) {
    if (!['Validée', 'Abonnement expiré'].includes(pharmacy.status) || !(pharmacy.trialEndsAt || pharmacy.subscriptionEndsAt)) {
      throw new ForbiddenException('Ce dossier doit être validé ou réactivé par l’administration avant un paiement.');
    }
  }

  private async assertCompatibleQuota(pharmacyId: number, plan: PlanName, tx: Prisma.TransactionClient) {
    const limit = PLAN_PRODUCT_LIMITS[plan];
    if (Number.isFinite(limit) && await this.core.activeProductCount(pharmacyId, tx) > limit) {
      throw new ConflictException(`Archivez suffisamment de produits avant d’activer la formule ${plan} (maximum ${limit} produits actifs).`);
    }
  }

  private matchExisting(payment: Parameters<typeof serializePayment>[0], dto: CreatePaymentDto, provider: string, payerPhone: string) {
    if (payment.plan !== dto.plan || payment.period !== dto.period || payment.provider !== provider || payment.payerPhone !== payerPhone) {
      throw new ConflictException('Cette référence de demande est déjà associée à un autre paiement.');
    }
    return { ...serializePayment(payment), dispatch: 'existing' };
  }

  /** Applique le résultat d'un paiement (utilisé par le webhook prestataire et par l'administration). */
  async applyStatus(paymentId: number, status: 'Confirmé' | 'Échoué', actor?: AuthUser | 'Passerelle Paiement', externalRef?: string) {
    const reference = status === 'Confirmé' ? externalRef?.trim() : undefined;
    const { updatedPayment, pharmacy, baseDate, confirmedAt } = await this.prisma.serializable(async tx => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) throw new NotFoundException('Paiement introuvable.');

      const isConfirm = status === 'Confirmé';
      if (isConfirm && (!reference || reference.length < 4 || [payment.invoiceRef, payment.invoiceRef.replace(/^FACT-/, 'MM-')].includes(reference))) {
        throw new BadRequestException('Renseignez la référence du règlement constaté.');
      }
      if (payment.status !== 'En attente') {
        if (payment.status !== status) throw new BadRequestException('Ce paiement a déjà été finalisé.');
        if (isConfirm && payment.externalRef !== reference) {
          throw new ConflictException('Ce paiement est déjà confirmé sous une autre référence.');
        }
        return { updatedPayment: payment, pharmacy: null, baseDate: null, confirmedAt: false };
      }

      const pharm = await tx.pharmacy.findUniqueOrThrow({ where: { id: payment.pharmacyId } });
      const plan = PLAN_NAMES.find(name => name === payment.plan);
      const period = Object.keys(PERIODS).find(key => key === payment.period) as Period | undefined;
      if (isConfirm) {
        this.assertCanSubscribe(pharm);
        if (!plan || !period) throw new BadRequestException('Formule ou période de la facture invalide.');
        await this.assertCompatibleQuota(pharm.id, plan, tx);
      }

      const claimed = await tx.payment.updateMany({
        where: { id: paymentId, status: 'En attente' },
        data: {
          status,
          externalRef: reference ?? payment.externalRef,
          processedAt: new Date(),
        },
      });
      if (claimed.count === 0) {
        const latest = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
        if (latest.status === status && (!isConfirm || latest.externalRef === reference)) return { updatedPayment: latest, pharmacy: null, baseDate: null, confirmedAt: false };
        throw new BadRequestException('Ce paiement a déjà été finalisé et ne peut plus être modifié.');
      }

      const updated = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
      let newExpiry: Date | null = null;

      if (isConfirm && plan && period) {
        const currentExpiry = pharm.subscriptionEndsAt || pharm.trialEndsAt;
        const anchor = currentExpiry && currentExpiry > new Date() ? new Date(currentExpiry) : new Date();
        const months = PERIODS[period];
        newExpiry = this.addMonthsSafe(anchor, months);

        await tx.pharmacy.update({
          where: { id: pharm.id },
          data: {
            subscription: plan,
            subscriptionEndsAt: newExpiry,
            trialEndsAt: null,
            status: 'Validée',
          },
        });

        await this.core.assignVerifiedBadge(pharm.id, tx);
      }

      await this.core.audit(actor, `Paiement ${status}`, 'Paiement', paymentId, tx);
      return { updatedPayment: updated, pharmacy: pharm, baseDate: newExpiry, confirmedAt: isConfirm };
    }).catch(error => {
      if (error?.code === 'P2002') throw new ConflictException('Cette référence de transaction est déjà enregistrée.');
      throw error;
    });

    if (confirmedAt && pharmacy && baseDate) {
      await this.core.notify(
        pharmacy.id,
        'Abonnement activé',
        `Paiement ${updatedPayment.invoiceRef} confirmé (${updatedPayment.plan} · ${updatedPayment.period}). Votre officine est active jusqu’au ${baseDate.toLocaleDateString('fr-FR')}.`,
        'success',
      );
    }

    return serializePayment(updatedPayment);
  }

  private parseWebhookTimestampMs(rawTimestamp: string | undefined): number | null {
    const value = rawTimestamp?.trim();
    if (!value) return null;
    if (/^\d{10}$/.test(value)) return Number(value) * 1000;
    if (/^\d{13}$/.test(value)) return Number(value);
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async handleWebhook(
    rawBody: string,
    signature: string | undefined,
    dto: PaymentWebhookDto,
    timestamp?: string,
  ) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
    if (!secret || secret.length < 32) throw new ForbiddenException('Secret webhook non configuré.');
    if (!timestamp) throw new ForbiddenException('Horodatage manquant (x-timestamp).');
    if (!signature) throw new ForbiddenException('Signature manquante (x-signature).');

    const timestampMs = this.parseWebhookTimestampMs(timestamp);
    if (timestampMs === null || Math.abs(Date.now() - timestampMs) > 5 * 60_000) {
      throw new ForbiddenException('Horodatage webhook invalide ou expiré.');
    }

    const expected = createHmac('sha256', secret).update(`${timestamp.trim()}.${rawBody}`).digest('hex');
    const sigBuf = Buffer.from(signature.trim());
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      throw new ForbiddenException('Signature webhook invalide.');
    }

    const payment = await this.prisma.payment.findUnique({ where: { invoiceRef: dto.invoiceRef } });
    if (!payment) throw new NotFoundException('Facture introuvable.');
    if (dto.status === 'Confirmé' && (dto.amount !== payment.amount || dto.currency !== PAYMENT_CURRENCY)) {
      throw new ConflictException('Le montant ou la devise du règlement ne correspond pas à la facture.');
    }
    return this.applyStatus(payment.id, dto.status, 'Passerelle Paiement', dto.externalRef);
  }
}

// ---------- Controller ----------
@ApiTags('Abonnements & paiements Mobile Money')
@Controller()
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) { }

  @Public()
  @Get('payments/config')
  config() {
    return this.svc.getGatewayConfig();
  }

  @ApiBearerAuth()
  @Roles('PHARMACIST', 'ADMIN')
  @Get('pharmacies/:pharmacyId/payments')
  list(@CurrentUser() user: AuthUser, @Param('pharmacyId', ParseIntPipe) pharmacyId: number) {
    return this.svc.listByPharmacy(user, pharmacyId);
  }

  @ApiBearerAuth()
  @Roles('PHARMACIST', 'ADMIN')
  @Post('pharmacies/:pharmacyId/payments')
  create(
    @CurrentUser() user: AuthUser,
    @Param('pharmacyId', ParseIntPipe) pharmacyId: number,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.svc.createRequest(user, pharmacyId, dto);
  }

  @Public()
  @Post('payments/webhook')
  webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-signature') signature: string | undefined,
    @Headers('x-timestamp') timestamp: string | undefined,
    @Body() dto: PaymentWebhookDto,
  ) {
    if (!req.rawBody) throw new ForbiddenException('Corps brut requis pour vérification de signature.');
    return this.svc.handleWebhook(req.rawBody.toString('utf8'), signature, dto, timestamp);
  }
}

@Module({ controllers: [PaymentsController], providers: [PaymentsService], exports: [PaymentsService] })
export class PaymentsModule { }
