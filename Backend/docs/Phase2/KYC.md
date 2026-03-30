# KYC implementation (Phase 2)

This document describes the Know Your Customer (KYC) flow implemented for **workers** on SkillLink: data model, API surface, Cloudinary usage, state rules, and admin review.

## Principles

- KYC runs **after** signup/login; it is not part of authentication.
- **Worker** submits identity documents; **admin** approves or rejects.
- Stored URLs point to **Cloudinary** (HTTPS `secure_url`); metadata lives in PostgreSQL via Prisma.
- **At most one** `PENDING` KYC request per worker (enforced in the database with a partial unique index).

## Data model (Prisma)

- **`Worker.kycStatus`**: umbrella state for the worker — `NOT_STARTED` | `PENDING` | `VERIFIED` | `REJECTED`.
- **`KycRequest`**: one row per submission cycle.
  - `status`: `KycRequestStatus` — `PENDING` | `VERIFIED` | `REJECTED` (not the same enum as worker’s `NOT_STARTED`).
  - `submittedAt`, `verifiedAt`, `rejectionReason`, `reviewedBy`, `reviewedAt`.
  - `provider`: default `"INTERNAL"`.
- **`WorkerDocument`**: each file row has `documentType`, `documentUrl`, `document` status, optional `kycRequestId`.
  - **`kycRequestId = null`**: draft for the **next** submit (not yet tied to a request).
  - After submit, drafts included in that submission are linked to the new `KycRequest`.

## Cloudinary

- Worker documents are uploaded with `POST /api/v1/kyc/upload-document` (multipart `file` + `documentType`).
- Backend uploads the buffer to Cloudinary under `CLOUDINARY_KYC_FOLDER` (default `skill-link/kyc`) and saves **`secure_url`** to `WorkerDocument.documentUrl`.
- Env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_KYC_FOLDER`.

## Required documents before submit

Minimum required types (configurable in code: `Backend/src/kyc/kyc.constants.ts`):

- `AADHAAR`
- `PAN`
- `PROFILE_PHOTO`

Additional types (e.g. `DRIVING_LICENSE`, `PASSPORT`, `SKILL_CERTIFICATE`) may be uploaded and are **linked** to the request on submit together with the required set.

## Worker API (base path: `/api/v1`)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/kyc/upload-document` | `WORKER` | Multipart: `file`, `documentType`. Uploads to Cloudinary; creates or updates a **draft** for that type. |
| `POST` | `/kyc/submit` | `WORKER` | Validates required drafts, creates `KycRequest` (`PENDING`), links documents, sets `Worker.kycStatus = PENDING`. |
| `GET` | `/kyc/status` | `WORKER` | Returns `kycStatus`, pending/last request summary, draft list, `canSubmit` flag. |

### Upload rules

- Blocked while worker is **`PENDING`** (under review) or **`VERIFIED`** (unless support resets policy in DB/admin tooling).
- Allowed from **`NOT_STARTED`** or **`REJECTED`** (resubmission after rejection).
- File size and MIME checks apply (see `kyc.constants.ts`).

### Submit rules

- Fails if a **`PENDING`** request already exists (`409` / `KYC_ALREADY_PENDING`).
- Fails if required document types are missing (`400` / `KYC_INCOMPLETE_DOCUMENTS`, optional `missingDocumentTypes` in error payload).

## Admin API

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `GET` | `/admin/kyc-requests` | `ADMIN` | Paginated list. Defaults to **pending** queue; use `all=true` to broaden; optional `status`. |
| `POST` | `/admin/kyc/:id/approve` | `ADMIN` | Sets request + documents to verified; `Worker.kycStatus = VERIFIED`. Idempotent if already verified. |
| `POST` | `/admin/kyc/:id/reject` | `ADMIN` | Body: `rejectionReason`. Sets request + documents to rejected; `Worker.kycStatus = REJECTED`. |

## State transitions

- `NOT_STARTED` → upload drafts → `submit` → `PENDING` (worker + request).
- `PENDING` → admin **approve** → `VERIFIED` (final for normal operation).
- `PENDING` → admin **reject** → `REJECTED`; worker may upload **new** drafts and submit a **new** `KycRequest` (old rows stay linked to old requests).

## Platform gates

- **Job assignment** (`assignWorker`): customer can only assign workers with `Worker.kycStatus === VERIFIED` (via `KycGateService`).
- **Future withdrawals**: `PaymentsService.assertWithdrawAllowed` delegates to `KycGateService.assertUserWorkerKycVerified` when payout endpoints are added.
- **`KycVerifiedGuard`**: reusable guard for routes that require verified KYC.

## Error shape

HTTP errors use the global filter; object-style exceptions may include:

- `code` — stable machine-readable code (e.g. `KYC_NOT_VERIFIED`, `KYC_ALREADY_PENDING`).
- `missingDocumentTypes` — for incomplete submit validation.

## Related code (backend)

- `Backend/src/kyc/` — worker KYC controllers, services, DTOs, guards.
- `Backend/src/admin/` — admin KYC controller and service.
- `Backend/src/storage/cloudinary.service.ts` — shared Cloudinary client (`uploadKycDocument`, `uploadProductImage`).
- `Backend/prisma/schema.prisma` — `WorkerDocument`, `KycRequest`, enums.

## Product images (same storage pattern)

Product catalogue images still store **`imageUrl`** in `ProductImage`. Organisations can:

- **`POST /api/v1/products/:id/images`** — pass any HTTPS `imageUrl` (manual / external).
- **`POST /api/v1/products/:id/images/upload`** — upload a file to Cloudinary under `CLOUDINARY_PRODUCTS_FOLDER` and persist the returned URL.

This keeps a single URL column while supporting Cloudinary-backed assets for both KYC and products.
