import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, IS_PUBLIC_KEY, ROLES_KEY } from './decorators';
import type { Role } from './constants';

/**
 * Garde globale : vérifie le jeton JWT (Authorization: Bearer ...) et contrôle les rôles.
 * Les routes @Public() acceptent les requêtes anonymes mais attachent l'utilisateur si un jeton valide est présent.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, targets);
    const req = context.switchToHttp().getRequest();

    const user = await this.resolveUser(req.headers?.authorization);
    if (user) req.user = user;

    if (isPublic) return true;
    if (!user) throw new UnauthorizedException('Authentification requise.');
    if (roles?.length && !roles.includes(user.role)) {
      throw new ForbiddenException('Accès refusé pour ce rôle.');
    }
    return true;
  }

  private async resolveUser(header?: string): Promise<AuthUser | null> {
    if (!header?.startsWith('Bearer ')) return null;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number; tv?: number }>(header.slice(7));
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.active) return null;
      if (typeof payload.tv !== 'number' || payload.tv !== user.tokenVersion) return null;
      return { id: user.id, email: user.email, role: user.role as Role, name: user.name };
    } catch {
      return null;
    }
  }
}
