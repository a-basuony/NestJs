// users/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../utils/enums';

export const ROLES_KEY = 'roles'; // metadata key

/**
 * Decorator that defines which user roles are allowed to access the route.
 * @param roles - list of allowed roles (e.g., 'admin', 'user')
 */
export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
