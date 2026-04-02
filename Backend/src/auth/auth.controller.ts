import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { EmailDto } from './dto/email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { GoogleOauthUser } from './types/google-oauth-user.type';
import type { JwtPayload } from './types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Post('verify-email/request')
  requestEmailVerification(@Body() emailDto: EmailDto) {
    return this.authService.requestEmailVerification(emailDto.email);
  }

  @Post('verify-email/confirm')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(GoogleOauthGuard)
  @Get('google')
  googleLogin() {
    return;
  }

  @UseGuards(GoogleOauthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: Request & { user: GoogleOauthUser },
    @Res() res: Response,
    @Query('state') state?: string,
  ) {
    const frontendCallbackUrl =
      process.env.FRONTEND_AUTH_CALLBACK_URL ||
      'http://localhost:5173/auth/google/callback';

    try {
      const authResponse = await this.authService.authenticateWithGoogle(
        req.user,
        state,
      );
      const redirectUrl = new URL(frontendCallbackUrl);

      redirectUrl.searchParams.set('accessToken', authResponse.accessToken);
      redirectUrl.searchParams.set('refreshToken', authResponse.refreshToken);
      redirectUrl.searchParams.set('role', authResponse.user.role);
      redirectUrl.searchParams.set('email', authResponse.user.email);
      redirectUrl.searchParams.set(
        'user',
        encodeURIComponent(JSON.stringify(authResponse.user)),
      );

      return res.redirect(redirectUrl.toString());
    } catch (error) {
      const redirectUrl = new URL(frontendCallbackUrl);
      const message =
        error instanceof Error
          ? error.message
          : 'Google sign-in failed. Please try again.';

      redirectUrl.searchParams.set('error', message);
      return res.redirect(redirectUrl.toString());
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.authService.deleteAccount(user.sub);
  }
}
