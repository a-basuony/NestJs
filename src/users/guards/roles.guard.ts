// users/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserType } from '../../utils/enums';
import { JWTPayloadType } from '../../utils/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get the required roles from the route handler metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access (or you can deny – decide based on your policy)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no role restriction, allow
    }

    // 2. Get the user payload from the request (attached by JWTAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user: JWTPayloadType = request['user']; // same key used in JWTAuthGuard

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 3. Check if the user's role matches any of the required roles
    const hasRole = requiredRoles.some((role) => user.userType === role);
    if (!hasRole) {
      throw new ForbiddenException(
        'User does not have the required role | Access denied | You do not have permission to access this resource',
      );
    }

    return true;
  }
}
