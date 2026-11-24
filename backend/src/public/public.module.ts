import { Controller, Get, Header, Injectable, Module, NotFoundException, Param, ParseIntPipe, Query, StreamableFile } from '@nestjs/common';
import { ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoreService } from '../common/core.service';
import { AuthUser, CurrentUser, Public } from '../common/decorators';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { PUBLIC_UPLOAD_DIR, publicUrl, UPLOADED_IMAGE_PATH } from '../common/uploads';
import { DAY_MS } from '../common/constants';
import { distanceKm, serializeBadge, serializePharmacy, serializePlan, serializePublicProduct } from '../common/serializers';

export class DirectoryQuery {
  @ApiPropertyOptional({ description: 'Nom, quartier, adresse' }) @IsOptional() @IsString() @MaxLength(160) q?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) city?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() lat?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() lng?: number;
  @ApiPropertyOptional({ description: 'Filtrer sur un badge (ex. garde)' }) @IsOptional() @Type(() => Number) @IsInt() badgeId?: number;
}

export class CatalogQuery {
  @ApiPropertyOptional({ description: 'Nom, marque, code-barres, pharmacie' }) @IsOptional() @IsString() @MaxLength(160) q?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) city?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() pharmacyId?: number;
  @ApiPropertyOptional({ enum: ['Toutes', 'Disponible', 'Indisponible'] }) @IsOptional() @IsIn(['Toutes', 'Disponible', 'Indisponible']) availability?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ default: 48 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) pageSize?: number;
}

const badgeInclude = { badges: { include: { badge: true } } } as const;

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly core: CoreService,
  ) {}

  /** Règle : seules les pharmacies validées et non expirées sont publiques. */
  visiblePharmacyWhere(now = new Date()): Prisma.PharmacyWhereInput {
    return {
      status: 'Validée',
      OR: [
        { subscriptionEndsAt: { gt: now } },
        { subscriptionEndsAt: null, trialEndsAt: { gt: now } },
      ],
    };
  }

  /** Règle : produit approuvé (Publié) et déclaration prix/stock plus récente que le seuil de fraîcheur. */
  async visibleProductWhere(): Promise<Prisma.ProductWhereInput> {
    const days = await this.core.getFreshnessDays();
    const now = new Date();
    return {
      status: 'Publié',
      stockUpdatedAt: { gte: new Date(now.getTime() - days * DAY_MS), lte: now },
      pharmacy: this.visiblePharmacyWhere(now),
    };
  }

  async readUploadedImage(filename: string, user?: AuthUser) {
    const mimeByExtension: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
    };
    const extension = extname(filename).toLowerCase();
    const mime = mimeByExtension[extension];
    const unavailable = () => new NotFoundException('Image indisponible.');
    if (!mime || !/^\d+-[a-f0-9]{16}\.(jpe?g|png|webp|gif)$/i.test(filename)) throw unavailable();

    const url = publicUrl(filename);
    const ownerScope = user?.role === 'PHARMACIST' ? { ownerId: user.id } : undefined;
    const isAdmin = user?.role === 'ADMIN';
    const publicPharmacy = this.visiblePharmacyWhere();
    const publicProduct = await this.visibleProductWhere();
    const [pharmacy, product] = await Promise.all([
      this.prisma.pharmacy.findFirst({
        where: { coverImage: url, OR: isAdmin ? undefined : ownerScope ? [publicPharmacy, ownerScope] : [publicPharmacy] },
        select: { id: true },
      }),
      this.prisma.product.findFirst({
        where: { imageUrl: url, OR: isAdmin ? undefined : ownerScope ? [publicProduct, { pharmacy: ownerScope }] : [publicProduct] },
        select: { id: true },
      }),
    ]);
    if (!pharmacy && !product) throw unavailable();
    const localImage = await readFile(join(PUBLIC_UPLOAD_DIR, filename)).catch(() => null);
    if (localImage) return new StreamableFile(localImage, { type: mime });
    const persisted = await this.core.readPublicImage(filename);
    if (!persisted) throw unavailable();
    return new StreamableFile(persisted.buffer, { type: mime });
  }

  async directory(q: DirectoryQuery) {
    const where: Prisma.PharmacyWhereInput = { AND: [this.visiblePharmacyWhere()] };
    const and = where.AND as Prisma.PharmacyWhereInput[];
    if (q.badgeId) and.push({ badges: { some: { badgeId: q.badgeId, badge: { visible: true } } } });
    const productWhere = await this.visibleProductWhere();
    const rows = await this.prisma.pharmacy.findMany({
      where,
      include: { ...badgeInclude, _count: { select: { products: { where: { status: productWhere.status, stockUpdatedAt: productWhere.stockUpdatedAt } } } } },
      orderBy: { name: 'asc' },
    });

    const cityNeedle = q.city && q.city !== 'Toutes les villes' ? q.city.trim().toLowerCase() : null;
    const textNeedle = q.q?.trim() ? q.q.trim().toLowerCase() : null;

    const filtered = rows.filter(p => {
      if (q.badgeId) {
        const badgeLink = p.badges.find(b => b.badgeId === q.badgeId && b.badge.visible);
        if (!badgeLink) return false;
        if (badgeLink.badge.expiryDays && Date.now() > badgeLink.assignedAt.getTime() + badgeLink.badge.expiryDays * DAY_MS) {
          return false;
        }
      }
      if (cityNeedle && p.city.trim().toLowerCase() !== cityNeedle) return false;
      if (textNeedle) {
        const hay = `${p.name} ${p.area} ${p.address} ${p.city}`.toLowerCase();
        if (!hay.includes(textNeedle)) return false;
      }
      return true;
    });

    const origin = q.lat !== undefined && q.lng !== undefined ? { lat: q.lat, lng: q.lng } : null;
    const list = filtered.map(p => ({
      ...serializePharmacy(p, { productsCount: p._count.products }),
      distanceKm: origin && p.lat != null && p.lng != null ? Number(distanceKm(origin, { lat: p.lat, lng: p.lng }).toFixed(2)) : undefined,
    }));
    if (origin) list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    return list;
  }

  async pharmacy(id: number) {
    const p = await this.prisma.pharmacy.findFirst({ where: { id, ...this.visiblePharmacyWhere() }, include: badgeInclude });
    if (!p) throw new NotFoundException('Cette fiche n’est pas disponible.');
    const productWhere = await this.visibleProductWhere();
    const products = await this.prisma.product.findMany({ where: { ...productWhere, pharmacyId: id }, orderBy: { name: 'asc' } });
    return { ...serializePharmacy(p, { productsCount: products.length }), catalog: products.map(serializePublicProduct) };
  }

  async catalog(q: CatalogQuery) {
    const and: Prisma.ProductWhereInput[] = [await this.visibleProductWhere()];
    if (q.category && q.category !== 'Toutes les catégories') and.push({ category: q.category });
    if (q.pharmacyId) and.push({ pharmacyId: q.pharmacyId });
    // Règle : un stock à zéro reste visible comme « indisponible ».
    if (q.availability === 'Disponible') and.push({ stock: { gt: 0 } });
    if (q.availability === 'Indisponible') and.push({ stock: { lte: 0 } });
    if (q.minPrice !== undefined) and.push({ price: { gte: q.minPrice } });
    if (q.maxPrice !== undefined) and.push({ price: { lte: q.maxPrice } });

    const allRows = await this.prisma.product.findMany({
      where: { AND: and },
      include: { pharmacy: { select: { id: true, name: true, city: true, area: true, phone: true, lat: true, lng: true } } },
      orderBy: [{ stockUpdatedAt: 'desc' }],
    });

    const cityNeedle = q.city && q.city !== 'Toutes les villes' ? q.city.trim().toLowerCase() : null;
    const textNeedle = q.q?.trim() ? q.q.trim().toLowerCase() : null;

    const matching = allRows.filter(r => {
      if (cityNeedle && r.pharmacy.city.trim().toLowerCase() !== cityNeedle) return false;
      if (textNeedle) {
        const hay = `${r.name} ${r.brand} ${r.code} ${r.category} ${r.pharmacy.name} ${r.pharmacy.area} ${r.pharmacy.city}`.toLowerCase();
        if (!hay.includes(textNeedle)) return false;
      }
      return true;
    });

    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 48;
    const total = matching.length;
    const paged = matching.slice((page - 1) * pageSize, page * pageSize);

    return {
      total,
      page,
      pageSize,
      items: paged.map(r => ({ ...serializePublicProduct(r), pharmacy: r.pharmacy })),
    };
  }

  async meta() {
    const [categories, badges, plans, freshnessDays, cities, bannerSetting] = await Promise.all([
      this.prisma.platformCategory.findMany({ orderBy: { position: 'asc' } }),
      this.prisma.badge.findMany({ where: { visible: true }, orderBy: { id: 'asc' } }),
      this.prisma.plan.findMany({ orderBy: { position: 'asc' } }),
      this.core.getFreshnessDays(),
      this.prisma.pharmacy.findMany({ where: this.visiblePharmacyWhere(), select: { city: true }, distinct: ['city'] }),
      this.prisma.setting.findUnique({ where: { key: 'platformBanner' } }),
    ]);
    return {
      platformCategories: categories.map(c => c.name),
      badges: badges.map(serializeBadge),
      plans: plans.map(serializePlan),
      freshnessDays,
      cities: cities.map(c => c.city).sort(),
      platformBanner: bannerSetting?.value || '',
    };
  }

  async healthSection() {
    const row = await this.prisma.setting.findUnique({ where: { key: 'healthSection' } });
    if (!row?.jsonValue || typeof row.jsonValue !== 'object') return null;
    const raw = row.jsonValue as Record<string, unknown>;
    return {
      alerts: Array.isArray(raw.alerts) ? raw.alerts : null,
      news: Array.isArray(raw.news) ? raw.news : null,
      emergencyNumbers: Array.isArray(raw.emergencyNumbers) ? raw.emergencyNumbers : null,
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
    };
  }
}

@ApiTags('Public (sans compte)')
@Public()
@Controller('public')
export class PublicController {
  constructor(private readonly svc: PublicService) {}

  @Get('meta')
  meta() {
    return this.svc.meta();
  }

  @Get('health-section')
  healthSection() {
    return this.svc.healthSection();
  }

  @Get('pharmacies')
  directory(@Query() q: DirectoryQuery) {
    return this.svc.directory(q);
  }

  @Get('pharmacies/:id')
  pharmacy(@Param('id', ParseIntPipe) id: number) {
    return this.svc.pharmacy(id);
  }

  @Get('products')
  catalog(@Query() q: CatalogQuery) {
    return this.svc.catalog(q);
  }
}

@Public()
@Controller(UPLOADED_IMAGE_PATH)
export class UploadedImageController {
  constructor(private readonly catalog: PublicService) {}

  @Get(':filename')
  @Header('Cache-Control', 'private, no-store')
  @Header('Vary', 'Authorization, Origin')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Content-Security-Policy', "default-src 'none'; sandbox")
  get(@Param('filename') filename: string, @CurrentUser() user?: AuthUser) {
    return this.catalog.readUploadedImage(filename, user);
  }
}

@Module({ controllers: [PublicController, UploadedImageController], providers: [PublicService], exports: [PublicService] })
export class PublicModule {}
