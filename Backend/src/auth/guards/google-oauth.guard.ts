import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<{ query: { role?: string } }>();

    return {
      scope: ['email', 'profile'],
      session: false,
      state: request.query.role,
      prompt: 'select_account',
    };
  }
}
