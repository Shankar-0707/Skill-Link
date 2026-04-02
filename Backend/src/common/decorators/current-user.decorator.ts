import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

type AuthedRequest = Request & { user?: JwtPayload };

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayload | undefined,
    ctx: ExecutionContext,
  ): JwtPayload | JwtPayload[keyof JwtPayload] | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthedRequest>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);

// Ye code NestJs me ek custom parameter decorator (@currentUser)
// create krta hai jo controller methods me directly authenticated user ka data
// access karne ke liye use hota h
// JwtPayload interface define karta hai ki JWT token ke payload me kaun-kaun se fields (jaise sub, email, role, iat, exp) honge.
