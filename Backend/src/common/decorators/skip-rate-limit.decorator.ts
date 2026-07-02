import { SetMetadata } from '@nestjs/common';

export const SKIP_RATE_LIMIT_KEY = 'skipRateLimit';

/**
 * Attach to any controller or route handler to bypass the global
 * UpstashRateLimitGuard.
 *
 * Usage:
 *   @SkipRateLimit()
 *   @Get('google')
 *   googleLogin() { ... }
 */
export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true);
