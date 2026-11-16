import { Body, Controller, Injectable, Module, NotFoundException, Post } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PublicModule, PublicService } from '../public/public.module';
import { PrismaService } from '../prisma/prisma.service';
import { CoreService } from '../common/core.service';
import { AuthUser, CurrentUser, Public } from '../common/decorators';

export class CreateReportDto {
  @ApiProperty() @Type(() => Number) @IsInt() pharmacyId: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() productId?: number;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) reason: string;
  @ApiProperty() @IsString() @MinLength(4) @MaxLength(2000) details: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) target?: string;
}

export class ContactFormDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) topic: string;
  @ApiProperty() @IsString() @MinLength(4) @MaxLength(4000) message: string;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly core: CoreService,
    private readonly publicCatalog: PublicService,
  ) { }

  async createReport(user: AuthUser | undefined, dto: CreateReportDto) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id: dto.pharmacyId } });
    if (!pharmacy || !this.core.isPharmacyActiveAndValid(pharmacy)) {
      throw new NotFoundException('Pharmacie introuvable ou non active.');
    }
    const hasProduct = dto.productId !== undefined && dto.productId !== null;
    const product = hasProduct
      ? await this.prisma.product.findFirst({ where: { ...await this.publicCatalog.visibleProductWhere(), id: dto.productId, pharmacyId: pharmacy.id } })
      : null;
    if (hasProduct && !product) throw new NotFoundException('Produit introuvable ou non publié pour cet établissement.');

    const target = product ? `${product.name} (${pharmacy.name})` : pharmacy.name;
    const created = await this.prisma.report.create({
      data: {
        pharmacyId: pharmacy.id,
        productId: product?.id ?? null,
        target,
        reason: dto.reason.trim(),
        details: dto.details.trim(),
        status: 'À traiter',
        reporterEmail: user?.email ?? null,
      },
    });
    await this.core.audit(user, 'Signalement soumis', 'Signalement', created.id);
    const { reporterEmail: _omitted, ...publicReport } = created;
    return { ...publicReport, date: created.createdAt.toISOString() };
  }

  async contact(user: AuthUser | undefined, dto: ContactFormDto) {
    const created = await this.prisma.contactMessage.create({
      data: {
        userId: user?.id ?? null,
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        topic: dto.topic.trim(),
        message: dto.message.trim(),
        status: 'Nouveau',
      },
    });
    await this.core.audit(user, `Message contact (${dto.topic.trim()}) de ${dto.email}`, 'Contact', created.id);
    return {
      ok: true,
      id: created.id,
      message: 'Message reçu par l’équipe PharmaConnect. Réponse prévue sous 24 à 48 heures ouvrées.',
    };
  }
}

@ApiTags('Signalements & contact')
@Public()
@Controller()
export class ReportsController {
  constructor(private readonly svc: ReportsService) { }

  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('reports')
  createReport(@CurrentUser() user: AuthUser | undefined, @Body() dto: CreateReportDto) {
    return this.svc.createReport(user, dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('public/contact')
  contact(@CurrentUser() user: AuthUser | undefined, @Body() dto: ContactFormDto) {
    return this.svc.contact(user, dto);
  }
}

@Module({ imports: [PublicModule], controllers: [ReportsController], providers: [ReportsService], exports: [ReportsService] })
export class ReportsModule { }
