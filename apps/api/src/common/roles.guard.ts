import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@forma/types';
import type { AuthenticatedRequest } from './auth.guard';
import { ROLES_KEY } from './roles.decorator';
import { IdentityService } from '../modules/identity/identity.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly identityService: IdentityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('errors.forbidden');
    }

    const roles = await this.identityService.computeRoles(user.id);
    const allowed = requiredRoles.some((role) => roles.includes(role));
    if (!allowed) {
      throw new ForbiddenException('errors.forbidden');
    }

    return true;
  }
}
