import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Guards routes that require a valid JWT.
 * Vidhit's AuthModule must register PassportModule with JwtStrategy named 'jwt'.
 *
 * Usage: @UseGuards(JwtAuthGuard)
 */

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<T = any>(err: any, user: T): T {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing token');
    }

    return user;
  }
}

// Ye code NestJS me ek custom JWT authentication guard (JwtAuthGuard) define karta hai jo routes ko protect karta hai taaki sirf valid JWT token wale users hi access kar saken
