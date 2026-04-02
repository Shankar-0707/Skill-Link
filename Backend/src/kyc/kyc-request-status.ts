/**
 * Runtime values for KycRequest.status (mirrors Prisma `KycRequestStatus` enum).
 * Defined locally so services compile even if the IDE lags behind `prisma generate`.
 */
export const KycRequestStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

export type KycRequestStatusValue =
  (typeof KycRequestStatus)[keyof typeof KycRequestStatus];
