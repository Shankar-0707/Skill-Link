import { DocumentType } from '@prisma/client';

/** Minimum documents before a worker can submit KYC for review. */
export const REQUIRED_KYC_DOCUMENT_TYPES: DocumentType[] = [
  DocumentType.AADHAAR,
  DocumentType.PAN,
  DocumentType.PROFILE_PHOTO,
];

export const KYC_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const KYC_ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);
