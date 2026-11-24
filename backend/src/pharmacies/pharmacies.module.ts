import {
  BadRequestException, Body, ConflictException, Controller, Delete, ForbiddenException, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe,
  Patch, Post, UploadedFile, UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiProperty, ApiPropertyOptional, ApiTags, PartialType, PickType } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoreService } from '../common/core.service';
import { AuthUser, CurrentUser, Public, Roles } from '../common/decorators';
import { PLAN_NAMES, PlanName } from '../common/constants';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import {
  assertSafeUploadedFiles,
  cleanupUploadedFiles,
  DOC_TYPES,
  documentUploadOptions,
  IMAGE_TYPES,
  imageUploadOptions,
  PRIVATE_UPLOAD_DIR,
  publicUrl,
  readFileBufferAndHash,
  sanitizeFileName,
  sanitizeJsonRecord,
} from '../common/uploads';
import { serializePharmacy } from '../common/serializers';
import { AuthModule, AuthService } from '../auth/auth.module';

// ---------- DTO ----------
export class PharmacyProfileDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) name: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) city: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) area?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) address?: string;
  @ApiProperty() @IsString() @MinLength(6) @MaxLength(40) phone: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) responsible?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(-90) @Max(90) lat?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(-180) @Max(180) lng?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) openingHours?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() openingHoursJson?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}

export class RegisterPharmacyDto extends PharmacyProfileDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) declare area: string;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(255) declare address: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) declare responsible: string;
  @ApiProperty({ description: 'Numéro d’autorisation d’ouverture / licence' }) @IsString() @MinLength(3) @MaxLength(80) license: string;
  @ApiPropertyOptional({ enum: PLAN_NAMES, default: 'Basic' }) @IsOptional() @IsIn(PLAN_NAMES) plan?: PlanName;
  @ApiProperty({ description: 'Liste des justificatifs annoncés (les fichiers sont envoyés via /documents)' })
  @IsString() @MinLength(2) @MaxLength(500) documents: string;
  @ApiPropertyOptional({ description: 'Requis si non connecté : e-mail du compte professionnel' }) @IsOptional() @IsEmail() @MaxLength(254) accountEmail?: string;
  @ApiPropertyOptional({ description: 'Requis si non connecté (8 car. min, majuscule, minuscule et chiffre)' })
  @IsOptional() @IsString() @MinLength(8) @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/, { message: 'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre.' })
  password?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) accountName?: string;
}

export class UpdatePharmacyDto extends PartialType(PharmacyProfileDto) { }

export class PreferencesDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() notificationMessages?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() subscriptionReminders?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() lowStockAlerts?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(10000) lowStockThreshold?: number;
}

export class CategoryNameDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(60) name: string;
}

export class ProfileOnlyDto extends PickType(PharmacyProfileDto, ['name'] as const) { }

const include = { badges: { include: { badge: true } }, _count: { select: { products: true } } } as const;

// ---------- Service ----------
@Injectable()
export class PharmaciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly core: CoreService,
    private readonly auth: AuthService,
  ) { }

  private async full(id: number, includeHiddenBadges = false) {
    const p = await this.prisma.pharmacy.findUniqueOrThrow({ where: { id }, include });
    return serializePharmacy(p, { includePrivate: true, includeHiddenBadges, productsCount: p._count.products });
  }

  async register(user: AuthUser | undefined, dto: RegisterPharmacyDto) {
    if (user && user.role !== 'PHARMACIST') {
      throw new ForbiddenException('Seul un compte professionnel peut rattacher un établissement.');
    }
    if (!user && (!dto.accountEmail || !dto.password)) {
      throw new BadRequestException('E-mail professionnel et mot de passe requis pour créer le compte.');
    }

    const cleanLicense = dto.license.trim();
    if (cleanLicense.length < 3 || ![dto.name, dto.city, dto.area, dto.address, dto.phone, dto.responsible, dto.documents].every(value => value.trim().length >= 2)) {
      throw new BadRequestException('Renseignez les coordonnées et le dossier de l’établissement.');
    }
    const accountEmail = dto.accountEmail?.trim().toLowerCase();
    await this.core.assertDistributedRateLimit('pharmacy_register', accountEmail || user?.email || cleanLicense, 5, 10 * 60_000);
    const safeHours = sanitizeJsonRecord(dto.openingHoursJson);
    const safeMeta = sanitizeJsonRecord(dto.metadata);
    const passwordHash = !user && dto.password ? await AuthService.hash(dto.password) : undefined;

    const { pharmacy, ownerId, createdUser } = await this.prisma.serializable(async tx => {
      let resolvedOwnerId: number;
      let newUser: Awaited<ReturnType<typeof tx.user.create>> | undefined;

      if (user) {
        resolvedOwnerId = this.core.effectiveUserId(user);
      } else {
        if (await tx.user.findUnique({ where: { email: accountEmail! } })) {
          throw new ConflictException('Un compte existe déjà avec cet e-mail : connectez-vous pour ajouter un établissement.');
        }
        newUser = await tx.user.create({
          data: {
            email: accountEmail!,
            name: dto.accountName?.trim() || dto.responsible?.trim() || dto.name.trim(),
            passwordHash: passwordHash!,
            role: 'PHARMACIST',
          },
        });
        resolvedOwnerId = newUser.id;
      }

      const existingLicenses = await tx.pharmacy.findMany({ select: { license: true } });
      if (existingLicenses.some(row => row.license.trim().toLowerCase() === cleanLicense.toLowerCase())) {
        throw new ConflictException('Ce numéro d’autorisation ou de licence est déjà enregistré.');
      }

      const createdPharmacy = await tx.pharmacy.create({
        data: {
          ownerId: resolvedOwnerId,
          name: dto.name.trim(),
          city: dto.city.trim(),
          area: dto.area?.trim() ?? '',
          address: dto.address?.trim() ?? '',
          phone: dto.phone.trim(),
          email: (dto.email || accountEmail || user?.email || '').trim().toLowerCase(),
          license: cleanLicense,
          responsible: dto.responsible?.trim() ?? '',
          lat: dto.lat,
          lng: dto.lng,
          openingHours: dto.openingHours,
          ...(safeHours !== undefined ? { openingHoursJson: safeHours as Prisma.InputJsonValue } : {}),
          ...(safeMeta !== undefined ? { metadata: safeMeta as Prisma.InputJsonValue } : {}),
          subscription: dto.plan ?? 'Basic',
          documentsNote: dto.documents,
          status: 'En attente',
          preferences: { create: {} },
        },
      });
      return { pharmacy: createdPharmacy, ownerId: resolvedOwnerId, createdUser: newUser };
    });

    const session = createdUser ? await this.auth.issue(createdUser) : undefined;
    const actor: AuthUser = user ?? { id: ownerId, email: accountEmail!, role: 'PHARMACIST', name: dto.name.trim() };
    await this.core.audit(actor, 'Inscription pharmacie soumise', 'Pharmacie', pharmacy.id);
    await this.core.notify(pharmacy.id, 'Bienvenue sur PharmaConnect', 'Votre demande est en cours d’examen. Ajoutez vos justificatifs pour accélérer la vérification.', 'info');
    return { pharmacy: await this.full(pharmacy.id), ...(session ?? {}) };
  }

  async mine(user: AuthUser) {
    const ownerId = this.core.effectiveUserId(user);
    const rows = await this.prisma.pharmacy.findMany({ where: { ownerId }, include, orderBy: { id: 'asc' } });
    return rows.map(p => serializePharmacy(p, { includePrivate: true, productsCount: p._count.products }));
  }

  async get(user: AuthUser, id: number) {
    await this.core.assertPharmacyAccess(user, id);
    return this.full(id, user.role === 'ADMIN');
  }

  async update(user: AuthUser, id: number, dto: UpdatePharmacyDto) {
    const pharmacy = await this.core.assertPharmacyAccess(user, id);
    if (user.role !== 'ADMIN') {
      this.core.assertPharmacyOperational(pharmacy);
    }
    if ([dto.name, dto.city, dto.phone].some(value => value === null || (value !== undefined && value.trim().length < 2))) {
      throw new BadRequestException('Nom, ville et téléphone ne peuvent pas être vides.');
    }
    const safeHours = sanitizeJsonRecord(dto.openingHoursJson);
    const safeMeta = sanitizeJsonRecord(dto.metadata);
    await this.prisma.pharmacy.update({
      where: { id },
      data: {
        name: dto.name?.trim(), city: dto.city?.trim(), area: dto.area?.trim(), address: dto.address?.trim(),
        phone: dto.phone?.trim(), email: dto.email === null ? '' : dto.email?.trim().toLowerCase(), responsible: dto.responsible?.trim(),
        lat: dto.lat, lng: dto.lng, openingHours: dto.openingHours,
        ...(safeHours !== undefined ? { openingHoursJson: safeHours as Prisma.InputJsonValue } : {}),
        ...(safeMeta !== undefined ? { metadata: safeMeta as Prisma.InputJsonValue } : {}),
      },
    });
    await this.core.audit(user, 'Profil établissement modifié', 'Pharmacie', id);
    return this.full(id, user.role === 'ADMIN');
  }

  async setCover(user: AuthUser, id: number, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fichier image requis (champ « file »).');
    try {
      assertSafeUploadedFiles([file], IMAGE_TYPES);
      const { buffer, sha256 } = readFileBufferAndHash(file.path);
      const previousCover = await this.prisma.serializable(async tx => {
        const pharmacy = await this.core.assertPharmacyAccess(user, id, tx);
        if (user.role !== 'ADMIN') this.core.assertPharmacyOperational(pharmacy);
        await tx.pharmacy.update({ where: { id }, data: { coverImage: publicUrl(file.filename) } });
        await this.core.audit(user, 'Image de couverture mise à jour', 'Pharmacie', id, tx);
        return pharmacy.coverImage;
      });
      await this.core.persistPublicImage({
        storedName: file.filename,
        mimeType: file.mimetype,
        buffer,
        sha256,
        ownerId: user.id,
        pharmacyId: id,
        entity: 'pharmacy_cover',
        entityId: id,
      });
      if (previousCover && previousCover !== publicUrl(file.filename)) {
        void this.core.deletePublicImage(previousCover);
      }
    } catch (err) {
      cleanupUploadedFiles([file]);
      throw err;
    }
    return this.full(id, user.role === 'ADMIN');
  }

  async addDocuments(user: AuthUser, id: number, files: Express.Multer.File[] = []) {
    if (!files.length) throw new BadRequestException('Aucun justificatif reçu (champ « files »).');
    try {
      assertSafeUploadedFiles(files, DOC_TYPES);
      await this.core.assertPharmacyAccess(user, id);
      const documents = files.map(f => {
        const { buffer, sha256 } = readFileBufferAndHash(f.path);
        return {
          pharmacyId: id,
          fileName: sanitizeFileName(f.originalname),
          storedName: f.filename,
          mimeType: f.mimetype,
          size: f.size,
          sha256,
          content: new Uint8Array(buffer),
        };
      });
      await this.prisma.$transaction(async tx => {
        await tx.pharmacyDocument.createMany({ data: documents });
        await this.core.audit(user, 'Justificatifs transmis', 'Pharmacie', id, tx);
      });
    } catch (err) {
      cleanupUploadedFiles(files);
      throw err;
    }
    return this.listDocuments(user, id);
  }

  async listDocuments(user: AuthUser, id: number) {
    await this.core.assertPharmacyAccess(user, id);
    return this.prisma.pharmacyDocument.findMany({
      where: { pharmacyId: id },
      select: { id: true, fileName: true, mimeType: true, size: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteDocument(user: AuthUser, id: number, docId: number) {
    const pharmacy = await this.core.assertPharmacyAccess(user, id);
    if (user.role !== 'ADMIN') {
      if (pharmacy.status === 'Validée') {
        throw new ForbiddenException('Les justificatifs d’une officine validée ne peuvent être supprimés que par l’administration.');
      }
      this.core.assertPharmacyOperational(pharmacy);
    }
    const doc = await this.prisma.pharmacyDocument.findFirst({ where: { id: docId, pharmacyId: id } });
    if (!doc) throw new NotFoundException('Justificatif introuvable.');
    await this.prisma.pharmacyDocument.delete({ where: { id: docId } });
    const fullPath = join(PRIVATE_UPLOAD_DIR, doc.storedName);
    try {
      if (existsSync(fullPath)) unlinkSync(fullPath);
    } catch { }
    await this.core.audit(user, 'Justificatif supprimé', 'Document', docId);
    return { deleted: true, id: docId };
  }

  async getPreferences(user: AuthUser, id: number) {
    await this.core.assertPharmacyAccess(user, id);
    return this.prisma.pharmacyPreferences.upsert({ where: { pharmacyId: id }, update: {}, create: { pharmacyId: id } });
  }

  async updatePreferences(user: AuthUser, id: number, dto: PreferencesDto) {
    const pharmacy = await this.core.assertPharmacyAccess(user, id);
    this.core.assertPharmacyOperational(pharmacy);
    const updated = await this.prisma.pharmacyPreferences.upsert({ where: { pharmacyId: id }, update: dto, create: { pharmacyId: id, ...dto } });
    await this.core.audit(user, 'Préférences mises à jour', 'Pharmacie', id);
    return updated;
  }

  // --- Catégories (officielles + personnalisées propres à l'établissement)
  async categories(user: AuthUser, id: number) {
    await this.core.assertPharmacyAccess(user, id);
    const [official, custom] = await Promise.all([
      this.prisma.platformCategory.findMany({ orderBy: { position: 'asc' } }),
      this.prisma.customCategory.findMany({ where: { pharmacyId: id }, orderBy: { name: 'asc' } }),
    ]);
    return { official: official.map(c => c.name), custom: custom.map(c => c.name) };
  }

  async addCategory(user: AuthUser, id: number, name: string) {
    const pharmacy = await this.core.assertPharmacyAccess(user, id);
    this.core.assertPharmacyOperational(pharmacy);
    const clean = name.trim();
    if (clean.length < 2) throw new BadRequestException('Nom de catégorie requis.');
    const { official, custom } = await this.categories(user, id);
    if ([...official, ...custom].some(category => category.toLowerCase() === clean.toLowerCase())) {
      throw new ConflictException('Cette catégorie existe déjà.');
    }
    await this.prisma.customCategory.upsert({ where: { pharmacyId_name: { pharmacyId: id, name: clean } }, update: {}, create: { pharmacyId: id, name: clean } });
    await this.core.audit(user, 'Catégorie personnalisée ajoutée', 'Pharmacie', id);
    return this.categories(user, id);
  }

  async removeCategory(user: AuthUser, id: number, name: string) {
    const pharmacy = await this.core.assertPharmacyAccess(user, id);
    this.core.assertPharmacyOperational(pharmacy);
    const cleanName = name.trim();
    await this.prisma.serializable(async tx => {
      const existing = await tx.customCategory.findFirst({ where: { pharmacyId: id, name: cleanName } });
      if (!existing) throw new NotFoundException('Catégorie personnalisée introuvable.');
      if (await tx.product.count({ where: { pharmacyId: id, category: cleanName } })) {
        throw new ConflictException('Réaffectez les produits de cette catégorie avant de la supprimer.');
      }
      await tx.customCategory.delete({ where: { id: existing.id } });
    });
    await this.core.audit(user, `Catégorie personnalisée supprimée (${cleanName})`, 'Pharmacie', id);
    return this.categories(user, id);
  }

  async renameCategory(user: AuthUser, id: number, oldName: string, newName: string) {
    const pharmacy = await this.core.assertPharmacyAccess(user, id);
    if (user.role !== 'ADMIN') {
      this.core.assertPharmacyOperational(pharmacy);
    }
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    if (cleanNew.length < 2) throw new BadRequestException('Nom de catégorie requis.');
    const resetCount = await this.prisma.serializable(async tx => {
      const existing = await tx.customCategory.findFirst({ where: { pharmacyId: id, name: cleanOld } });
      if (!existing) throw new NotFoundException('Catégorie personnalisée introuvable.');
      if (cleanOld === cleanNew) return 0;
      const [official, custom] = await Promise.all([
        tx.platformCategory.findMany({ select: { name: true } }),
        tx.customCategory.findMany({ where: { pharmacyId: id }, select: { name: true } }),
      ]);
      const collision = [...official, ...custom].some(
        c => c.name.toLowerCase() === cleanNew.toLowerCase() && c.name !== cleanOld,
      );
      if (collision) throw new ConflictException('Une catégorie porte déjà ce nom.');
      await tx.customCategory.update({ where: { id: existing.id }, data: { name: cleanNew } });
      let pendingResetCount = 0;
      if (user.role !== 'ADMIN') {
        const res = await tx.product.updateMany({
          where: { pharmacyId: id, category: cleanOld, status: 'Publié' },
          data: { category: cleanNew, status: 'En attente', note: null },
        });
        pendingResetCount = res.count;
      }
      await tx.product.updateMany({
        where: { pharmacyId: id, category: cleanOld },
        data: { category: cleanNew },
      });
      return pendingResetCount;
    });
    const auditLabel = resetCount > 0
      ? `Catégorie personnalisée renommée (${cleanOld} -> ${cleanNew}, ${resetCount} produit(s) publié(s) repassé(s) en attente)`
      : `Catégorie personnalisée renommée (${cleanOld} -> ${cleanNew})`;
    await this.core.audit(user, auditLabel, 'Pharmacie', id);
    return this.categories(user, id);
  }

  // --- Notifications
  async notices(user: AuthUser, id: number) {
    await this.core.assertPharmacyAccess(user, id);
    return this.prisma.notice.findMany({ where: { pharmacyId: id }, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  async markNotice(user: AuthUser, noticeId: number) {
    const n = await this.prisma.notice.findFirst({ where: { id: noticeId, pharmacy: this.core.pharmacyAccessScope(user) } });
    if (!n) throw new NotFoundException('Notification introuvable.');
    return this.prisma.notice.update({ where: { id: noticeId }, data: { read: true } });
  }

  async markAllNotices(user: AuthUser, id: number) {
    await this.core.assertPharmacyAccess(user, id);
    const { count } = await this.prisma.notice.updateMany({ where: { pharmacyId: id, read: false }, data: { read: true } });
    return { updated: count };
  }

  async deleteNotice(user: AuthUser, noticeId: number) {
    const n = await this.prisma.notice.findFirst({ where: { id: noticeId, pharmacy: this.core.pharmacyAccessScope(user) } });
    if (!n) throw new NotFoundException('Notification introuvable.');
    await this.prisma.notice.delete({ where: { id: noticeId } });
    return { deleted: true, id: noticeId };
  }

  // --- Statistiques / tableau de bord
  async stats(user: AuthUser, id: number) {
    const pharmacy = await this.core.assertPharmacyAccess(user, id);
    const prefs = await this.getPreferences(user, id);
    const [byStatus, unreadMessages, unreadNotices, totalMessages, lowStock, outOfStock, lastPayment] = await Promise.all([
      this.prisma.product.groupBy({ by: ['status'], where: { pharmacyId: id }, _count: true }),
      this.prisma.message.count({ where: { pharmacyId: id, direction: 'visitor', read: false } }),
      this.prisma.notice.count({ where: { pharmacyId: id, read: false } }),
      this.prisma.message.count({ where: { pharmacyId: id, threadId: null } }),
      this.prisma.product.count({ where: { pharmacyId: id, status: { not: 'Archivé' }, stock: { gt: 0, lte: prefs.lowStockThreshold } } }),
      this.prisma.product.count({ where: { pharmacyId: id, status: { not: 'Archivé' }, stock: { lte: 0 } } }),
      this.prisma.payment.findFirst({ where: { pharmacyId: id }, orderBy: { createdAt: 'desc' } }),
    ]);
    const products = Object.fromEntries(byStatus.map(r => [r.status, r._count]));
    return {
      products,
      totalProducts: byStatus.reduce((s, r) => s + r._count, 0),
      unreadMessages,
      unreadNotices,
      unread: unreadMessages + unreadNotices,
      conversations: totalMessages,
      lowStock,
      outOfStock,
      subscription: pharmacy.subscription,
      effectivePlan: this.core.effectivePlan(pharmacy),
      analyticsEnabled: this.core.effectivePlan(pharmacy) !== 'Basic',
      trialEndsAt: pharmacy.trialEndsAt,
      subscriptionEndsAt: pharmacy.subscriptionEndsAt,
      lastPayment,
    };
  }
}

// ---------- Controller ----------
@ApiTags('Espace pharmacie — établissements')
@ApiBearerAuth()
@Controller()
export class PharmaciesController {
  constructor(private readonly svc: PharmaciesService) { }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('pharmacies/register')
  register(@CurrentUser() user: AuthUser | undefined, @Body() dto: RegisterPharmacyDto) {
    return this.svc.register(user, dto);
  }

  @Roles('PHARMACIST') @Get('pharmacies/mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.svc.mine(user);
  }

  @Roles('PHARMACIST', 'ADMIN') @Get('pharmacies/:id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.get(user, id);
  }

  @Roles('PHARMACIST', 'ADMIN') @Patch('pharmacies/:id')
  update(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePharmacyDto) {
    return this.svc.update(user, id, dto);
  }

  @Roles('PHARMACIST', 'ADMIN') @Post('pharmacies/:id/cover')
  @ApiConsumes('multipart/form-data') @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  cover(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.svc.setCover(user, id, file);
  }

  @Roles('PHARMACIST', 'ADMIN') @Post('pharmacies/:id/documents')
  @ApiConsumes('multipart/form-data') @UseInterceptors(FilesInterceptor('files', 10, documentUploadOptions))
  addDocuments(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[]) {
    return this.svc.addDocuments(user, id, files);
  }

  @Roles('PHARMACIST', 'ADMIN') @Get('pharmacies/:id/documents')
  documents(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.listDocuments(user, id);
  }

  @Roles('PHARMACIST', 'ADMIN') @Delete('pharmacies/:id/documents/:docId')
  deleteDocument(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('docId', ParseIntPipe) docId: number,
  ) {
    return this.svc.deleteDocument(user, id, docId);
  }

  @Roles('PHARMACIST') @Get('pharmacies/:id/preferences')
  preferences(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.getPreferences(user, id);
  }

  @Roles('PHARMACIST') @Patch('pharmacies/:id/preferences')
  updatePreferences(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() dto: PreferencesDto) {
    return this.svc.updatePreferences(user, id, dto);
  }

  @Roles('PHARMACIST', 'ADMIN') @Get('pharmacies/:id/categories')
  categories(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.categories(user, id);
  }

  @Roles('PHARMACIST') @Post('pharmacies/:id/categories')
  addCategory(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() dto: CategoryNameDto) {
    return this.svc.addCategory(user, id, dto.name);
  }

  @Roles('PHARMACIST') @Patch('pharmacies/:id/categories/:name')
  renameCategory(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('name') name: string,
    @Body() dto: CategoryNameDto,
  ) {
    let decoded = name;
    try {
      decoded = decodeURIComponent(name);
    } catch {
      throw new BadRequestException('Nom de catégorie invalide.');
    }
    return this.svc.renameCategory(user, id, decoded, dto.name);
  }

  @Roles('PHARMACIST') @Delete('pharmacies/:id/categories/:name')
  removeCategory(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Param('name') name: string) {
    let decoded = name;
    try {
      decoded = decodeURIComponent(name);
    } catch {
      throw new BadRequestException('Nom de catégorie invalide.');
    }
    return this.svc.removeCategory(user, id, decoded);
  }

  @Roles('PHARMACIST') @Get('pharmacies/:id/notices')
  notices(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.notices(user, id);
  }

  @Roles('PHARMACIST') @Post('pharmacies/:id/notices/read-all')
  markAll(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.markAllNotices(user, id);
  }

  @Roles('PHARMACIST') @Patch('notices/:noticeId/read')
  markNotice(@CurrentUser() user: AuthUser, @Param('noticeId', ParseIntPipe) noticeId: number) {
    return this.svc.markNotice(user, noticeId);
  }

  @Roles('PHARMACIST') @Delete('notices/:noticeId')
  deleteNotice(@CurrentUser() user: AuthUser, @Param('noticeId', ParseIntPipe) noticeId: number) {
    return this.svc.deleteNotice(user, noticeId);
  }

  @Roles('PHARMACIST', 'ADMIN') @Get('pharmacies/:id/stats')
  stats(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.stats(user, id);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [PharmaciesController],
  providers: [PharmaciesService],
  exports: [PharmaciesService],
})
export class PharmaciesModule { }
