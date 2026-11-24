import {
  BadRequestException, Body, Controller, ForbiddenException, Get, Injectable, Module, NotFoundException,
  Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { Prisma } from '@prisma/client';
import { PublicModule, PublicService } from '../public/public.module';
import { PrismaService } from '../prisma/prisma.service';
import { CoreService } from '../common/core.service';
import { AuthUser, CurrentUser, Public, Roles } from '../common/decorators';

// ---------- DTO ----------
export class SendPublicMessageDto {
  @ApiProperty() @Type(() => Number) @IsInt() pharmacyId: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() productId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) sender?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) subject?: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(3000) body: string;
  @ApiPropertyOptional({ description: 'Adresse e-mail de contact facultative pour une demande anonyme' })
  @IsOptional() @IsEmail() @MaxLength(254) visitorEmail?: string;
}

export class ReplyMessageDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(3000) body: string;
}

function serializeMessage(m: {
  id: number;
  pharmacyId: number;
  threadId: number | null;
  visitorEmail: string | null;
  sender: string;
  phone: string;
  subject: string;
  body: string;
  read: boolean;
  direction: string;
  createdAt: Date;
  productId: number | null;
}) {
  return {
    id: m.id,
    pharmacyId: m.pharmacyId,
    threadId: m.threadId ?? undefined,
    visitorId: m.visitorEmail ?? undefined,
    productId: m.productId ?? undefined,
    sender: m.sender,
    phone: m.phone,
    subject: m.subject,
    body: m.body,
    read: m.read,
    direction: m.direction,
    date: m.createdAt.toISOString(),
  };
}

// ---------- Service ----------
@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly core: CoreService,
    private readonly publicCatalog: PublicService,
  ) { }

  async sendPublic(user: AuthUser | undefined, dto: SendPublicMessageDto) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id: dto.pharmacyId } });
    if (!pharmacy || !this.core.isPharmacyActiveAndValid(pharmacy)) {
      throw new NotFoundException('Pharmacie introuvable ou non disponible.');
    }
    if (dto.productId !== undefined && dto.productId !== null) {
      const product = await this.prisma.product.findFirst({
        where: { ...await this.publicCatalog.visibleProductWhere(), id: dto.productId, pharmacyId: dto.pharmacyId },
      });
      if (!product) throw new NotFoundException('Produit introuvable ou non publié pour cet établissement.');
    }

    const cleanPhone = (dto.phone || '').trim();
    if (user?.role !== 'VISITOR' && cleanPhone.length < 6) {
      throw new BadRequestException('Numéro de téléphone requis (6 caractères minimum).');
    }

    const email = (user?.role === 'VISITOR' ? user.email : dto.visitorEmail)?.trim().toLowerCase() || null;
    await this.core.assertDistributedRateLimit('public_message', `${dto.pharmacyId}:${email || cleanPhone}`, 15, 60_000);
    const msg = await this.prisma.message.create({
      data: {
        pharmacyId: dto.pharmacyId,
        productId: dto.productId,
        visitorId: user?.role === 'VISITOR' ? user.id : null,
        visitorEmail: email,
        sender: dto.sender?.trim() || user?.name || 'Visiteur',
        phone: cleanPhone,
        subject: dto.subject?.trim() || 'Demande d’information',
        body: dto.body.trim(),
        direction: 'visitor',
        read: false,
      },
    });

    const prefs = await this.prisma.pharmacyPreferences.findUnique({ where: { pharmacyId: dto.pharmacyId } });
    if (!prefs || prefs.notificationMessages) {
      await this.core.notify(
        dto.pharmacyId,
        'Nouveau message visiteur',
        `${msg.sender} : ${msg.subject}`,
        'info',
      );
    }

    await this.core.audit(user, 'Message envoyé à la pharmacie', 'Message', msg.id);
    void this.core.emitRealtime('message', 'created', dto.pharmacyId);
    return serializeMessage(msg);
  }

  async listForPharmacy(user: AuthUser, pharmacyId: number) {
    await this.core.assertPharmacyAccess(user, pharmacyId);
    const rows = await this.prisma.message.findMany({
      where: { pharmacyId, OR: [{ threadId: null }, { thread: { pharmacyId, threadId: null } }] },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(serializeMessage);
  }

  async replyAsPharmacy(user: AuthUser, threadId: number, dto: ReplyMessageDto) {
    const parent = await this.pharmacyThread(user, threadId);
    const pharmacy = await this.core.assertPharmacyAccess(user, parent.pharmacyId);
    this.core.assertPharmacyOperational(pharmacy, true);

    const rootId = parent.id;
    const created = await this.prisma.$transaction(async tx => {
      const message = await tx.message.create({
        data: {
          pharmacyId: parent.pharmacyId,
          threadId: rootId,
          visitorId: parent.visitorId,
          visitorEmail: parent.visitorEmail,
          productId: parent.productId,
          sender: pharmacy.name,
          phone: pharmacy.phone,
          subject: `Re: ${parent.subject}`,
          body: dto.body.trim(),
          direction: 'pharmacy',
          read: true,
        },
      });
      await tx.message.updateMany({ where: this.unreadThread(parent.pharmacyId, rootId), data: { read: true } });
      return message;
    });
    await this.core.audit(user, 'Réponse envoyée au visiteur', 'Message', created.id);
    void this.core.emitRealtime('message', 'pharmacy_reply', parent.pharmacyId);
    return serializeMessage(created);
  }

  async markRead(user: AuthUser, id: number) {
    const root = await this.pharmacyThread(user, id);
    const changed = await this.prisma.message.updateMany({
      where: this.unreadThread(root.pharmacyId, root.id),
      data: { read: true },
    });
    return { updated: changed.count };
  }

  private async pharmacyThread(user: AuthUser, id: number) {
    const message = await this.prisma.message.findFirst({ where: { id, pharmacy: this.core.pharmacyAccessScope(user) } });
    if (!message) throw new NotFoundException('Fil de discussion introuvable.');
    if (message.threadId === null) return message;
    const root = await this.prisma.message.findFirst({
      where: { id: message.threadId, pharmacyId: message.pharmacyId, threadId: null },
    });
    if (!root) throw new NotFoundException('Fil de discussion introuvable.');
    return root;
  }

  private unreadThread(pharmacyId: number, rootId: number): Prisma.MessageWhereInput {
    return {
      pharmacyId, direction: 'visitor', read: false,
      OR: [{ id: rootId }, { threadId: rootId }],
    };
  }

  async visitorThreads(user: AuthUser) {
    if (user.role !== 'VISITOR') {
      throw new ForbiddenException('Accès réservé aux comptes patients/visiteurs authentifiés.');
    }
    const roots = await this.prisma.message.findMany({
      where: { threadId: null, visitorId: user.id },
      include: {
        pharmacy: { select: { id: true, name: true, phone: true, city: true, area: true } },
        replies: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return roots.map(root => ({ ...root, replies: root.replies.filter(reply => reply.pharmacyId === root.pharmacyId) }));
  }

  async listForVisitor(user: AuthUser) {
    const roots = await this.visitorThreads(user);
    return roots.map(root => ({
      ...serializeMessage(root),
      pharmacy: root.pharmacy,
      replies: root.replies.map(serializeMessage),
    }));
  }

  async replyAsVisitor(user: AuthUser, threadId: number, dto: ReplyMessageDto) {
    if (user.role !== 'VISITOR') {
      throw new ForbiddenException('Accès réservé aux comptes patients/visiteurs authentifiés.');
    }
    const selected = await this.prisma.message.findUnique({ where: { id: threadId } });
    if (!selected) throw new NotFoundException('Fil de discussion introuvable.');
    const parent = await this.prisma.message.findFirst({
      where: { id: selected.threadId ?? selected.id, pharmacyId: selected.pharmacyId, threadId: null, visitorId: user.id },
    });
    if (!parent) throw new NotFoundException('Fil de discussion introuvable.');
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id: parent.pharmacyId } });
    if (!pharmacy || !this.core.isPharmacyActiveAndValid(pharmacy)) {
      throw new ForbiddenException('Cet établissement n’accepte plus de messages actuellement.');
    }
    const email = user.email.trim().toLowerCase();
    const created = await this.prisma.message.create({
      data: {
        pharmacyId: parent.pharmacyId,
        threadId: parent.id,
        visitorId: user.id,
        visitorEmail: email,
        productId: parent.productId,
        sender: user.name || parent.sender || 'Visiteur',
        phone: parent.phone,
        subject: parent.subject,
        body: dto.body.trim(),
        direction: 'visitor',
        read: false,
      },
    });
    await this.core.audit(user, 'Réponse visiteur envoyée', 'Message', created.id);
    void this.core.emitRealtime('message', 'visitor_reply', parent.pharmacyId);
    return serializeMessage(created);
  }
}

// ---------- Controller ----------
@ApiTags('Messagerie visiteur ↔ pharmacie')
@Controller()
export class MessagesController {
  constructor(private readonly svc: MessagesService) { }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('messages')
  sendPublic(@CurrentUser() user: AuthUser | undefined, @Body() dto: SendPublicMessageDto) {
    return this.svc.sendPublic(user, dto);
  }

  @ApiBearerAuth()
  @Roles('PHARMACIST', 'ADMIN')
  @Get('pharmacies/:pharmacyId/messages')
  listPharmacy(@CurrentUser() user: AuthUser, @Param('pharmacyId', ParseIntPipe) pharmacyId: number) {
    return this.svc.listForPharmacy(user, pharmacyId);
  }

  @ApiBearerAuth()
  @Roles('PHARMACIST', 'ADMIN')
  @Post('messages/:threadId/reply')
  replyPharmacy(
    @CurrentUser() user: AuthUser,
    @Param('threadId', ParseIntPipe) threadId: number,
    @Body() dto: ReplyMessageDto,
  ) {
    return this.svc.replyAsPharmacy(user, threadId, dto);
  }

  @ApiBearerAuth()
  @Roles('PHARMACIST', 'ADMIN')
  @Patch('messages/:id/read')
  markRead(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.svc.markRead(user, id);
  }

  @ApiBearerAuth()
  @Roles('VISITOR')
  @Get('messages/visitor')
  listVisitor(@CurrentUser() user: AuthUser) {
    return this.svc.listForVisitor(user);
  }

  @ApiBearerAuth()
  @Roles('VISITOR')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('messages/:threadId/visitor-reply')
  replyVisitor(
    @CurrentUser() user: AuthUser,
    @Param('threadId', ParseIntPipe) threadId: number,
    @Body() dto: ReplyMessageDto,
  ) {
    return this.svc.replyAsVisitor(user, threadId, dto);
  }
}

@Module({ imports: [PublicModule], controllers: [MessagesController], providers: [MessagesService], exports: [MessagesService] })
export class MessagesModule { }
