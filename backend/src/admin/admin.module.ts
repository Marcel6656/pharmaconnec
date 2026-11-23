import {
  BadRequestException, Body, ConflictException, Controller, Delete, ForbiddenException, Get, Injectable, Module,
  NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Query, Res, StreamableFile,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CoreService } from '../common/core.service';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import {
  CONTACT_STATUSES, DAY_MS, PHARMACY_STATUSES, PLAN_NAMES, REPORT_STATUSES, ROLES, TRIAL_DAYS, VERIFIED_BADGE_KEY, VERIFIED_BADGE_NAME,
  ContactStatus, PharmacyStatus, PlanName, Role,
} from '../common/constants';
import { serializeBadge, serializePharmacy, serializePlan, serializeProduct } from '../common/serializers';
import { PRIVATE_UPLOAD_DIR } from '../common/uploads';
import { AuthService } from '../auth/auth.module';
import { PaymentsModule, PaymentsService } from '../payments/payments.module';
import { ProductsModule, ProductsService, UpdateProductStatusDto } from '../products/products.module';

// ---------- DTO ----------
export class AdminPharmacyStatusDto {
  @ApiProperty({ enum: PHARMACY_STATUSES }) @IsIn(PHARMACY_STATUSES) status: PharmacyStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) note?: string;
}

export class AdminUserStatusDto {
  @ApiProperty() @IsBoolean() active: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) reason?: string;
}

const PASSWORD_COMPLEXITY_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
const PASSWORD_COMPLEXITY_MSG = 'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre.';

export class AdminCreateUserDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ enum: ROLES }) @IsIn(ROLES) role: Role;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) @MaxLength(128) @Matches(PASSWORD_COMPLEXITY_RE, { message: PASSWORD_COMPLEXITY_MSG }) password: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() active?: boolean;
}

export class AdminUpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ enum: ROLES }) @IsOptional() @IsIn(ROLES) role?: Role;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
  @ApiPropertyOptional({ minLength: 8 }) @IsOptional() @IsString() @MinLength(8) @MaxLength(128) @Matches(PASSWORD_COMPLEXITY_RE, { message: PASSWORD_COMPLEXITY_MSG }) password?: string;
}

export class AdminCreatePharmacyDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) name: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) city: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) area: string;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(255) address: string;
  @ApiProperty() @IsString() @MinLength(6) @MaxLength(40) phone: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(80) license: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) responsible: string;
  @ApiPropertyOptional({ enum: PLAN_NAMES, default: 'Basic' }) @IsOptional() @IsIn(PLAN_NAMES) subscription?: PlanName;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() ownerId?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(-90) @Max(90) lat?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(-180) @Max(180) lng?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) documents?: string;
}

export class AdminHealthSectionDto {
  @ApiProperty({ type: [Object] }) @IsArray() alerts: Record<string, unknown>[];
  @ApiProperty({ type: [Object] }) @IsArray() news: Record<string, unknown>[];
  @ApiProperty({ type: [Object] }) @IsArray() emergencyNumbers: Record<string, unknown>[];
}

export class BadgeDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(80) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) description?: string;
  @ApiPropertyOptional({ default: 'mint' }) @IsOptional() @IsString() @MaxLength(30) color?: string;
  @ApiPropertyOptional({ default: 'shield' }) @IsOptional() @IsString() @MaxLength(30) icon?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() visible?: boolean;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) expiryDays?: number | null;
}

export class UpdatePlanDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(1) monthly?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(1) quarterly?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(1) yearly?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) description?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
}

export class AdminPaymentStatusDto {
  @ApiProperty({ enum: ['Confirmé', 'Échoué'] }) @IsIn(['Confirmé', 'Échoué']) status: 'Confirmé' | 'Échoué';
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) externalRef?: string;
}

export class AdminReportStatusDto {
  @ApiProperty({ enum: REPORT_STATUSES }) @IsIn(REPORT_STATUSES) status: (typeof REPORT_STATUSES)[number];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) adminNote?: string;
}

export class AdminContactUpdateDto {
  @ApiProperty({ enum: CONTACT_STATUSES }) @IsIn(CONTACT_STATUSES) status: ContactStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) adminNote?: string;
}

export class AdminCategoryDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(80) name: string;
}

export class AdminSettingsDto {
  @ApiProperty({ minimum: 1, maximum: 365 }) @Type(() => Number) @IsInt() @Min(1) @Max(365) freshnessDays: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(280) platformBanner?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) supportPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) supportEmail?: string;
}

export class AssignBadgeDto {
  @ApiProperty() @IsBoolean() checked: boolean;
}

// ---------- Service ----------
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly core: CoreService,
    private readonly payments: PaymentsService,
    private readonly productsService: ProductsService,
  ) {}

  async dashboard() {
    const [
      pharmaciesCount,
      validatedPharmacies,
      pendingPharmacies,
      suspendedOrExpiredPharmacies,
      productsCount,
      publishedProducts,
      pendingProducts,
      confirmedPayments,
      pendingPayments,
      openReports,
      openContacts,
      usersCount,
      activeUsersCount,
      freshnessDays,
    ] = await Promise.all([
      this.prisma.pharmacy.count(),
      this.prisma.pharmacy.count({ where: { status: 'Validée' } }),
      this.prisma.pharmacy.count({ where: { status: { in: ['En attente', 'En vérification'] } } }),
      this.prisma.pharmacy.count({ where: { status: { in: ['Suspendue', 'Abonnement expiré', 'Refusée'] } } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'Publié' } }),
      this.prisma.product.count({ where: { status: 'En attente' } }),
      this.prisma.payment.findMany({ where: { status: 'Confirmé' }, select: { amount: true } }),
      this.prisma.payment.count({ where: { status: 'En attente' } }),
      this.prisma.report.count({ where: { status: { in: ['À traiter', 'En cours'] } } }),
      this.prisma.contactMessage.count({ where: { status: { in: ['Nouveau', 'En cours'] } } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { active: true } }),
      this.core.getFreshnessDays(),
    ]);
    const confirmedRevenue = confirmedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return {
      pharmaciesCount,
      validatedPharmacies,
      pendingPharmacies,
      suspendedOrExpiredPharmacies,
      productsCount,
      publishedProducts,
      pendingProducts,
      confirmedPaymentsCount: confirmedPayments.length,
      pendingPayments,
      confirmedRevenue,
      openReports,
      openContacts,
      usersCount,
      activeUsersCount,
      freshnessDays,
    };
  }

  async pharmacies() {
    const rows = await this.prisma.pharmacy.findMany({
      include: {
        badges: { include: { badge: true } },
        documents: { select: { id: true, fileName: true, mimeType: true, size: true, createdAt: true } },
        _count: { select: { products: true } },
      },
      orderBy: { id: 'asc' },
    });
    return rows.map(p => ({
      ...serializePharmacy(p, { includePrivate: true, includeHiddenBadges: true, productsCount: p._count.products }),
      uploadedDocuments: p.documents,
    }));
  }

  async createPharmacy(user: AuthUser, dto: AdminCreatePharmacyDto) {
    const cleanLicense = dto.license.trim();
    const cleanEmail = dto.email.trim().toLowerCase();
    const created = await this.prisma.serializable(async tx => {
      const existingLicenses = await tx.pharmacy.findMany({ select: { license: true } });
      if (existingLicenses.some(row => row.license.trim().toLowerCase() === cleanLicense.toLowerCase())) {
        throw new ConflictException('Ce numéro d’autorisation ou de licence est déjà enregistré.');
      }
      let ownerId: number | null = dto.ownerId ?? null;
      if (ownerId != null) {
        const owner = await tx.user.findUnique({ where: { id: ownerId } });
        if (!owner) throw new NotFoundException('Compte propriétaire introuvable.');
        if (owner.role !== 'PHARMACIST') {
          throw new BadRequestException('Le compte propriétaire doit avoir le rôle PHARMACIST.');
        }
      } else {
        const matched = await tx.user.findUnique({ where: { email: cleanEmail } });
        if (matched && matched.role === 'PHARMACIST') ownerId = matched.id;
      }
      return tx.pharmacy.create({
        data: {
          ownerId,
          name: dto.name.trim(),
          city: dto.city.trim(),
          area: dto.area.trim(),
          address: dto.address.trim(),
          phone: dto.phone.trim(),
          email: cleanEmail,
          license: cleanLicense,
          responsible: dto.responsible.trim(),
          lat: dto.lat,
          lng: dto.lng,
          subscription: dto.subscription ?? 'Basic',
          documentsNote: dto.documents?.trim() ?? 'Créée par l’administration',
          status: 'En attente',
          preferences: { create: {} },
        },
        include: {
          badges: { include: { badge: true } },
          documents: { select: { id: true, fileName: true, mimeType: true, size: true, createdAt: true } },
          _count: { select: { products: true } },
        },
      });
    });
    await this.core.audit(user, `Officine créée : ${created.name}`, 'Pharmacie', created.id);
    return {
      ...serializePharmacy(created, { includePrivate: true, includeHiddenBadges: true, productsCount: created._count.products }),
      uploadedDocuments: created.documents,
    };
  }

  async deletePharmacy(user: AuthUser, id: number) {
    const existing = await this.prisma.pharmacy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pharmacie introuvable.');
    await this.prisma.pharmacy.delete({ where: { id } });
    await this.core.audit(user, `Officine supprimée : ${existing.name}`, 'Pharmacie', id);
    return { deleted: true, id };
  }

  async updatePharmacyStatus(user: AuthUser, id: number, status: PharmacyStatus, note?: string) {
    const cleanNote = note?.trim();
    const { finalStatus, startsTrial, changed } = await this.prisma.serializable(async tx => {
      const original = await tx.pharmacy.findUnique({ where: { id } });
      if (!original) throw new NotFoundException('Pharmacie introuvable.');
      const now = new Date();
      const previousExpiry = original.subscriptionEndsAt ?? original.trialEndsAt;
      if (status === 'Abonnement expiré' && (
        !['Validée', 'Abonnement expiré'].includes(original.status) || !previousExpiry || previousExpiry > now
      )) {
        throw new ConflictException('Une échéance dépassée et un dossier validé sont requis pour constater l’expiration.');
      }
      const startsTrial = status === 'Validée' && !previousExpiry;
      if (startsTrial && !await tx.pharmacyDocument.count({ where: { pharmacyId: id } })) {
        throw new ConflictException('Ajoutez les justificatifs au dossier avant sa première validation.');
      }
      const finalStatus = status === 'Validée' && !startsTrial && (!previousExpiry || previousExpiry <= now)
        ? 'Abonnement expiré' : status;
      const changed = original.status !== finalStatus || startsTrial;
      if (changed) {
        await tx.pharmacy.update({
          where: { id },
          data: { status: finalStatus, ...(startsTrial ? { trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * DAY_MS) } : {}) },
        });
      }
      if (finalStatus === 'Validée') await this.core.assignVerifiedBadge(id, tx);
      if (changed || cleanNote) {
        await this.core.audit(user, `Statut établissement : ${finalStatus}${cleanNote ? ` (${cleanNote})` : ''}`, 'Pharmacie', id, tx);
      }
      return { finalStatus, startsTrial, changed };
    });

    if (finalStatus === 'Validée' && changed) {
      await this.core.notify(
        id,
        'Établissement validé',
        startsTrial
          ? 'Votre établissement est validé. Votre essai gratuit de 14 jours commence maintenant.'
          : 'Votre établissement a été réactivé.',
        'success',
      );
    } else if ((changed || cleanNote) && (finalStatus === 'Refusée' || finalStatus === 'Suspendue')) {
      await this.core.notify(
        id,
        `Établissement ${finalStatus.toLowerCase()}`,
        cleanNote ||
          (finalStatus === 'Refusée'
            ? 'Votre dossier nécessite un ajustement administratif. Consultez le motif transmis par la plateforme.'
            : 'Votre fiche publique a été temporairement suspendue par l’administration.'),
        'warning',
      );
    } else if (cleanNote) {
      await this.core.notify(id, `Mise à jour dossier : ${finalStatus}`, cleanNote, 'info');
    }

    const updated = await this.prisma.pharmacy.findUniqueOrThrow({
      where: { id },
      include: { badges: { include: { badge: true } }, _count: { select: { products: true } } },
    });
    return serializePharmacy(updated, { includePrivate: true, includeHiddenBadges: true, productsCount: updated._count.products });
  }

  async downloadDocument(user: AuthUser, docId: number, res: Response) {
    const doc = await this.prisma.pharmacyDocument.findUnique({ where: { id: docId } });
    if (!doc) throw new NotFoundException('Justificatif introuvable.');
    const fullPath = join(PRIVATE_UPLOAD_DIR, doc.storedName);
    await this.core.audit(user, 'Justificatif téléchargé', 'Document', docId);
    res.set({
      'Content-Type': doc.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.fileName)}"`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    });
    if (existsSync(fullPath)) {
      return new StreamableFile(createReadStream(fullPath));
    }
    if (doc.content && doc.content.length > 0) {
      return new StreamableFile(Buffer.from(doc.content));
    }
    throw new NotFoundException('Fichier introuvable sur le serveur.');
  }

  async products() {
    const rows = await this.prisma.product.findMany({
      include: {
        pharmacy: { select: { id: true, name: true, city: true } },
        stockHistory: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
      orderBy: { id: 'desc' },
    });
    return rows.map(p => ({ ...serializeProduct(p), pharmacyName: p.pharmacy.name }));
  }

  updateProductStatus(user: AuthUser, id: number, dto: UpdateProductStatusDto) {
    return this.productsService.updateStatus(user, id, dto);
  }

  async removeProduct(user: AuthUser, id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable.');
    await this.prisma.product.delete({ where: { id } });
    await this.core.audit(user, 'Produit supprimé', 'Produit', id);
    return { deleted: true, id };
  }

  // --- Catégories officielles ---
  async categories() {
    const rows = await this.prisma.platformCategory.findMany({ orderBy: { position: 'asc' } });
    return rows.map(c => c.name);
  }

  async addCategory(user: AuthUser, name: string) {
    const clean = name.trim();
    if (clean.length < 2) throw new BadRequestException('Nom de catégorie requis.');
    await this.prisma.serializable(async tx => {
      const names = await tx.platformCategory.findMany({ select: { name: true } });
      if (names.some(category => category.name.toLowerCase() === clean.toLowerCase())) {
        throw new ConflictException('Cette catégorie officielle existe déjà.');
      }
      await tx.platformCategory.create({ data: { name: clean, position: names.length } });
    });
    await this.core.audit(user, `Catégorie ajoutée : ${clean}`, 'Catégorie');
    return this.categories();
  }

  async renameCategory(user: AuthUser, oldName: string, newName: string) {
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    if (cleanNew.length < 2) throw new BadRequestException('Nom de catégorie requis.');
    await this.prisma.serializable(async tx => {
      const existing = await tx.platformCategory.findFirst({ where: { name: cleanOld } });
      if (!existing) throw new NotFoundException('Catégorie officielle introuvable.');
      if (cleanOld === cleanNew) return;
      const names = await tx.platformCategory.findMany({ select: { name: true } });
      if (names.some(c => c.name.toLowerCase() === cleanNew.toLowerCase() && c.name !== cleanOld)) {
        throw new ConflictException('Une catégorie officielle porte déjà ce nom.');
      }
      await tx.platformCategory.update({ where: { id: existing.id }, data: { name: cleanNew } });
      await tx.product.updateMany({ where: { category: cleanOld }, data: { category: cleanNew } });
    });
    await this.core.audit(user, `Catégorie renommée : ${cleanOld} -> ${cleanNew}`, 'Catégorie');
    return this.categories();
  }

  async removeCategory(user: AuthUser, name: string) {
    await this.prisma.serializable(async tx => {
      const count = await tx.platformCategory.count();
      if (count <= 1) throw new BadRequestException('Au moins une catégorie officielle doit être conservée.');
      if (await tx.product.count({ where: { category: name } })) {
        throw new ConflictException('Réaffectez les produits de cette catégorie avant de la supprimer.');
      }
      await tx.platformCategory.deleteMany({ where: { name } });
    });
    await this.core.audit(user, `Catégorie supprimée : ${name}`, 'Catégorie');
    return this.categories();
  }

  // --- Badges ---
  async badges() {
    const rows = await this.prisma.badge.findMany({ orderBy: { id: 'asc' } });
    return rows.map(serializeBadge);
  }

  async createBadge(user: AuthUser, dto: BadgeDto) {
    const name = this.customBadgeName(dto.name);
    const created = await this.prisma.badge.create({
      data: {
        name,
        description: dto.description?.trim() ?? '',
        color: dto.color ?? 'mint',
        icon: dto.icon ?? 'shield',
        visible: dto.visible ?? true,
        expiryDays: dto.expiryDays ?? null,
      },
    });
    await this.core.audit(user, 'Badge créé', 'Badge', created.id);
    return serializeBadge(created);
  }

  async updateBadge(user: AuthUser, id: number, dto: BadgeDto) {
    const badge = await this.prisma.badge.findUnique({ where: { id } });
    if (!badge) throw new NotFoundException('Badge introuvable.');
    const isSystemVerified = badge.system || badge.key === VERIFIED_BADGE_KEY;
    if (isSystemVerified && (dto.visible === false || (dto.expiryDays != null) || dto.name.trim() !== VERIFIED_BADGE_NAME)) {
      throw new ForbiddenException('Le nom, la visibilité et la validité du badge de vérification sont réservés au système.');
    }
    const updated = await this.prisma.badge.update({
      where: { id },
      data: {
        name: isSystemVerified ? VERIFIED_BADGE_NAME : this.customBadgeName(dto.name),
        description: dto.description?.trim() ?? badge.description,
        color: dto.color ?? badge.color,
        icon: dto.icon ?? badge.icon,
        visible: isSystemVerified ? true : (dto.visible ?? badge.visible),
        expiryDays: isSystemVerified ? null : (dto.expiryDays !== undefined ? dto.expiryDays : badge.expiryDays),
      },
    });
    await this.core.audit(user, 'Badge modifié', 'Badge', id);
    return serializeBadge(updated);
  }

  private customBadgeName(value: string) {
    const name = value.trim();
    if (name.length < 2) throw new BadRequestException('Nom de badge requis.');
    if (name.localeCompare(VERIFIED_BADGE_NAME, 'fr', { sensitivity: 'base' }) === 0) {
      throw new ConflictException('Ce nom est réservé au badge système de vérification.');
    }
    return name;
  }

  async deleteBadge(user: AuthUser, id: number) {
    const badge = await this.prisma.badge.findUnique({ where: { id } });
    if (!badge) throw new NotFoundException('Badge introuvable.');
    if (badge.system || badge.key === VERIFIED_BADGE_KEY) {
      throw new ForbiddenException('Le badge réservé « Pharmacie vérifiée » ne peut pas être supprimé.');
    }
    await this.prisma.badge.delete({ where: { id } });
    await this.core.audit(user, 'Badge supprimé', 'Badge', id);
    return { deleted: true, id };
  }

  async setPharmacyBadge(user: AuthUser, pharmacyId: number, badgeId: number, checked: boolean) {
    const [pharmacy, badge] = await Promise.all([
      this.prisma.pharmacy.findUnique({ where: { id: pharmacyId } }),
      this.prisma.badge.findUnique({ where: { id: badgeId } }),
    ]);
    if (!pharmacy || !badge) throw new NotFoundException('Pharmacie ou badge introuvable.');
    if (badge.system || badge.key === VERIFIED_BADGE_KEY) {
      throw new ForbiddenException('Le badge de vérification est géré automatiquement par le statut de l’établissement.');
    }
    if (checked) {
      await this.prisma.pharmacyBadge.upsert({
        where: { pharmacyId_badgeId: { pharmacyId, badgeId } },
        update: { assignedAt: new Date() },
        create: { pharmacyId, badgeId },
      });
    } else {
      await this.prisma.pharmacyBadge.deleteMany({ where: { pharmacyId, badgeId } });
    }
    await this.core.audit(user, checked ? 'Badge attribué' : 'Badge retiré', 'Pharmacie', pharmacyId);
    const updated = await this.prisma.pharmacy.findUniqueOrThrow({
      where: { id: pharmacyId },
      include: { badges: { include: { badge: true } }, _count: { select: { products: true } } },
    });
    return serializePharmacy(updated, { includePrivate: true, includeHiddenBadges: true, productsCount: updated._count.products });
  }

  // --- Formules & Paiements ---
  async plans() {
    const rows = await this.prisma.plan.findMany({ orderBy: { position: 'asc' } });
    return rows.map(serializePlan);
  }

  async updatePlan(user: AuthUser, name: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.plan.findUnique({ where: { name } });
    if (!plan) throw new NotFoundException('Formule introuvable.');
    const updated = await this.prisma.plan.update({
      where: { name },
      data: {
        monthly: dto.monthly ?? plan.monthly,
        quarterly: dto.quarterly ?? plan.quarterly,
        yearly: dto.yearly ?? plan.yearly,
        description: dto.description?.trim() ?? plan.description,
        features: dto.features ? JSON.stringify(dto.features) : plan.features,
      },
    });
    await this.core.audit(user, `Formule ${name} mise à jour`, 'Formule');
    return serializePlan(updated);
  }

  async listPayments() {
    return this.prisma.payment.findMany({
      include: { pharmacy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePaymentStatus(user: AuthUser, id: number, dto: AdminPaymentStatusDto) {
    return this.payments.applyStatus(id, dto.status, user, dto.externalRef);
  }

  // --- Signalements & Messages contact ---
  async listReports() {
    return this.prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateReportStatus(user: AuthUser, id: number, status: string, adminNote?: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Signalement introuvable.');
    const updated = await this.prisma.report.update({ where: { id }, data: { status } });
    const cleanNote = adminNote?.trim();
    const auditLabel = cleanNote ? `Signalement ${status.toLowerCase()} · ${cleanNote}` : `Signalement ${status.toLowerCase()}`;
    await this.core.audit(user, auditLabel, 'Signalement', id);
    return { ...updated, ...(cleanNote ? { adminNote: cleanNote } : {}) };
  }

  async deleteReport(user: AuthUser, id: number) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Signalement introuvable.');
    await this.prisma.report.delete({ where: { id } });
    await this.core.audit(user, 'Signalement supprimé', 'Signalement', id);
    return { deleted: true, id };
  }

  async listContacts() {
    const rows = await this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(c => ({
      ...c,
      adminNote: (c.metadata as { adminNote?: string } | null)?.adminNote ?? '',
      date: c.createdAt.toISOString(),
    }));
  }

  async updateContactStatus(user: AuthUser, id: number, dto: AdminContactUpdateDto) {
    const existing = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Message de contact introuvable.');
    const prevMeta = (existing.metadata as Record<string, unknown> | null) ?? {};
    const metadata = {
      ...prevMeta,
      ...(dto.adminNote !== undefined ? { adminNote: dto.adminNote.trim() } : {}),
      updatedBy: user.email,
      updatedAt: new Date().toISOString(),
    };
    const updated = await this.prisma.contactMessage.update({
      where: { id },
      data: { status: dto.status, metadata },
    });
    await this.core.audit(user, `Message contact : ${dto.status}`, 'Contact', id);
    return {
      ...updated,
      adminNote: (updated.metadata as { adminNote?: string } | null)?.adminNote ?? '',
      date: updated.createdAt.toISOString(),
    };
  }

  async deleteContact(user: AuthUser, id: number) {
    const existing = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Message de contact introuvable.');
    await this.prisma.contactMessage.delete({ where: { id } });
    await this.core.audit(user, 'Message contact supprimé', 'Contact', id);
    return { deleted: true, id };
  }

  // --- Gouvernance utilisateurs ---
  async listUsers() {
    const rows = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
        phone: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { pharmacies: true } },
      },
      orderBy: { id: 'asc' },
    });
    return rows.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      provider: u.provider,
      phone: u.phone || '',
      active: u.active,
      pharmaciesCount: u._count.pharmacies,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async updateUserStatus(currentAdmin: AuthUser, id: number, dto: AdminUserStatusDto) {
    const updated = await this.prisma.serializable(async tx => {
      const target = await tx.user.findUnique({ where: { id } });
      if (!target) throw new NotFoundException('Compte utilisateur introuvable.');
      if (currentAdmin.id === id && !dto.active) {
        throw new ForbiddenException('Vous ne pouvez pas suspendre votre propre compte administrateur.');
      }
      if (target.role === 'ADMIN' && !dto.active) {
        const otherAdmins = await tx.user.count({
          where: { role: 'ADMIN', active: true, id: { not: id } },
        });
        if (otherAdmins === 0) {
          throw new ForbiddenException('Impossible de suspendre le dernier administrateur actif.');
        }
      }
      return tx.user.update({
        where: { id },
        data: {
          active: dto.active,
          ...(dto.active ? {} : { tokenVersion: { increment: 1 } }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          provider: true,
          phone: true,
          active: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { pharmacies: true } },
        },
      });
    });
    const cleanReason = dto.reason?.trim();
    await this.core.audit(
      currentAdmin,
      `Compte ${dto.active ? 'réactivé' : 'suspendu'}${cleanReason ? ` (${cleanReason})` : ''}`,
      'Utilisateur',
      id,
    );
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      provider: updated.provider,
      phone: updated.phone || '',
      active: updated.active,
      pharmaciesCount: updated._count.pharmacies,
      lastLoginAt: updated.lastLoginAt ? updated.lastLoginAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  private serializeAdminUser(u: {
    id: number;
    email: string;
    name: string;
    role: string;
    provider: string;
    phone: string | null;
    active: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    _count: { pharmacies: number };
  }) {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      provider: u.provider,
      phone: u.phone || '',
      active: u.active,
      pharmaciesCount: u._count.pharmacies,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    };
  }

  async createUser(currentAdmin: AuthUser, dto: AdminCreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await AuthService.hash(dto.password);
    const created = await this.prisma.serializable(async tx => {
      if (await tx.user.findUnique({ where: { email } })) {
        throw new ConflictException('Un compte existe déjà avec cet e-mail.');
      }
      return tx.user.create({
        data: {
          email,
          name: dto.name.trim(),
          role: dto.role,
          phone: dto.phone?.trim() || null,
          active: dto.active ?? true,
          provider: 'email',
          passwordHash,
        },
        select: {
          id: true, email: true, name: true, role: true, provider: true, phone: true,
          active: true, lastLoginAt: true, createdAt: true, _count: { select: { pharmacies: true } },
        },
      });
    });
    await this.core.audit(currentAdmin, `Compte créé (${created.role})`, 'Utilisateur', created.id);
    return this.serializeAdminUser(created);
  }

  async updateUser(currentAdmin: AuthUser, id: number, dto: AdminUpdateUserDto) {
    const nextPasswordHash = dto.password ? await AuthService.hash(dto.password) : undefined;
    const updated = await this.prisma.serializable(async tx => {
      const target = await tx.user.findUnique({ where: { id } });
      if (!target) throw new NotFoundException('Compte utilisateur introuvable.');
      if (currentAdmin.id === id && (dto.active === false || (dto.role && dto.role !== 'ADMIN'))) {
        throw new ForbiddenException('Vous ne pouvez pas désactiver ou rétrograder votre propre compte administrateur.');
      }
      if (target.role === 'ADMIN' && (dto.active === false || (dto.role && dto.role !== 'ADMIN'))) {
        const otherAdmins = await tx.user.count({
          where: { role: 'ADMIN', active: true, id: { not: id } },
        });
        if (otherAdmins === 0) {
          throw new ForbiddenException('Impossible de désactiver ou rétrograder le dernier administrateur actif.');
        }
      }
      const nextEmail = dto.email?.trim().toLowerCase();
      if (nextEmail && nextEmail !== target.email) {
        const dup = await tx.user.findUnique({ where: { email: nextEmail } });
        if (dup) throw new ConflictException('Un compte utilise déjà cet e-mail.');
      }
      const revokeTokens = dto.active === false || (dto.role && dto.role !== target.role) || Boolean(nextPasswordHash);
      return tx.user.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(nextEmail !== undefined ? { email: nextEmail } : {}),
          ...(dto.role !== undefined ? { role: dto.role } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
          ...(dto.active !== undefined ? { active: dto.active } : {}),
          ...(nextPasswordHash ? { passwordHash: nextPasswordHash } : {}),
          ...(revokeTokens ? { tokenVersion: { increment: 1 } } : {}),
        },
        select: {
          id: true, email: true, name: true, role: true, provider: true, phone: true,
          active: true, lastLoginAt: true, createdAt: true, _count: { select: { pharmacies: true } },
        },
      });
    });
    await this.core.audit(currentAdmin, 'Compte utilisateur modifié', 'Utilisateur', id);
    return this.serializeAdminUser(updated);
  }

  async deleteUser(currentAdmin: AuthUser, id: number) {
    await this.prisma.serializable(async tx => {
      const target = await tx.user.findUnique({ where: { id } });
      if (!target) throw new NotFoundException('Compte utilisateur introuvable.');
      if (currentAdmin.id === id) {
        throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte administrateur.');
      }
      if (target.role === 'ADMIN') {
        const otherAdmins = await tx.user.count({
          where: { role: 'ADMIN', active: true, id: { not: id } },
        });
        if (otherAdmins === 0) {
          throw new ForbiddenException('Impossible de supprimer le dernier administrateur actif.');
        }
      }
      await tx.user.delete({ where: { id } });
    });
    await this.core.audit(currentAdmin, 'Compte utilisateur supprimé', 'Utilisateur', id);
    return { deleted: true, id };
  }

  // --- Rubrique Santé (alertes, actualités, numéros d'urgence) ---
  async getHealthSection() {
    const row = await this.prisma.setting.findUnique({ where: { key: 'healthSection' } });
    if (!row?.jsonValue || typeof row.jsonValue !== 'object') return null;
    return row.jsonValue as Record<string, unknown>;
  }

  async saveHealthSection(user: AuthUser, dto: AdminHealthSectionDto) {
    const payload = {
      alerts: dto.alerts,
      news: dto.news,
      emergencyNumbers: dto.emergencyNumbers,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
    };
    await this.prisma.setting.upsert({
      where: { key: 'healthSection' },
      update: { value: 'configured', jsonValue: payload as any, valueType: 'json' },
      create: { key: 'healthSection', value: 'configured', jsonValue: payload as any, valueType: 'json' },
    });
    await this.core.audit(
      user,
      `Rubrique Santé mise à jour (${dto.alerts.length} alertes, ${dto.news.length} actualités, ${dto.emergencyNumbers.length} urgences)`,
      'Rubrique Santé',
    );
    return payload;
  }

  // --- Paramètres & Audit ---
  async settings() {
    const [freshnessDays, bannerRow, supportPhoneRow, supportEmailRow] = await Promise.all([
      this.core.getFreshnessDays(),
      this.prisma.setting.findUnique({ where: { key: 'platformBanner' } }),
      this.prisma.setting.findUnique({ where: { key: 'supportPhone' } }),
      this.prisma.setting.findUnique({ where: { key: 'supportEmail' } }),
    ]);
    return {
      freshnessDays,
      platformBanner: bannerRow?.value || '',
      supportPhone: supportPhoneRow?.value || '+235 60 70 91 92',
      supportEmail: supportEmailRow?.value || 'tginnovation7@gmail.com',
    };
  }

  async updateSettings(user: AuthUser, dto: AdminSettingsDto) {
    await this.core.setFreshnessDays(dto.freshnessDays);
    if (dto.platformBanner !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: 'platformBanner' },
        update: { value: dto.platformBanner.trim() },
        create: { key: 'platformBanner', value: dto.platformBanner.trim() },
      });
    }
    if (dto.supportPhone !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: 'supportPhone' },
        update: { value: dto.supportPhone.trim() },
        create: { key: 'supportPhone', value: dto.supportPhone.trim() },
      });
    }
    if (dto.supportEmail !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: 'supportEmail' },
        update: { value: dto.supportEmail.trim() },
        create: { key: 'supportEmail', value: dto.supportEmail.trim() },
      });
    }
    await this.core.audit(user, `Paramètres plateforme mis à jour (fraîcheur ${dto.freshnessDays} jours)`, 'Paramètres');
    return this.settings();
  }

  async auditLogs(limit = 200, actor?: string, q?: string) {
    const safeLimit = Math.min(Math.max(Math.trunc(Number(limit) || 200), 1), 500);
    const rows = await this.prisma.auditLog.findMany({
      where: actor && actor !== 'Tous' ? { actor } : undefined,
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
    const needle = q?.trim().toLowerCase();
    const filtered = needle
      ? rows.filter(l => `${l.actor} ${l.action} ${l.entity} ${l.entityId ?? ''}`.toLowerCase().includes(needle))
      : rows;
    return filtered.map(l => ({ ...l, date: l.createdAt.toISOString() }));
  }

  /** Tâche planifiée : passe automatiquement en « Abonnement expiré » les officines dont l'essai ou l'abonnement est dépassé. */
  @Cron(CronExpression.EVERY_HOUR)
  async expireOverduePharmacies() {
    const now = new Date();
    const where = {
      status: 'Validée',
      OR: [
        { subscriptionEndsAt: { lte: now } },
        { subscriptionEndsAt: null, trialEndsAt: { lte: now } },
        { subscriptionEndsAt: null, trialEndsAt: null },
      ],
    };
    const overdue = await this.prisma.pharmacy.findMany({ where, select: { id: true } });
    let expired = 0;
    for (const ph of overdue) {
      const changed = await this.prisma.pharmacy.updateMany({
        where: { id: ph.id, ...where }, data: { status: 'Abonnement expiré' },
      });
      if (!changed.count) continue;
      expired++;
      await this.core.notify(
        ph.id,
        'Abonnement ou essai expiré',
        'Votre fiche a été masquée du catalogue public. Renouvelez votre formule pour la réactiver.',
        'warning',
      );
      await this.core.audit('Système', 'Expiration automatique de l’abonnement', 'Pharmacie', ph.id);
    }
    return expired;
  }
}

// ---------- Controller ----------
@ApiTags('Administration')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.svc.dashboard();
  }

  @Get('pharmacies')
  pharmacies() {
    return this.svc.pharmacies();
  }

  @Post('pharmacies')
  createPharmacy(@CurrentUser() user: AuthUser, @Body() dto: AdminCreatePharmacyDto) {
    return this.svc.createPharmacy(user, dto);
  }

  @Delete('pharmacies/:id')
  deletePharmacy(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.deletePharmacy(user, id);
  }

  @Patch('pharmacies/:id/status')
  pharmacyStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminPharmacyStatusDto,
  ) {
    return this.svc.updatePharmacyStatus(user, id, dto.status, dto.note);
  }

  @Get('documents/:docId/download')
  downloadDocument(
    @CurrentUser() user: AuthUser,
    @Param('docId', ParseIntPipe) docId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.svc.downloadDocument(user, docId, res);
  }

  @Get('products')
  products() {
    return this.svc.products();
  }

  @Patch('products/:id/status')
  productStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.svc.updateProductStatus(user, id, dto);
  }

  @Delete('products/:id')
  removeProduct(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.removeProduct(user, id);
  }

  @Get('categories')
  categories() {
    return this.svc.categories();
  }

  @Post('categories')
  addCategory(@CurrentUser() user: AuthUser, @Body() dto: AdminCategoryDto) {
    return this.svc.addCategory(user, dto.name);
  }

  @Patch('categories/:name')
  renameCategory(@CurrentUser() user: AuthUser, @Param('name') name: string, @Body() dto: AdminCategoryDto) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(name);
    } catch {
      throw new BadRequestException('Nom de catégorie invalide.');
    }
    return this.svc.renameCategory(user, decoded, dto.name);
  }

  @Delete('categories/:name')
  removeCategory(@CurrentUser() user: AuthUser, @Param('name') name: string) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(name);
    } catch {
      throw new BadRequestException('Nom de catégorie invalide.');
    }
    return this.svc.removeCategory(user, decoded);
  }

  @Get('badges')
  badges() {
    return this.svc.badges();
  }

  @Post('badges')
  createBadge(@CurrentUser() user: AuthUser, @Body() dto: BadgeDto) {
    return this.svc.createBadge(user, dto);
  }

  @Patch('badges/:id')
  updateBadge(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() dto: BadgeDto) {
    return this.svc.updateBadge(user, id, dto);
  }

  @Delete('badges/:id')
  deleteBadge(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteBadge(user, id);
  }

  @Put('pharmacies/:id/badges/:badgeId')
  setPharmacyBadge(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('badgeId', ParseIntPipe) badgeId: number,
    @Body() dto: AssignBadgeDto,
  ) {
    return this.svc.setPharmacyBadge(user, id, badgeId, dto.checked);
  }

  @Get('plans')
  plans() {
    return this.svc.plans();
  }

  @Patch('plans/:name')
  updatePlan(@CurrentUser() user: AuthUser, @Param('name') name: string, @Body() dto: UpdatePlanDto) {
    let decodedName = name;
    try {
      decodedName = decodeURIComponent(name);
    } catch {
      throw new BadRequestException('Nom de formule invalide.');
    }
    return this.svc.updatePlan(user, decodedName, dto);
  }

  @Get('payments')
  payments() {
    return this.svc.listPayments();
  }

  @Patch('payments/:id/status')
  paymentStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminPaymentStatusDto,
  ) {
    return this.svc.updatePaymentStatus(user, id, dto);
  }

  @Get('reports')
  reports() {
    return this.svc.listReports();
  }

  @Patch('reports/:id/status')
  reportStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminReportStatusDto,
  ) {
    return this.svc.updateReportStatus(user, id, dto.status, dto.adminNote);
  }

  @Delete('reports/:id')
  deleteReport(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteReport(user, id);
  }

  @Get('contacts')
  contacts() {
    return this.svc.listContacts();
  }

  @Patch('contacts/:id')
  contactStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminContactUpdateDto,
  ) {
    return this.svc.updateContactStatus(user, id, dto);
  }

  @Delete('contacts/:id')
  deleteContact(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteContact(user, id);
  }

  @Get('users')
  users() {
    return this.svc.listUsers();
  }

  @Post('users')
  createUser(@CurrentUser() user: AuthUser, @Body() dto: AdminCreateUserDto) {
    return this.svc.createUser(user, dto);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.svc.updateUser(user, id, dto);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUserStatusDto,
  ) {
    return this.svc.updateUserStatus(user, id, dto);
  }

  @Delete('users/:id')
  deleteUser(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteUser(user, id);
  }

  @Get('health-section')
  healthSection() {
    return this.svc.getHealthSection();
  }

  @Put('health-section')
  saveHealthSection(@CurrentUser() user: AuthUser, @Body() dto: AdminHealthSectionDto) {
    return this.svc.saveHealthSection(user, dto);
  }

  @Get('settings')
  settings() {
    return this.svc.settings();
  }

  @Patch('settings')
  updateSettings(@CurrentUser() user: AuthUser, @Body() dto: AdminSettingsDto) {
    return this.svc.updateSettings(user, dto);
  }

  @Get('audit-logs')
  auditLogs(
    @Query('limit') limit?: string,
    @Query('actor') actor?: string,
    @Query('q') q?: string,
  ) {
    return this.svc.auditLogs(limit ? Number(limit) : 200, actor, q);
  }

  @Get('audit-logs/export')
  async exportAudit(@Res() res: Response) {
    const logs = await this.svc.auditLogs(500);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="pharmaconnect-audit-logs.json"');
    res.send(JSON.stringify(logs, null, 2));
  }
}

@Module({
  imports: [PaymentsModule, ProductsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
