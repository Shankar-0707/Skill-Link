# Vidhit - MVP Phase 1 Development Log

**Module:** Authentication, Identity, and Account Lifecycle  
**Stack:** NestJS - PostgreSQL - Prisma ORM - JWT - Passport Google OAuth - Nodemailer  
**Date:** March 2026

---

## 1. What I Own

| Module                                                      | Files                                                                             |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/auth/`                                                 | Auth controller, service, DTOs, guards, decorators, strategy, mail service, tests |
| `prisma/schema.prisma`                                      | Auth enums/fields/models for local + Google auth and token flows                  |
| `prisma/migrations/20260316000000_auth_profile_foundation/` | User profile/email verification foundation updates                                |
| `prisma/migrations/20260316010000_auth_mail_google/`        | Google auth + mail token support migration                                        |
| `src/app.module.ts`                                         | Auth module integration into root application module                              |

---

## 2. Files Built

### src/auth/

**Controller**

- `auth.controller.ts` - Auth API endpoints for register, login, refresh, logout, email verification, password reset, Google OAuth, profile read/update, and account deletion.

**Service**

- `auth.service.ts` - Core auth business logic:
  - Registration with role-aware profile creation
  - Local login with password verification and email verification check
  - Access/refresh token issuance and rotation
  - Logout with refresh token revocation
  - Email verification request + confirmation flow
  - Forgot/reset password flow with token consumption and session invalidation
  - Google OAuth account linking/creation flow
  - Profile read/update with uniqueness checks and provider restrictions
  - Soft-delete account flow with related token/profile updates

**Module**

- `auth.module.ts` - Configures Passport (stateless) + JWT module, registers auth controller/service/guards/Google strategy.

**Mailing**

- `mail.service.ts` - Sends verification and password reset emails using SMTP, with `MAIL_MODE=log` support for local/dev.

**Guards/Strategy/Decorator/Types**

- `guards/jwt-auth.guard.ts` - Manual bearer token extraction + JWT validation.
- `guards/google-oauth.guard.ts` - Passport Google auth guard with role passed via OAuth `state`.
- `strategies/google.strategy.ts` - Google profile validation and normalized user payload mapping.
- `decorators/current-user.decorator.ts` - Typed extraction of `request.user` JWT payload.
- `types/jwt-payload.type.ts` and `types/google-oauth-user.type.ts` - Shared auth typing.

**DTOs**

- `dto/register.dto.ts` - Role + profile-aware registration payload validation.
- `dto/login.dto.ts` - Local login validation.
- `dto/refresh-token.dto.ts` - Refresh/logout payload validation.
- `dto/email.dto.ts`, `dto/verify-email.dto.ts` - Email verification flow payloads.
- `dto/forgot-password.dto.ts`, `dto/reset-password.dto.ts` - Password recovery payloads.
- `dto/update-profile.dto.ts` - Cross-role profile update payload validation.

**Tests**

- `auth.service.spec.ts` - Base setup/DI smoke test.
- `auth.controller.spec.ts` - Base controller wiring smoke test.

### Prisma and Migrations

**Schema updates (`prisma/schema.prisma`)**

- Added `AuthProvider` enum (`LOCAL`, `GOOGLE`).
- Extended `User` with:
  - `name` nullable
  - `passwordHash` nullable (required for local auth, null for Google-first users)
  - `authProvider` with default `LOCAL`
  - `googleId` unique nullable
  - `emailVerified` default `false`
- Added token models:
  - `RefreshToken` (hashed token storage + revocation + expiry)
  - `EmailVerificationToken` (hashed token + expiry + consumedAt)
  - `PasswordResetToken` (hashed token + expiry + consumedAt)

**Migration: `20260316000000_auth_profile_foundation`**

- Added `User.name` and `User.emailVerified`.
- Made `User.phone` nullable while keeping unique index.
- Set default role to `CUSTOMER`.

**Migration: `20260316010000_auth_mail_google`**

- Added `AuthProvider` enum and `User.authProvider`, `User.googleId`.
- Made `User.passwordHash` nullable.
- Renamed `RefreshToken.token` to `tokenHash`.
- Created `EmailVerificationToken` and `PasswordResetToken` tables + indexes + FKs.

---

## 3. API Endpoints

| Method | Path                         | Auth         | Description                                                          |
| ------ | ---------------------------- | ------------ | -------------------------------------------------------------------- |
| POST   | `/auth/register`             | public       | Register local account and role profile, then send verification mail |
| POST   | `/auth/login`                | public       | Local login (email + password) and token issue                       |
| POST   | `/auth/refresh`              | public       | Rotate refresh token and return new access/refresh pair              |
| POST   | `/auth/logout`               | public       | Revoke refresh token                                                 |
| POST   | `/auth/verify-email/request` | public       | Send/re-send verification email                                      |
| POST   | `/auth/verify-email/confirm` | public       | Verify email via token                                               |
| POST   | `/auth/forgot-password`      | public       | Request reset token mail                                             |
| POST   | `/auth/reset-password`       | public       | Reset password via token and revoke existing sessions                |
| GET    | `/auth/google`               | public       | Start Google OAuth flow                                              |
| GET    | `/auth/google/callback`      | Google guard | Complete Google OAuth and return auth response                       |
| GET    | `/auth/profile`              | JWT          | Return authenticated user profile                                    |
| PATCH  | `/auth/profile`              | JWT          | Update profile and role-specific fields                              |
| DELETE | `/auth/profile`              | JWT          | Soft-delete account and revoke active credentials                    |

---

## 4. Auth and Token Flows

### Local registration and login

1. Register validates role input and role-specific fields.
2. Password is hashed using `scrypt` with per-user random salt.
3. User + role profile (`Customer`, `Worker`, or `Organisation`) are created inside a DB transaction.
4. Verification token is generated, hashed with SHA-256, stored, and emailed.
5. Login validates credentials and blocks non-admin users until `emailVerified=true`.
6. On successful login, access token + refresh token are issued.

### Refresh token rotation

1. Refresh token is looked up by SHA-256 hash.
2. Token must exist, not be revoked, and not be expired.
3. Existing refresh token is revoked.
4. New access token and refresh token are generated and returned.

### Email verification

1. Request endpoint is privacy-safe for unknown/inactive accounts.
2. Old unused verification tokens are deleted before issuing a new one.
3. Confirm endpoint validates token hash, expiry, and consumption state.
4. Transaction sets `emailVerified=true` and marks token `consumedAt`.

### Password reset

1. Forgot-password endpoint is privacy-safe and ignores unsupported/inactive accounts.
2. Old unused password reset tokens are deleted before issuing a new one.
3. Reset endpoint validates token and updates password hash.
4. All active refresh tokens are revoked after password reset.

### Google OAuth

1. Guard initiates OAuth with `email` and `profile` scope.
2. Optional `role` is passed through OAuth `state` and validated on callback.
3. Existing Google-linked user logs in directly.
4. Existing local user with same email gets linked with Google ID.
5. New Google user is created with `authProvider=GOOGLE`, `emailVerified=true`, and role profile bootstrap.

---

## 5. Account/Profile Management Rules

- `GET /auth/profile` returns a role-aware public user payload.
- `PATCH /auth/profile` supports shared + role-specific fields:
  - Shared: `email`, `name`, `phone`, `profileImage`
  - Worker: `skills`, `bio`, `experience`, `serviceRadius`, `isAvailable`
  - Organisation: `businessName`, `businessType`, `description`
- Email/phone uniqueness is enforced excluding the current user.
- Google-authenticated users cannot change email through profile update.
- If email changes, `emailVerified` is reset and re-verification is issued.
- `DELETE /auth/profile` performs soft delete and cleanup:
  - Revokes active refresh tokens
  - Consumes outstanding verification/reset tokens
  - Marks user inactive and sets `deletedAt`
  - Sets role profile `deletedAt` (and worker availability false)

---

## 6. Security and Design Decisions

### Token and credential safety

- Passwords are never stored raw; hash format is `salt:derivedKey` from `scrypt`.
- All verification/reset/refresh tokens are stored as SHA-256 hashes, never raw.
- Password comparison uses `timingSafeEqual`.

### Defensive responses

- Login and token endpoints return clear unauthorized errors for invalid credentials/tokens.
- Forgot-password and verification request endpoints avoid account enumeration by returning safe generic success messages where appropriate.

### Session lifecycle control

- Refresh token rotation enforces one-time usage per token.
- Password reset revokes all active refresh sessions.
- Account deletion revokes active sessions and consumes pending tokens.

### Transactional integrity

- Registration, profile updates, token consumptions, and deletion flows use Prisma transactions for consistency across user/profile/token tables.

---

## 7. Runtime Configuration

Auth module and service use the following environment variables:

- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN` (default `15m`)
- `JWT_REFRESH_EXPIRES_DAYS` (default `7`)
- `EMAIL_VERIFICATION_EXPIRES_MINUTES` (default `60`)
- `PASSWORD_RESET_EXPIRES_MINUTES` (default `30`)
- `VERIFY_EMAIL_URL` (optional frontend verification URL)
- `RESET_PASSWORD_URL` (optional frontend reset URL)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `MAIL_MODE` (`smtp` or `log`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `MAIL_FROM`

---

## 8. Current Test Coverage Status

- `auth.service.spec.ts` and `auth.controller.spec.ts` currently provide baseline wiring checks.
- Detailed behavioral tests for auth flows (register/login/refresh/verify/reset/google/profile/delete) are not yet implemented and should be expanded next.
