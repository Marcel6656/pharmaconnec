import { Body, Controller, Get, HttpException, HttpStatus, Injectable, Module, Patch, Post, BadRequestException, ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { Prisma, type User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoreService } from '../common/core.service';
import { AuthUser, CurrentUser, Public } from '../common/decorators';
import { ROLES, Role } from '../common/constants';

const PASSWORD_COMPLEXITY_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
const PASSWORD_COMPLEXITY_MSG = 'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre.';

// ---------- DTO ----------
export class RegisterVisitorDto {
  @ApiProperty() @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)) @IsString() @MinLength(2) @MaxLength(120) name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) @MaxLength(128) @Matches(PASSWORD_COMPLEXITY_RE, { message: PASSWORD_COMPLEXITY_MSG }) password: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(1) password: string;
  @ApiPropertyOptional({ enum: ROLES, description: 'Restreint la connexion à un espace (ex. PHARMACIST pour le portail pharmacie).' })
  @IsOptional() @IsIn(ROLES) role?: Role;
}

export class GoogleLoginDto {
  @ApiPropertyOptional({ description: 'ID token Google (Google Identity Services).' })
  @IsOptional() @IsString() @MaxLength(8192) idToken?: string;
  @ApiPropertyOptional({ description: 'Jeton d’accès OAuth2 Google (oauth2.initTokenClient).' })
  @IsOptional() @IsString() @MaxLength(8192) accessToken?: string;
  @ApiPropertyOptional({ enum: ROLES, description: 'Espace cible (VISITOR par défaut ou PHARMACIST).' })
  @IsOptional() @IsIn(ROLES) role?: Role;
  @ApiPropertyOptional({ description: 'Confirme la première association à un compte existant.' })
  @IsOptional() @IsString() @MaxLength(128) currentPassword?: string;
}

export class UpdateMeDto {
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)) @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) phone?: string;
}

export class ChangePasswordDto {
  @ApiProperty() @IsString() currentPassword: string;
  @ApiProperty() @IsString() @MinLength(8) @MaxLength(128) @Matches(PASSWORD_COMPLEXITY_RE, { message: PASSWORD_COMPLEXITY_MSG }) newPassword: string;
}

// ---------- Service ----------
@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();
  private readonly failedLogins = new Map<string, { count: number; lockedUntil: number; updatedAt: number }>();
  private static readonly MAX_FAILED_LOGINS = 5;
  private static readonly LOCKOUT_MS = 15 * 60_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly core: CoreService,
  ) { }

  private recordFailedLogin(email: string) {
    const now = Date.now();
    if (this.failedLogins.size > 1000) {
      for (const [k, v] of this.failedLogins.entries()) {
        if (now - v.updatedAt > AuthService.LOCKOUT_MS) this.failedLogins.delete(k);
      }
    }
    const prev = this.failedLogins.get(email);
    const activeWindow = prev && now - prev.updatedAt <= AuthService.LOCKOUT_MS ? prev : { count: 0, lockedUntil: 0, updatedAt: now };
    const nextCount = activeWindow.count + 1;
    const lockedUntil = nextCount >= AuthService.MAX_FAILED_LOGINS ? now + AuthService.LOCKOUT_MS : 0;
    this.failedLogins.set(email, { count: nextCount, lockedUntil, updatedAt: now });
  }

  private assertNotLocked(email: string) {
    const entry = this.failedLogins.get(email);
    if (!entry) return;
    if (entry.lockedUntil > Date.now()) {
      throw new HttpException('Trop de tentatives échouées. Réessayez dans 15 minutes.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (Date.now() - entry.updatedAt > AuthService.LOCKOUT_MS) {
      this.failedLogins.delete(email);
    }
  }

  static hash(password: string) {
    if (Buffer.byteLength(password, 'utf8') > 72) throw new BadRequestException('Le mot de passe ne peut pas dépasser 72 octets.');
    return bcrypt.hash(password, 10);
  }

  async issue(user: User) {
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role, tv: user.tokenVersion });
    return { accessToken, user: this.publicUser(user) };
  }

  publicUser(u: User) {
    return { id: u.id, email: u.email, name: u.name, role: u.role, provider: u.provider, phone: u.phone ?? undefined };
  }

  async registerVisitor(dto: RegisterVisitorDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) throw new ConflictException('Un compte existe déjà avec cette adresse.');
    const user = await this.prisma.user.create({
      data: { email, name: dto.name.trim(), passwordHash: await AuthService.hash(dto.password), role: 'VISITOR', provider: 'email' },
    });
    await this.core.audit({ id: user.id, email, role: 'VISITOR', name: user.name }, 'Compte visiteur créé', 'Utilisateur', user.id);
    return this.issue(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    this.assertNotLocked(email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    const ok = user?.passwordHash && user.active && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !ok) {
      this.recordFailedLogin(email);
      throw new UnauthorizedException('E-mail ou mot de passe incorrect.');
    }
    if (dto.role && user.role !== dto.role) throw new ForbiddenException('Ce compte n’a pas accès à cet espace.');
    this.failedLogins.delete(email);
    return this.issue(user);
  }

  getGoogleConfig() {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || null;
    return { enabled: Boolean(clientId), clientId, demoMode: false };
  }

  private async verifyGoogleIdentity(dto: GoogleLoginDto) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      throw new BadRequestException('Connexion Google non configurée (renseignez GOOGLE_CLIENT_ID dans backend/.env).');
    }

    if (dto.idToken) {
      const ticket = await this.googleClient.verifyIdToken({ idToken: dto.idToken, audience: clientId }).catch(() => null);
      const payload = ticket?.getPayload();
      if (!payload?.email || payload.email_verified !== true || !payload.sub) {
        throw new UnauthorizedException('Identité Google invalide ou non vérifiée.');
      }
      const email = payload.email.trim().toLowerCase();
      return { email, name: payload.name || email.split('@')[0], sub: payload.sub };
    } else if (dto.accessToken) {
      const tokeninfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(dto.accessToken)}`,
        { signal: AbortSignal.timeout(10_000) },
      ).catch(() => null);
      const tokeninfo = tokeninfoRes?.ok
        ? ((await tokeninfoRes.json().catch(() => null)) as { aud?: string; azp?: string } | null)
        : null;
      if (tokeninfo?.aud !== clientId || (tokeninfo.azp && tokeninfo.azp !== clientId)) {
        throw new UnauthorizedException('Jeton d’accès Google invalide pour cette application.');
      }
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${dto.accessToken}` },
        signal: AbortSignal.timeout(10_000),
      }).catch(() => null);
      if (!userinfoRes?.ok) {
        throw new UnauthorizedException('Jeton d’accès Google invalide ou expiré.');
      }
      const userinfo = (await userinfoRes.json().catch(() => null)) as {
        email?: string;
        email_verified?: boolean;
        name?: string;
        sub?: string;
      } | null;
      if (typeof userinfo?.email !== 'string' || userinfo.email_verified !== true || typeof userinfo.sub !== 'string' || !userinfo.sub) {
        throw new UnauthorizedException('Identité Google invalide ou non vérifiée.');
      }
      const email = userinfo.email.trim().toLowerCase();
      return { email, name: userinfo.name || email.split('@')[0], sub: userinfo.sub };
    }
    throw new BadRequestException('Un jeton Google (idToken ou accessToken) est requis.');
  }

  async google(dto: GoogleLoginDto) {
    const targetRole = dto.role || 'VISITOR';
    if (targetRole === 'ADMIN') {
      throw new ForbiddenException('La connexion Google n’est pas disponible pour l’espace administration.');
    }

    const identity = await this.verifyGoogleIdentity(dto);
    const linkedUser = await this.prisma.user.findUnique({ where: { googleSub: identity.sub } });
    let user: User;
    if (linkedUser) {
      this.assertGoogleAccountAccess(linkedUser, targetRole);
      user = linkedUser;
    } else {
      const existing = await this.prisma.user.findUnique({ where: { email: identity.email } });
      if (existing) {
        this.assertGoogleAccountAccess(existing, targetRole);
        user = await this.linkGoogleAccount(existing, identity.sub, dto.currentPassword);
      } else {
        if (targetRole !== 'VISITOR') {
          throw new ForbiddenException('Associez d’abord un compte PharmaConnect professionnel à cette adresse.');
        }
        user = await this.prisma.user.create({
          data: { email: identity.email, name: identity.name, role: 'VISITOR', provider: 'google', googleSub: identity.sub },
        }).catch(error => this.handleGoogleConflict(error));
        await this.core.audit({ id: user.id, email: user.email, role: 'VISITOR', name: user.name }, 'Compte visiteur créé via Google', 'Utilisateur', user.id);
      }
    }
    return this.issue(user);
  }

  private assertGoogleAccountAccess(user: User, targetRole: Role) {
    if (!user.active || user.role !== targetRole) {
      throw new ForbiddenException('Ce compte Google n’autorise pas l’accès à cet espace.');
    }
  }

  private async linkGoogleAccount(user: User, googleSub: string, password?: string) {
    if (user.googleSub) throw new ForbiddenException('Ce compte est déjà associé à une autre identité Google.');
    if (!user.passwordHash || !password) {
      throw new ConflictException('Pour associer Google à ce compte, saisissez votre mot de passe PharmaConnect puis cliquez à nouveau sur Continuer avec Google.');
    }
    this.assertNotLocked(user.email);
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      this.recordFailedLogin(user.email);
      throw new UnauthorizedException('Mot de passe PharmaConnect incorrect.');
    }

    const linked = await this.prisma.serializable(async tx => {
      const matched = await tx.user.updateMany({
        where: {
          id: user.id, active: true, role: user.role, googleSub: null,
          passwordHash: user.passwordHash, tokenVersion: user.tokenVersion,
        },
        data: { googleSub },
      });
      if (!matched.count) throw new ConflictException('Le compte a changé. Renouvelez la connexion.');
      await this.core.audit({ id: user.id, email: user.email, role: user.role as Role, name: user.name }, 'Identité Google associée après confirmation du mot de passe', 'Utilisateur', user.id, tx);
      return tx.user.findUniqueOrThrow({ where: { id: user.id } });
    }).catch(error => this.handleGoogleConflict(error));
    this.failedLogins.delete(user.email);
    return linked;
  }

  private handleGoogleConflict(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Cette adresse ou identité Google est déjà associée. Renouvelez la connexion.');
    }
    throw error;
  }

  async me(authUser: AuthUser) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: authUser.id } });
    const pharmacies =
      user.role === 'PHARMACIST'
        ? await this.prisma.pharmacy.findMany({ where: { ownerId: user.id }, select: { id: true, name: true, status: true }, orderBy: { id: 'asc' } })
        : [];
    return { ...this.publicUser(user), pharmacies };
  }

  async updateMe(authUser: AuthUser, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({ where: { id: authUser.id }, data: { name: dto.name?.trim(), phone: dto.phone?.trim() } });
    return this.publicUser(user);
  }

  async changePassword(authUser: AuthUser, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: authUser.id } });
    if (!user.passwordHash || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await AuthService.hash(dto.newPassword),
        tokenVersion: { increment: 1 },
      },
    });
    await this.core.audit(authUser, 'Mot de passe modifié (sessions précédentes révoquées)', 'Utilisateur', user.id);
    const issued = await this.issue(updated);
    return { ok: true, ...issued };
  }

  async logoutAll(authUser: AuthUser) {
    await this.prisma.user.update({
      where: { id: authUser.id },
      data: { tokenVersion: { increment: 1 } },
    });
    await this.core.audit(authUser, 'Déconnexion de toutes les sessions', 'Utilisateur', authUser.id);
    return { ok: true };
  }
}

// ---------- Controller ----------
@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) { }

  @Public() @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  register(@Body() dto: RegisterVisitorDto) {
    return this.auth.registerVisitor(dto);
  }

  @Public() @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Get('google/config')
  googleConfig() {
    return this.auth.getGoogleConfig();
  }

  @Public() @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('google')
  google(@Body() dto: GoogleLoginDto) {
    return this.auth.google(dto);
  }

  @ApiBearerAuth() @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user);
  }

  @ApiBearerAuth() @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.auth.updateMe(user, dto);
  }

  @ApiBearerAuth() @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('change-password')
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user, dto);
  }

  @ApiBearerAuth() @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('logout-all')
  logoutAll(@CurrentUser() user: AuthUser) {
    return this.auth.logoutAll(user);
  }
}

@Module({ controllers: [AuthController], providers: [AuthService], exports: [AuthService] })
export class AuthModule { }
