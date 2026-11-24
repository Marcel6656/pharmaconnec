import { isDeepStrictEqual } from 'node:util';
import {
  BadRequestException, Body, ConflictException, Controller, Delete, ForbiddenException, Get, Injectable, Module, NotFoundException,
  Param, ParseIntPipe, Patch, Post, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoreService } from '../common/core.service';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { PHARMACY_PRODUCT_STATUSES, PRODUCT_STATUSES, ProductStatus } from '../common/constants';
import { serializeProduct } from '../common/serializers';
import {
  assertSafeUploadedFiles,
  cleanupUploadedFiles,
  IMAGE_TYPES,
  imageUploadOptions,
  isManagedImageReference,
  isSafeImageReference,
  publicUrl,
  readFileBufferAndHash,
  sanitizeJsonRecord,
} from '../common/uploads';

// ---------- DTO ----------
export class CreateProductDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) name: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(80) category: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) code?: string;
  @ApiProperty() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price: number;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(0) stock: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ description: 'Métadonnées pharmaceutiques flexibles (dosage, forme, ordonnance…)' })
  @IsOptional() @IsObject() attributes?: Record<string, unknown>;
  @ApiPropertyOptional({ description: 'URL d’image ou data URL compressée' }) @IsOptional() @IsString() @MaxLength(2_000_000) imageDataUrl?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() draft?: boolean;
  @ApiPropertyOptional({ enum: ['Brouillon', 'En attente', 'Publié'] }) @IsOptional() @IsIn(['Brouillon', 'En attente', 'Publié']) status?: 'Brouillon' | 'En attente' | 'Publié';
}

export class UpdateProductDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(160) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(80) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) code?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() attributes?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2_000_000) imageDataUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() draft?: boolean;
  @ApiPropertyOptional({ enum: PRODUCT_STATUSES }) @IsOptional() @IsIn(PRODUCT_STATUSES) status?: ProductStatus;
}

export class UpdateStockDto {
  @ApiProperty() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price: number;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(0) stock: number;
}

export class UpdateProductStatusDto {
  @ApiProperty({ enum: PRODUCT_STATUSES }) @IsIn(PRODUCT_STATUSES) status: ProductStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) note?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expectedModifiedAt?: string;
}

const historyInclude = { stockHistory: { orderBy: { createdAt: 'desc' as const }, take: 50 } };

// ---------- Service ----------
@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly core: CoreService,
  ) { }

  private async findAndAuthorize(user: AuthUser, id: number, db: Prisma.TransactionClient = this.prisma) {
    const product = await db.product.findFirst({ where: { id, pharmacy: this.core.pharmacyAccessScope(user) } });
    if (!product) throw new NotFoundException('Produit introuvable.');
    const pharmacy = await this.core.assertPharmacyAccess(user, product.pharmacyId, db);
    return { product, pharmacy };
  }

  async listByPharmacy(user: AuthUser, pharmacyId: number) {
    await this.core.assertPharmacyAccess(user, pharmacyId);
    const rows = await this.prisma.product.findMany({
      where: { pharmacyId },
      include: historyInclude,
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(serializeProduct);
  }

  private async assertValidCategory(pharmacyId: number, category: string, db: Prisma.TransactionClient) {
    const clean = category.trim();
    const [official, custom] = await Promise.all([
      db.platformCategory.findFirst({ where: { name: clean } }),
      db.customCategory.findFirst({ where: { pharmacyId, name: clean } }),
    ]);
    if (!official && !custom) {
      throw new BadRequestException(`Catégorie « ${clean} » non reconnue. Ajoutez-la d’abord dans vos catégories personnalisées.`);
    }
    return clean;
  }

  async create(user: AuthUser, pharmacyId: number, dto: CreateProductDto) {
    if (!isSafeImageReference(dto.imageDataUrl) || isManagedImageReference(dto.imageDataUrl)) {
      throw new BadRequestException('Référence image non autorisée.');
    }
    if (dto.name.trim().length < 2) throw new BadRequestException('Nom du produit requis.');
    const safeAttributes = sanitizeJsonRecord(dto.attributes);
    const isAdmin = user.role === 'ADMIN';
    const isDraft = Boolean(dto.draft || dto.status === 'Brouillon');
    const status: ProductStatus = isDraft ? 'Brouillon' : (isAdmin && dto.status === 'Publié' ? 'Publié' : 'En attente');

    const created = await this.prisma.serializable(async tx => {
      const pharmacy = await this.core.assertPharmacyAccess(user, pharmacyId, tx);
      if (!isAdmin) {
        if (dto.status !== undefined && !PHARMACY_PRODUCT_STATUSES.includes(dto.status)) {
          throw new ForbiddenException('Ce statut de publication est réservé à l’administration.');
        }
        this.core.assertPharmacyOperational(pharmacy);
        await this.core.assertProductQuota(pharmacy, tx);
      }
      const category = await this.assertValidCategory(pharmacyId, dto.category, tx);
      return tx.product.create({
        data: {
          pharmacyId,
          name: dto.name.trim(),
          category,
          brand: dto.brand?.trim() ?? '',
          code: dto.code?.trim() ?? '',
          price: dto.price,
          stock: dto.stock,
          description: dto.description?.trim() ?? '',
          ...(safeAttributes !== undefined ? { attributes: safeAttributes as Prisma.InputJsonValue } : {}),
          imageUrl: dto.imageDataUrl || null,
          status,
          stockUpdatedAt: new Date(),
          stockHistory: { create: { price: dto.price, stock: dto.stock } },
        },
        include: historyInclude,
      });
    });
    await this.core.audit(user, isDraft ? 'Brouillon enregistré' : 'Produit soumis', 'Produit', created.id);
    return serializeProduct(created);
  }

  async update(user: AuthUser, id: number, dto: UpdateProductDto) {
    const isAdmin = user.role === 'ADMIN';
    const isDraft = Boolean(dto.draft || dto.status === 'Brouillon');
    const safeAttributes = sanitizeJsonRecord(dto.attributes);
    const updated = await this.prisma.serializable(async tx => {
      const { product: existing, pharmacy } = await this.findAndAuthorize(user, id, tx);
      if (!isAdmin) {
        if (dto.status !== undefined && !PHARMACY_PRODUCT_STATUSES.includes(dto.status)) {
          throw new ForbiddenException('Ce statut de publication est réservé à l’administration.');
        }
        this.core.assertPharmacyOperational(pharmacy);
      }
      if (dto.imageDataUrl !== undefined && dto.imageDataUrl !== existing.imageUrl
        && (!isSafeImageReference(dto.imageDataUrl) || isManagedImageReference(dto.imageDataUrl))) {
        throw new BadRequestException('Référence image non autorisée.');
      }
      const category = dto.category ? await this.assertValidCategory(existing.pharmacyId, dto.category, tx) : undefined;
      if (dto.name != null && dto.name.trim().length < 2) throw new BadRequestException('Nom du produit requis.');

      if (!isAdmin && (existing.status === 'Refusé' || existing.status === 'Suspendu')) {
        throw new ForbiddenException('Un produit refusé ou suspendu ne peut être débloqué que par l’administration.');
      }

      const coreFieldsModified =
        (dto.name != null && dto.name.trim() !== existing.name) ||
        (category !== undefined && category !== existing.category) ||
        (dto.brand != null && dto.brand.trim() !== existing.brand) ||
        (dto.code != null && dto.code.trim() !== existing.code) ||
        (dto.description != null && dto.description.trim() !== existing.description) ||
        (dto.attributes != null && !isDeepStrictEqual(dto.attributes, existing.attributes)) ||
        (dto.imageDataUrl !== undefined && (dto.imageDataUrl || null) !== existing.imageUrl);

      // Règle métier : toute modification par l'officine d'un produit publié le renvoie en validation.
      let nextStatus: ProductStatus = existing.status as ProductStatus;
      if (isAdmin) {
        if (dto.status && PRODUCT_STATUSES.includes(dto.status)) {
          nextStatus = dto.status;
        }
      } else if (isDraft && existing.status !== 'Refusé' && existing.status !== 'Suspendu') {
        nextStatus = 'Brouillon';
      } else if (existing.status === 'Publié' && (coreFieldsModified || (dto.price != null && dto.price !== existing.price) || (dto.stock != null && dto.stock !== existing.stock))) {
        nextStatus = dto.status && ['Masqué', 'Archivé'].includes(dto.status) ? dto.status : 'En attente';
      } else if (dto.status && PHARMACY_PRODUCT_STATUSES.includes(dto.status)) {
        nextStatus = dto.status;
      } else if (existing.status === 'À corriger' && coreFieldsModified) {
        nextStatus = 'En attente';
      }
      this.assertValidVisibilityTransition(existing.status, nextStatus);
      if (!isAdmin && existing.status === 'Archivé' && nextStatus !== 'Archivé') {
        await this.core.assertProductQuota(pharmacy, tx);
      }

      const nextPrice = dto.price ?? existing.price;
      const nextStock = dto.stock ?? existing.stock;
      const stockChanged = nextPrice !== existing.price || nextStock !== existing.stock;

      return tx.product.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          category,
          brand: dto.brand?.trim(),
          code: dto.code?.trim(),
          price: nextPrice,
          stock: nextStock,
          description: dto.description?.trim(),
          ...(safeAttributes !== undefined ? { attributes: safeAttributes as Prisma.InputJsonValue } : {}),
          imageUrl: dto.imageDataUrl !== undefined ? dto.imageDataUrl || null : undefined,
          status: nextStatus,
          note: nextStatus === 'En attente' ? null : undefined,
          ...(stockChanged ? { stockUpdatedAt: new Date(), stockHistory: { create: { price: nextPrice, stock: nextStock } } } : {}),
        },
        include: historyInclude,
      });
    });
    await this.core.audit(user, isDraft ? 'Brouillon enregistré' : 'Produit modifié', 'Produit', id);
    return serializeProduct(updated);
  }

  async updateStock(user: AuthUser, id: number, dto: UpdateStockDto) {
    const isAdmin = user.role === 'ADMIN';
    const updated = await this.prisma.serializable(async tx => {
      const { product: existing, pharmacy } = await this.findAndAuthorize(user, id, tx);
      if (!isAdmin) {
        this.core.assertPharmacyOperational(pharmacy);
      }
      this.assertStockEditable(existing.status);
      const changed = dto.price !== existing.price || dto.stock !== existing.stock;
      return tx.product.update({
        where: { id },
        data: {
          price: dto.price,
          stock: dto.stock,
          stockUpdatedAt: new Date(),
          ...(changed ? { stockHistory: { create: { price: dto.price, stock: dto.stock } } } : {}),
        },
        include: historyInclude,
      });
    });

    const prefs = await this.prisma.pharmacyPreferences.findUnique({ where: { pharmacyId: updated.pharmacyId } });
    if (prefs?.lowStockAlerts && dto.stock <= prefs.lowStockThreshold) {
      await this.core.notify(
        updated.pharmacyId,
        'Alerte stock bas',
        `${updated.name} : niveau de stock actuel de ${dto.stock} unité(s) (seuil : ${prefs.lowStockThreshold}).`,
        'warning',
      );
    }

    await this.core.audit(user, 'Stock ou prix actualisé', 'Produit', id);
    void this.core.emitRealtime('product', 'stock_updated', updated.pharmacyId);
    return serializeProduct(updated);
  }

  async updateStatus(user: AuthUser, id: number, dto: UpdateProductStatusDto) {
    const isAdmin = user.role === 'ADMIN';
    const note = dto.note?.trim();
    const updated = await this.prisma.serializable(async tx => {
      const { product: existing, pharmacy } = await this.findAndAuthorize(user, id, tx);
      if (!isAdmin) {
        if (existing.status === 'Refusé' || existing.status === 'Suspendu') {
          throw new ForbiddenException('Un produit refusé ou suspendu ne peut être débloqué que par l’administration.');
        }
        const expiry = pharmacy.subscriptionEndsAt ?? pharmacy.trialEndsAt;
        const archivingForRenewal = dto.status === 'Archivé' && ['Validée', 'Abonnement expiré'].includes(pharmacy.status)
          && Boolean(expiry && expiry.getTime() <= Date.now());
        if (!archivingForRenewal) this.core.assertPharmacyOperational(pharmacy);
        if (!PHARMACY_PRODUCT_STATUSES.includes(dto.status)) {
          throw new ForbiddenException('Seule l’administration peut approuver ou suspendre un produit.');
        }
      } else {
        if (['À corriger', 'Refusé'].includes(dto.status) && !note) {
          throw new BadRequestException('Renseignez le motif de la décision.');
        }
        if (dto.status === 'Publié') {
          this.core.assertPharmacyOperational(pharmacy, true);
          if (!['En attente', 'À corriger', 'Refusé', 'Masqué', 'Suspendu', 'Publié'].includes(existing.status)) {
            throw new ConflictException('Le produit doit être soumis à la modération avant sa publication.');
          }
          if (!dto.expectedModifiedAt) throw new BadRequestException('La version examinée du produit est requise.');
          if (new Date(dto.expectedModifiedAt).getTime() !== existing.updatedAt.getTime()) {
            throw new ConflictException('Le produit a été modifié. Rechargez et examinez sa version actuelle.');
          }
        }
      }
      this.assertValidVisibilityTransition(existing.status, dto.status);
      if (existing.status === 'Archivé' && dto.status !== 'Archivé') {
        await this.core.assertProductQuota(pharmacy, tx);
      }
      const product = await tx.product.update({
        where: { id },
        data: {
          status: dto.status,
          note: isAdmin ? note || null : dto.status === 'En attente' ? null : existing.note,
        },
        include: historyInclude,
      });
      await this.core.audit(user, `Statut produit -> ${dto.status}`, 'Produit', id, tx);
      return product;
    });
    if (isAdmin) {
      const kind = dto.status === 'Publié' ? 'success' : ['À corriger', 'Refusé'].includes(dto.status) ? 'warning' : 'info';
      await this.core.notify(updated.pharmacyId, `Produit ${dto.status.toLowerCase()}`,
        note || `${updated.name} : le statut a été mis à jour par l’administration.`, kind);
    }
    void this.core.emitRealtime('product', 'status_updated', updated.pharmacyId);
    return serializeProduct(updated);
  }

  private assertValidVisibilityTransition(from: string, to: ProductStatus) {
    if (to === 'Masqué' && !['Publié', 'Masqué'].includes(from)) {
      throw new ConflictException('Seul un produit publié peut être masqué.');
    }
    if (to === 'Suspendu' && !['Publié', 'Masqué', 'Suspendu', 'En attente'].includes(from)) {
      throw new ConflictException('Seul un produit soumis ou publié peut être suspendu.');
    }
  }

  private assertStockEditable(status: string) {
    if (status === 'Refusé' || status === 'Suspendu' || status === 'Archivé') {
      throw new ForbiddenException(`Ce produit est au statut « ${status} ».`);
    }
  }

  async setImage(user: AuthUser, id: number, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fichier image requis (champ « file »).');
    const isAdmin = user.role === 'ADMIN';
    try {
      assertSafeUploadedFiles([file], IMAGE_TYPES);
      const { buffer, sha256 } = readFileBufferAndHash(file.path);
      const { product: updated, previousImage } = await this.prisma.serializable(async tx => {
        const { product: existing, pharmacy } = await this.findAndAuthorize(user, id, tx);
        if (!isAdmin) {
          this.core.assertPharmacyOperational(pharmacy);
        }
        this.assertStockEditable(existing.status);
        const resetToPending = !isAdmin && existing.status === 'Publié';
        const nextStatus = resetToPending ? 'En attente' : existing.status;
        const product = await tx.product.update({
          where: { id },
          data: { imageUrl: publicUrl(file.filename), status: nextStatus, note: resetToPending ? null : undefined },
          include: historyInclude,
        });
        const auditAction = resetToPending
          ? 'Image produit mise à jour (repassé en attente de validation)'
          : 'Image produit mise à jour';
        await this.core.audit(user, auditAction, 'Produit', id, tx);
        return { product, previousImage: existing.imageUrl };
      });
      await this.core.persistPublicImage({
        storedName: file.filename,
        mimeType: file.mimetype,
        buffer,
        sha256,
        ownerId: user.id,
        pharmacyId: updated.pharmacyId,
        entity: 'product_image',
        entityId: id,
      });
      if (previousImage && previousImage !== publicUrl(file.filename)) {
        void this.core.deletePublicImage(previousImage);
      }
      return serializeProduct(updated);
    } catch (err) {
      cleanupUploadedFiles([file]);
      throw err;
    }
  }

  async remove(user: AuthUser, id: number) {
    const { product: existing, pharmacy } = await this.findAndAuthorize(user, id);
    if (user.role !== 'ADMIN') {
      if (existing.status === 'Refusé' || existing.status === 'Suspendu') {
        throw new ForbiddenException('Un produit refusé ou suspendu ne peut pas être supprimé par l’officine.');
      }
      this.core.assertPharmacyOperational(pharmacy);
    }
    await this.prisma.product.delete({ where: { id } });
    void this.core.deletePublicImage(existing.imageUrl);
    await this.core.audit(user, 'Produit supprimé', 'Produit', id);
    return { deleted: true, id };
  }
}

// ---------- Controller ----------
@ApiTags('Espace pharmacie — produits & stocks')
@ApiBearerAuth()
@Roles('PHARMACIST', 'ADMIN')
@Controller()
export class ProductsController {
  constructor(private readonly svc: ProductsService) { }

  @Get('pharmacies/:pharmacyId/products')
  list(@CurrentUser() user: AuthUser, @Param('pharmacyId', ParseIntPipe) pharmacyId: number) {
    return this.svc.listByPharmacy(user, pharmacyId);
  }

  @Post('pharmacies/:pharmacyId/products')
  create(
    @CurrentUser() user: AuthUser,
    @Param('pharmacyId', ParseIntPipe) pharmacyId: number,
    @Body() dto: CreateProductDto,
  ) {
    return this.svc.create(user, pharmacyId, dto);
  }

  @Patch('products/:id')
  update(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.svc.update(user, id, dto);
  }

  @Patch('products/:id/stock')
  updateStock(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockDto) {
    return this.svc.updateStock(user, id, dto);
  }

  @Patch('products/:id/status')
  updateStatus(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductStatusDto) {
    return this.svc.updateStatus(user, id, dto);
  }

  @Post('products/:id/image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  uploadImage(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.svc.setImage(user, id, file);
  }

  @Delete('products/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(user, id);
  }
}

@Module({ controllers: [ProductsController], providers: [ProductsService], exports: [ProductsService] })
export class ProductsModule { }
