import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from './authz.domain';
import { AuthzService } from './authz.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authzService: AuthzService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'];
    const actualRoles = this.authzService.getRolesFromKey(apiKey);

    const hasAccess = requiredRoles.some((role) => actualRoles.includes(role));

    if (hasAccess) return true;

    throw new ForbiddenException();
  }
}
