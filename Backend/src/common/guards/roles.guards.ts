// roles guards goes here
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../decorators/current-user.decorator';

/**
 * Must be used AFTER JwtAuthGuard so request.user is populated.
 *
 * Usage: @UseGuards(JwtAuthGuard, RolesGuard)
 *        @Roles(Role.ORGANISATION)
 */

// Client Request
//       ↓
// JwtAuthGuard
// (token verify)
//       ↓
// request.user attach
//       ↓
// RolesGuard
// (required roles read)
//       ↓
// user.role compare
//       ↓
// Allowed / Forbidden

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator means the route just needs a valid JWT
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    if (!requiredRoles.includes(user.role as Role)) {
      throw new ForbiddenException(
        `This action requires one of the following roles: ${requiredRoles.join(',')}`,
      );
    }

    return true;
  }
}

// ye code NestJS me Role-Based Access Control (RBAC) implement karne ke liye RolesGuard banata hai.
// Ye guard check karta hai ki JWT se authenticated user ka role route ke required role se match karta hai ya nahi. Agar match nahi karta to request 403 Forbidden se reject ho jati hai.
