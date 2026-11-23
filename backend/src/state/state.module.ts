import { Controller, Get, GoneException, Header, Headers, Injectable, Module, Put, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { CoreService } from '../common/core.service';
import { AuthUser, CurrentUser, Public, Roles } from '../common/decorators';
import { VERIFIED_BADGE_KEY } from '../common/constants';
import { expiryOf, formatFrDate, isBadgeActive, parsePlanFeatures } from '../common/serializers';
import { MessagesModule, MessagesService } from '../messages/messages.module';
import { PublicModule, PublicService } from '../public/public.module';

@Injectable()
export class StateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly core: CoreService,
    private readonly messages: MessagesService,
    private readonly publicCatalog: PublicService,
  ) { }

  private effectiveOwnerId(user?: AuthUser): number | null {
    if (!user || user.role !== 'PHARMACIST') return null;
    return this.core.effectiveUserId(user);
  }

  async getState(user?: AuthUser) {
    const isAdmin = user?.role === 'ADMIN';
    const isPharmacist = user?.role === 'PHARMACIST';
    const ownerId = this.effectiveOwnerId(user);
    const ownerScope = ownerId === null ? undefined : { ownerId };
    const publicPharmacy = this.publicCatalog.visiblePharmacyWhere();
    const publicProduct = await this.publicCatalog.visibleProductWhere();
    const pharmacyScope = isAdmin ? undefined : ownerScope ?? publicPharmacy;
    const productScope = isAdmin ? undefined : ownerScope ? { pharmacy: ownerScope } : publicProduct;
    const seesPrivateRecords = isAdmin || isPharmacist;
    const privatePharmacyScope = isAdmin ? undefined : { pharmacy: ownerScope };

    const [
      products,
      pharmacies,
      messages,
      badges,
      payments,
      plans,
      notices,
      reports,
      auditLogs,
      categories,
      freshnessDays,
      prefs,
      customCats,
    ] = await Promise.all([
      this.prisma.product.findMany({ where: productScope, include: { stockHistory: { where: seesPrivateRecords ? undefined : { id: 0 }, orderBy: { createdAt: 'desc' }, take: 50 } }, orderBy: { id: 'asc' } }),
      this.prisma.pharmacy.findMany({ where: pharmacyScope, include: { badges: { include: { badge: true } } }, orderBy: { id: 'asc' } }),
      user?.role === 'VISITOR'
        ? this.messages.visitorThreads(user).then(roots => roots.flatMap(root => [root, ...root.replies]).sort((a, b) => a.id - b.id))
        : isPharmacist
          ? this.prisma.message.findMany({
            where: { pharmacy: ownerScope },
            include: { thread: { select: { pharmacyId: true, threadId: true } } },
            orderBy: { id: 'asc' },
          }).then(rows => rows.filter(row =>
            row.threadId === null || (row.thread?.pharmacyId === row.pharmacyId && row.thread.threadId === null)))
          : Promise.resolve([]),
      this.prisma.badge.findMany({ orderBy: { id: 'asc' } }),
      isAdmin || isPharmacist ? this.prisma.payment.findMany({ where: privatePharmacyScope, orderBy: { id: 'desc' } }) : Promise.resolve([]),
      this.prisma.plan.findMany({ orderBy: { position: 'asc' } }),
      isAdmin || isPharmacist ? this.prisma.notice.findMany({ where: privatePharmacyScope, orderBy: { id: 'desc' } }) : Promise.resolve([]),
      isAdmin ? this.prisma.report.findMany({ orderBy: { id: 'desc' } }) : Promise.resolve([]),
      isAdmin
        ? this.prisma.auditLog.findMany({
          orderBy: { id: 'desc' },
          take: 500,
        })
        : Promise.resolve([]),
      this.prisma.platformCategory.findMany({ orderBy: { position: 'asc' } }),
      this.core.getFreshnessDays(),
      isAdmin || isPharmacist ? this.prisma.pharmacyPreferences.findMany({ where: privatePharmacyScope }) : Promise.resolve([]),
      isAdmin || isPharmacist ? this.prisma.customCategory.findMany({ where: privatePharmacyScope }) : Promise.resolve([]),
    ]);

    const productCounts = new Map<number, number>();
    for (const product of products) {
      productCounts.set(product.pharmacyId, (productCounts.get(product.pharmacyId) ?? 0) + 1);
    }

    const preferences: Record<number, { notificationMessages: boolean; subscriptionReminders: boolean; lowStockAlerts: boolean; lowStockThreshold: number }> = {};
    for (const pr of prefs) {
      preferences[pr.pharmacyId] = {
        notificationMessages: pr.notificationMessages,
        subscriptionReminders: pr.subscriptionReminders,
        lowStockAlerts: pr.lowStockAlerts,
        lowStockThreshold: pr.lowStockThreshold,
      };
    }

    const customCategories: Record<number, string[]> = {};
    for (const c of customCats) {
      if (!customCategories[c.pharmacyId]) customCategories[c.pharmacyId] = [];
      customCategories[c.pharmacyId].push(c.name);
    }

    return {
      products: products.map(p => {
        return {
          id: p.id,
          pharmacyId: p.pharmacyId,
          name: p.name,
          category: p.category,
          brand: p.brand,
          code: p.code,
          price: p.price,
          stock: p.stock,
          status: p.status,
          updated: formatFrDate(p.stockUpdatedAt),
          stockUpdatedAt: p.stockUpdatedAt.toISOString(),
          modifiedAt: seesPrivateRecords ? p.updatedAt.toISOString() : undefined,
          note: seesPrivateRecords ? p.note ?? undefined : undefined,
          description: p.description,
          imageDataUrl: p.imageUrl ?? undefined,
          stockHistory: seesPrivateRecords
            ? p.stockHistory?.slice().reverse().map(s => ({
              price: s.price,
              stock: s.stock,
              date: formatFrDate(s.createdAt),
            }))
            : undefined,
        };
      }),
      pharmacies: pharmacies.map(ph => {
        const exposedBadges = isAdmin
          ? ph.badges
          : ph.badges.filter(b => b.badge.visible && isBadgeActive(b.badge, b.assignedAt));
        return {
          id: ph.id,
          ...(seesPrivateRecords
            ? {
              ownerId: ph.ownerId ?? undefined,
              documents: ph.documentsNote ?? undefined,
              trialEndsAt: ph.trialEndsAt?.toISOString(),
              subscriptionEndsAt: ph.subscriptionEndsAt?.toISOString(),
              activeUntil: expiryOf(ph)?.toISOString(),
              subscription: ph.subscription,
            }
            : { publiclyVisible: true }),
          badgeAssignedAt: Object.fromEntries(exposedBadges.map(b => [String(b.badgeId), b.assignedAt.toISOString()])),
          name: ph.name,
          city: ph.city,
          area: ph.area,
          address: ph.address,
          phone: ph.phone,
          email: ph.email,
          license: seesPrivateRecords ? ph.license : '',
          responsible: ph.responsible,
          lat: ph.lat ?? undefined,
          lng: ph.lng ?? undefined,
          openingHours: ph.openingHours ?? undefined,
          status: ph.status,
          badgeIds: exposedBadges.map(b => b.badgeId),
          products: productCounts.get(ph.id) ?? 0,
          updated: formatFrDate(ph.updatedAt),
          coverImage: ph.coverImage ?? undefined,
        };
      }),
      messages: messages.map(m => ({
        id: m.id,
        pharmacyId: m.pharmacyId,
        threadId: m.threadId ?? undefined,
        visitorId: m.visitorEmail ?? undefined,
        sender: m.sender,
        phone: m.phone,
        subject: m.subject,
        body: m.body,
        date: m.createdAt.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        read: m.read,
        direction: m.direction,
      })),
      badges: badges
        .filter(b => isAdmin || b.visible)
        .map(b => ({
          id: b.id,
          name: b.name,
          description: b.description,
          color: b.color,
          icon: b.icon,
          visible: b.visible,
          expiryDays: b.expiryDays,
          system: b.system || b.key === VERIFIED_BADGE_KEY,
        })),
      payments: payments.map(pay => ({
        id: pay.id,
        pharmacyId: pay.pharmacyId,
        plan: pay.plan,
        amount: pay.amount,
        period: pay.period,
        date: pay.createdAt.toLocaleDateString('fr-FR'),
        status: pay.status,
        method: pay.method,
        provider: pay.provider ?? undefined,
        payerPhone: pay.payerPhone ?? undefined,
        invoiceRef: pay.invoiceRef,
        externalRef: pay.status === 'Confirmé' ? pay.externalRef ?? undefined : undefined,
      })),
      plans: plans.map(p => ({
        name: p.name,
        monthly: p.monthly,
        quarterly: p.quarterly,
        yearly: p.yearly,
        description: p.description,
        features: parsePlanFeatures(p.features),
      })),
      notices: notices.map(n => ({
        id: n.id,
        pharmacyId: n.pharmacyId,
        title: n.title,
        body: n.body,
        date: formatFrDate(n.createdAt),
        read: n.read,
        kind: n.kind,
      })),
      reports: reports.map(r => ({
        id: r.id,
        pharmacyId: r.pharmacyId,
        productId: r.productId ?? undefined,
        target: r.target,
        reason: r.reason,
        details: r.details,
        date: r.createdAt.toLocaleDateString('fr-FR'),
        status: r.status,
      })),
      auditLogs: auditLogs.map(a => ({
        id: a.id,
        actor: a.actor,
        action: a.action,
        entity: a.entity,
        entityId: a.entityId ?? undefined,
        date: a.createdAt.toLocaleString('fr-FR'),
      })),
      platformCategories: categories.map(c => c.name),
      freshnessDays,
      preferences,
      customCategories,
    };
  }

}

@ApiTags('État de l’interface')
@Controller('state')
export class StateController {
  constructor(private readonly svc: StateService) {}

  @Public()
  @Get()
  @Header('Cache-Control', 'private, no-store')
  @Header('Vary', 'Authorization, Origin')
  getState(@CurrentUser() user: AuthUser | undefined, @Headers('authorization') authorization?: string) {
    if (authorization && !user) throw new UnauthorizedException('Session expirée ou invalide.');
    return this.svc.getState(user);
  }

  @ApiBearerAuth()
  @Roles('ADMIN', 'PHARMACIST')
  @Put()
  syncState() {
    throw new GoneException('La synchronisation globale a été retirée. Utilisez les routes dédiées à chaque opération.');
  }
}

@Module({ imports: [MessagesModule, PublicModule], controllers: [StateController], providers: [StateService] })
export class StateModule {}
