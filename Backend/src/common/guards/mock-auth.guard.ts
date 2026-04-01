// src/common/guards/mock-auth.guard.ts
// DELETE THIS FILE before merging with Vidhit's auth — dev only

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../decorators/current-user.decorator';

type MockRequest = Request & { user?: JwtPayload };

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<MockRequest>();

    const headers = request.headers;
    const sub = headers['x-mock-user-id'];
    const email = headers['x-mock-email'];
    const role = headers['x-mock-role'];

    request.user = {
      sub: (typeof sub === 'string' ? sub : undefined) ?? 'user-uuid-cust',
      email: (typeof email === 'string' ? email : undefined) ?? 'test@test.com',
      role: (typeof role === 'string' ? role : undefined) ?? 'CUSTOMER',
    };

    return true;
  }
}
