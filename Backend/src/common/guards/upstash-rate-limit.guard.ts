import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Request, Response } from 'express';
import { SKIP_RATE_LIMIT_KEY } from '../decorators/skip-rate-limit.decorator';

/**
 * Global rate-limit guard backed by Upstash Redis.
 *
 * Limit: 50 requests per 10 seconds per IP address (sliding window).
 * Exceeding the limit returns HTTP 429 with Retry-After and X-RateLimit-* headers.
 *
 * Usage: registered globally via APP_GUARD in AppModule.
 */
@Injectable()
export class UpstashRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(UpstashRateLimitGuard.name);
  private readonly ratelimit: Ratelimit;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    const url = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const token = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!url || !token) {
      this.logger.error(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set. Rate limiting is DISABLED.',
      );
    }

    this.ratelimit = new Ratelimit({
      redis: new Redis({ url: url ?? '', token: token ?? '' }),
      limiter: Ratelimit.slidingWindow(50, '10 s'),
      analytics: true,
      prefix: 'skilllink:rl',
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Allow routes decorated with @SkipRateLimit() to bypass
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    // Resolve the caller's IP, respecting reverse-proxy headers
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';

    let result: Awaited<ReturnType<Ratelimit['limit']>>;

    try {
      result = await this.ratelimit.limit(ip);
    } catch (error) {
      // If Upstash is unreachable, fail open (allow the request) and log the error
      this.logger.error(`Upstash rate-limit check failed: ${String(error)}`);
      return true;
    }

    // Always attach informational headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(result.reset).toUTCString(),
    );

    if (!result.success) {
      const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded. Try again in ${retryAfterSeconds} second(s).`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
