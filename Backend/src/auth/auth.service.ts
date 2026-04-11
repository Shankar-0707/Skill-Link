import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, Prisma, Role } from '@prisma/client';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailService } from './mail.service';
import type { GoogleOauthUser } from './types/google-oauth-user.type';
import type { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.ensurePublicRole(registerDto.role);
    this.ensureRoleSpecificRegistrationFields(registerDto);

    const email = this.normalizeEmail(registerDto.email);
    const phone = this.normalizeOptionalString(registerDto.phone);
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or phone already exists.',
      );
    }

    const passwordHash = this.hashPassword(registerDto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          name: this.normalizeOptionalString(registerDto.name),
          phone,
          passwordHash,
          role: registerDto.role,
          authProvider: AuthProvider.LOCAL,
          profileImage: this.normalizeOptionalString(registerDto.profileImage),
          emailVerified: false,
        },
      });

      await this.createRoleProfile(
        tx,
        createdUser.id,
        registerDto.role,
        registerDto,
      );

      return tx.user.findUniqueOrThrow({
        where: { id: createdUser.id },
        include: userProfileInclude,
      });
    });

    await this.issueEmailVerification(user.id, user.email, user.name);

    return {
      success: true,
      message:
        'Registration successful. Please verify your email before logging in.',
      user: this.toPublicUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const email = this.normalizeEmail(loginDto.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: userProfileInclude,
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please continue with Google.',
      );
    }

    if (!this.verifyPassword(loginDto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.emailVerified && user.role !== Role.ADMIN) {
      throw new UnauthorizedException(
        'Email not verified. Please verify your email first.',
      );
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: userProfileInclude,
        },
      },
    });

    if (!tokenRecord || tokenRecord.revoked) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (tokenRecord.expiresAt <= new Date()) {
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });
      throw new UnauthorizedException('Refresh token has expired.');
    }

    if (!tokenRecord.user.isActive || tokenRecord.user.deletedAt) {
      throw new UnauthorizedException('User account is inactive.');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

    return this.buildAuthResponse(tokenRecord.user);
  }

  async logout(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
    });

    if (!tokenRecord) {
      return { success: true };
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

    return { success: true };
  }

  async requestEmailVerification(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive || user.deletedAt) {
      return {
        success: true,
        message: 'If the account exists, a verification email has been sent.',
      };
    }

    if (user.emailVerified) {
      return { success: true, message: 'Email is already verified.' };
    }

    await this.issueEmailVerification(user.id, user.email, user.name);

    return { success: true, message: 'Verification email sent.' };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.consumedAt || record.expiresAt <= new Date()) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      });

      await tx.emailVerificationToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });
    });

    return { success: true, message: 'Email verified successfully.' };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive || user.deletedAt || !user.passwordHash) {
      return {
        success: true,
        message: 'If the account exists, a password reset email has been sent.',
      };
    }

    await this.issuePasswordReset(user.id, user.email, user.name);

    return {
      success: true,
      message: 'If the account exists, a password reset email has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const tokenHash = this.hashToken(resetPasswordDto.token);
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.consumedAt || record.expiresAt <= new Date()) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const newPasswordHash = this.hashPassword(resetPasswordDto.newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash: newPasswordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });

      await tx.refreshToken.updateMany({
        where: { userId: record.userId, revoked: false },
        data: { revoked: true },
      });
    });

    return { success: true, message: 'Password reset successfully.' };
  }

  async authenticateWithGoogle(
    googleUser: GoogleOauthUser,
    requestedRole?: string,
  ) {
    const role = this.resolvePublicRole(requestedRole);

    const user = await this.prisma.$transaction(async (tx) => {
      const existingByGoogleId = await tx.user.findUnique({
        where: { googleId: googleUser.googleId },
        include: userProfileInclude,
      });

      if (existingByGoogleId) {
        if (!existingByGoogleId.isActive || existingByGoogleId.deletedAt) {
          throw new UnauthorizedException('User account is inactive.');
        }
        return existingByGoogleId;
      }

      const existingByEmail = await tx.user.findUnique({
        where: { email: googleUser.email },
        include: userProfileInclude,
      });

      if (existingByEmail) {
        if (!existingByEmail.isActive || existingByEmail.deletedAt) {
          throw new UnauthorizedException('User account is inactive.');
        }

        await tx.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: googleUser.googleId,
            emailVerified: true,
            profileImage: existingByEmail.profileImage ?? googleUser.picture,
            name: existingByEmail.name ?? googleUser.name,
          },
        });

        return tx.user.findUniqueOrThrow({
          where: { id: existingByEmail.id },
          include: userProfileInclude,
        });
      }

      const createdUser = await tx.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          profileImage: googleUser.picture,
          role,
          authProvider: AuthProvider.GOOGLE,
          googleId: googleUser.googleId,
          emailVerified: true,
        },
      });

      await this.createRoleProfile(tx, createdUser.id, role, {
        skills: [],
        businessName:
          role === Role.ORGANISATION
            ? `${googleUser.name ?? 'Google'} Organisation`
            : undefined,
        businessType: role === Role.ORGANISATION ? 'General' : undefined,
      });

      return tx.user.findUniqueOrThrow({
        where: { id: createdUser.id },
        include: userProfileInclude,
      });
    });

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string) {
    const user = await this.findActiveUserById(userId);
    const publicUser = this.toPublicUser(user);
    this.logger.debug(`Fetching profile for user ${userId}: ${JSON.stringify(publicUser)}`);
    return publicUser;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.findActiveUserById(userId);

    if (updateProfileDto.email && user.authProvider === AuthProvider.GOOGLE) {
      throw new BadRequestException(
        'Email changes are not supported for Google-authenticated accounts.',
      );
    }

    const nextEmail = updateProfileDto.email?.trim()
      ? this.normalizeEmail(updateProfileDto.email)
      : undefined;
    const nextPhone =
      updateProfileDto.phone !== undefined
        ? this.normalizeOptionalString(updateProfileDto.phone)
        : undefined;

    if (nextEmail || nextPhone) {
      const conflictUser = await this.prisma.user.findFirst({
        where: {
          id: { not: userId },
          OR: [
            ...(nextEmail ? [{ email: nextEmail }] : []),
            ...(nextPhone ? [{ phone: nextPhone }] : []),
          ],
        },
      });

      if (conflictUser) {
        throw new ConflictException('Email or phone is already in use.');
      }
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          email: nextEmail,
          emailVerified: nextEmail ? false : undefined,
          name: this.normalizedField(updateProfileDto.name),
          phone: nextPhone,
          profileImage: this.normalizedField(updateProfileDto.profileImage),
        },
      });

      if (user.role === Role.WORKER) {
        await tx.worker.update({
          where: { userId },
          data: {
            bio: this.normalizedField(updateProfileDto.bio),
            experience: updateProfileDto.experience,
            serviceRadius: updateProfileDto.serviceRadius,
            isAvailable: updateProfileDto.isAvailable,
            skills: updateProfileDto.skills,
          },
        });
      }

      if (user.role === Role.ORGANISATION) {
        await tx.organisation.update({
          where: { userId },
          data: {
            businessName: this.normalizedRequiredField(
              updateProfileDto.businessName,
            ),
            businessType: this.normalizedRequiredField(
              updateProfileDto.businessType,
            ),
            description: this.normalizedField(updateProfileDto.description),
          },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        include: userProfileInclude,
      });
    });

    if (nextEmail) {
      await this.issueEmailVerification(
        updatedUser.id,
        updatedUser.email,
        updatedUser.name,
      );
    }

    return this.toPublicUser(updatedUser);
  }

  async deleteAccount(userId: string) {
    const user = await this.findActiveUserById(userId);
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });

      await tx.emailVerificationToken.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: now },
      });

      await tx.passwordResetToken.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: now },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          deletedAt: now,
        },
      });

      if (user.role === Role.CUSTOMER) {
        await tx.customer.update({
          where: { userId },
          data: { deletedAt: now },
        });
      }

      if (user.role === Role.WORKER) {
        await tx.worker.update({
          where: { userId },
          data: { deletedAt: now, isAvailable: false },
        });
      }

      if (user.role === Role.ORGANISATION) {
        await tx.organisation.update({
          where: { userId },
          data: { deletedAt: now },
        });
      }
    });

    return {
      success: true,
      message: 'Account deleted successfully.',
    };
  }

  private async findActiveUserById(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isActive: true, deletedAt: null },
      include: userProfileInclude,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  private async buildAuthResponse(user: UserWithProfiles) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = this.generateRawToken();
    const expiresAt = this.getRefreshTokenExpiry();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: this.toPublicUser(user),
    };
  }

  private async createRoleProfile(
    tx: Prisma.TransactionClient,
    userId: string,
    role: Role,
    data: RoleProfileInput,
  ) {
    if (role === Role.CUSTOMER) {
      await tx.customer.create({ data: { userId } });
      return;
    }

    if (role === Role.WORKER) {
      await tx.worker.create({
        data: {
          userId,
          skills: data.skills ?? [],
          bio: this.normalizeOptionalString(data.bio),
          experience: data.experience,
          serviceRadius: data.serviceRadius,
        },
      });
      return;
    }

    if (role === Role.ORGANISATION) {
      await tx.organisation.create({
        data: {
          userId,
          businessName: data.businessName ?? 'Organisation',
          businessType: data.businessType ?? 'General',
          description: this.normalizeOptionalString(data.description),
        },
      });
    }
  }

  private async issueEmailVerification(
    userId: string,
    email: string,
    name?: string | null,
  ) {
    const token = this.generateRawToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.getFutureDateInMinutes(
      Number(process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES ?? '60'),
    );

    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId, consumedAt: null },
    });

    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    // Send email verification asynchronously without blocking registration
    // This prevents registration from timing out if email service is slow or fails
    this.sendEmailVerificationAsync(email, name, token).catch((error) => {
      console.error(
        `[EMAIL_VERIFICATION_ERROR] Failed to send verification email to ${email}:`,
        error,
      );
    });
  }

  private async sendEmailVerificationAsync(
    email: string,
    name: string | null | undefined,
    token: string,
  ) {
    try {
      await this.mailService.sendEmailVerification({
        to: email,
        name: name ?? undefined,
        token,
        verificationUrl: this.buildActionUrl(process.env.VERIFY_EMAIL_URL, token),
        expiresInMinutes: Number(
          process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES ?? '60',
        ),
      });
    } catch (error) {
      console.error(
        `[EMAIL_VERIFICATION_ERROR] Failed to send verification email to ${email}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  private async issuePasswordReset(
    userId: string,
    email: string,
    name?: string | null,
  ) {
    const token = this.generateRawToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.getFutureDateInMinutes(
      Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES ?? '30'),
    );

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId, consumedAt: null },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    // Send password reset email asynchronously without blocking the request
    this.sendPasswordResetAsync(email, name, token).catch((error) => {
      console.error(
        `[PASSWORD_RESET_ERROR] Failed to send password reset email to ${email}:`,
        error,
      );
    });
  }

  private async sendPasswordResetAsync(
    email: string,
    name: string | null | undefined,
    token: string,
  ) {
    try {
      await this.mailService.sendPasswordReset({
        to: email,
        name: name ?? undefined,
        token,
        resetUrl: this.buildActionUrl(process.env.RESET_PASSWORD_URL, token),
        expiresInMinutes: Number(
          process.env.PASSWORD_RESET_EXPIRES_MINUTES ?? '30',
        ),
      });
    } catch (error) {
      console.error(
        `[PASSWORD_RESET_ERROR] Failed to send password reset email to ${email}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  private ensurePublicRole(role: Role) {
    if (role === Role.ADMIN) {
      throw new BadRequestException(
        'Admin accounts cannot be created via public registration.',
      );
    }
  }

  private ensureRoleSpecificRegistrationFields(registerDto: RegisterDto) {
    if (
      registerDto.role === Role.ORGANISATION &&
      (!registerDto.businessName || !registerDto.businessType)
    ) {
      throw new BadRequestException(
        'businessName and businessType are required for organisation registration.',
      );
    }
  }

  private resolvePublicRole(role?: string) {
    if (!role) {
      return Role.CUSTOMER;
    }

    const normalizedRole = role.toUpperCase();
    if (normalizedRole === Role.ADMIN) {
      throw new BadRequestException(
        'Admin accounts cannot be created via Google sign-in.',
      );
    }

    if (
      normalizedRole !== Role.CUSTOMER &&
      normalizedRole !== Role.WORKER &&
      normalizedRole !== Role.ORGANISATION
    ) {
      throw new BadRequestException('Invalid registration role.');
    }

    return normalizedRole as Role;
  }

  private toPublicUser(user: UserWithProfiles) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      authProvider: user.authProvider,
      emailVerified: user.emailVerified,
      profileImage: user.profileImage,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      customer: user.customer,
      worker: user.worker,
      organisation: user.organisation,
    };
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derivedKey}`;
  }

  private verifyPassword(password: string, storedHash: string) {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const derivedKey = scryptSync(password, salt, 64);
    const storedBuffer = Buffer.from(hash, 'hex');

    if (derivedKey.length !== storedBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, storedBuffer);
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private normalizeEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('Email cannot be empty.');
    }
    return normalized;
  }

  private normalizeOptionalString(value?: string | null) {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private normalizedField(value?: string | null) {
    if (value === undefined) {
      return undefined;
    }

    return this.normalizeOptionalString(value);
  }

  private normalizedRequiredField(value?: string | null) {
    if (value === undefined || value === null) {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private generateRawToken() {
    return randomBytes(48).toString('hex');
  }

  private getRefreshTokenExpiry() {
    const refreshExpiryDays = Number(
      process.env.JWT_REFRESH_EXPIRES_DAYS ?? '7',
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpiryDays);
    return expiresAt;
  }

  private getFutureDateInMinutes(minutes: number) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
    return expiresAt;
  }

  private buildActionUrl(baseUrl: string | undefined, token: string) {
    if (!baseUrl) {
      return undefined;
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
  }
}

const userProfileInclude = {
  customer: true,
  worker: true,
  organisation: true,
} satisfies Prisma.UserInclude;

type UserWithProfiles = Prisma.UserGetPayload<{
  include: typeof userProfileInclude;
}>;

type RoleProfileInput = {
  skills?: string[];
  bio?: string;
  experience?: number;
  serviceRadius?: number;
  businessName?: string;
  businessType?: string;
  description?: string;
};
