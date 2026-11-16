import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Role } from './constants';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  name: string;
}

export const IS_PUBLIC_KEY = 'isPublic';
/** Route accessible sans authentification (l'utilisateur est tout de même attaché si un jeton valide est fourni). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
