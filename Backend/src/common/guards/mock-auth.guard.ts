// src/common/guards/mock-auth.guard.ts
// DELETE THIS FILE before merging with Vidhit's auth — dev only

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()

    // Read fake identity from headers — you control this in Postman
    request.user = {
      sub: request.headers['x-mock-user-id'] ?? 'user-uuid-cust',
      email: request.headers['x-mock-email'] ?? 'test@test.com',
      role: request.headers['x-mock-role'] ?? 'CUSTOMER',
    }

    return true
  }
}