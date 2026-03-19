# SkillLink - MVP Phase 1 Development Log

**Module:** Jobs, Worker Assignment, and Job Lifecycle  
**Stack:** NestJS · PostgreSQL · Prisma ORM · JWT  
**Date:** March 2026

---

## 1. What I Own

| Module               | Files                                                          |
| -------------------- | -------------------------------------------------------------- |
| `src/jobs/`          | Jobs controller, service, module, DTOs                         |
| `prisma/schema.prisma` | `Job`, `Escrow`, `Payment` models used across the job lifecycle |

---

## 2. Files Built

### src/jobs/

**Controller**

- `jobs.controller.ts` — Job API endpoints for posting, discovery, worker assignment, and full job lifecycle management (start, complete, confirm).

**Service**

- `jobs.service.ts` — Core jobs business logic:
  - Role-aware profile resolution (`User` → `Customer` / `Worker`) from JWT user ID
  - Job creation and ownership-gated updates
  - Soft-delete based job cancellation
  - Available job listing and category-based filtering for workers
  - Direct worker assignment with KYC and availability validation
  - Job lifecycle transitions: ASSIGNED → IN_PROGRESS → COMPLETED
  - Customer confirmation flow with escrow release and payment record creation
  - Worker availability toggling on assignment and job completion

**Module**

- `jobs.module.ts` — Imports `PrismaModule`, registers `JobsController` and `JobsService`, exports `JobsService` for use by `EscrowModule` and `PaymentsModule`.

**DTOs**

- `dto/create-job.dto.ts` — Validated job creation payload: `title`, `description`, `category`, `budget`, `scheduledAt`.
- `dto/update-job.dto.ts` — Partial update payload for POSTED-stage jobs; all fields optional.

---

## 3. API Endpoints

| Method | Path                              | Role       | Description                                                               |
| ------ | --------------------------------- | ---------- | ------------------------------------------------------------------------- |
| POST   | `/jobs`                           | CUSTOMER   | Create a new job posting. Status defaults to `POSTED`                     |
| GET    | `/jobs/my`                        | CUSTOMER   | Get all jobs posted by the authenticated customer                         |
| GET    | `/jobs/:id`                       | CUSTOMER, WORKER | Get full details of a job. Access restricted to owner and assigned worker |
| PATCH  | `/jobs/:id`                       | CUSTOMER   | Edit a job — only allowed while status is `POSTED`                        |
| DELETE | `/jobs/:id`                       | CUSTOMER   | Cancel a job (soft delete) — only allowed while status is `POSTED`        |
| GET    | `/jobs/available`                 | WORKER     | Browse all open (`POSTED`) jobs                                           |
| GET    | `/jobs/available/category/:category` | WORKER  | Filter open jobs by skill category                                        |
| GET    | `/jobs/my-assignments`            | WORKER     | View all jobs assigned to the authenticated worker                        |
| PATCH  | `/jobs/:id/assign/:workerId`      | CUSTOMER   | Assign a worker to a job. Triggers escrow creation                        |
| PATCH  | `/jobs/:id/start`                 | WORKER     | Mark assigned job as started                                              |
| PATCH  | `/jobs/:id/complete`              | WORKER     | Mark job as complete — awaits customer confirmation                       |
| PATCH  | `/jobs/:id/confirm`               | CUSTOMER   | Confirm completion. Releases escrow and creates payment record            |

---

## 4. Job and Payment Flows

### Job Posting (Customer)

1. Customer calls `POST /jobs` with title, description, category, and optional budget and scheduled time.
2. Service resolves the authenticated `User` to their `Customer` profile via `userId`.
3. Job is created with status `POSTED` and linked to the customer.

### Worker Discovery

1. Workers call `GET /jobs/available` to browse all `POSTED` jobs.
2. Optional category filter available via `GET /jobs/available/category/:category`.
3. Job listing returns only public-safe fields — customer phone and internal IDs are not exposed.

### Worker Assignment

1. Customer calls `PATCH /jobs/:id/assign/:workerId` to directly assign a worker.
2. Service validates:
   - Job exists and belongs to the requesting customer.
   - Job is still in `POSTED` status.
   - Target worker exists, `isAvailable = true`, and `kycStatus = VERIFIED`.
3. Inside a Prisma transaction:
   - Job `workerId` is set and status moves to `ASSIGNED`.
   - Worker `isAvailable` is set to `false`.
   - If job has a `budget`, an `Escrow` record is created with status `HELD`.

### Job Lifecycle

1. Worker calls `PATCH /jobs/:id/start` → status moves `ASSIGNED → IN_PROGRESS`.
2. Worker calls `PATCH /jobs/:id/complete` → status moves `IN_PROGRESS → COMPLETED`. Escrow stays `HELD`.
3. Customer calls `PATCH /jobs/:id/confirm` to acknowledge the work.

### Escrow Release and Payment

1. On customer confirmation, inside a Prisma transaction:
   - Escrow status is updated `HELD → RELEASED` with `releasedAt` timestamp.
   - A `Payment` record is created: type `JOB_PAYOUT`, status `SUCCESS`, with an idempotency key `job_payout_{jobId}`.
   - Worker `isAvailable` is reset to `true`.
2. No payment is created if the job had no budget set.

---

## 5. Access and Validation Rules

### Ownership and Access

- Customers can only view, edit, cancel, assign, or confirm jobs they own.
- Workers can only start or complete jobs assigned to them (`job.workerId === worker.id`).
- `GET /jobs/:id` is accessible to both the job owner and the assigned worker. All other parties receive a `403`.

### Status Gate Rules

| Action              | Required Status   | Role     |
| ------------------- | ----------------- | -------- |
| Edit job            | `POSTED`          | CUSTOMER |
| Cancel job          | `POSTED`          | CUSTOMER |
| Assign worker       | `POSTED`          | CUSTOMER |
| Start job           | `ASSIGNED`        | WORKER   |
| Complete job        | `IN_PROGRESS`     | WORKER   |
| Confirm completion  | `COMPLETED`       | CUSTOMER |

### Worker Assignment Guards

- Worker must have `kycStatus = VERIFIED` — unverified workers cannot be assigned.
- Worker must have `isAvailable = true` — busy workers cannot be double-assigned.

### Profile Resolution

- JWT payload carries `User.id`. All service methods resolve this to `Customer.id` or `Worker.id` before any job query.
- If no matching profile exists for the role, a `403 ForbiddenException` is thrown immediately.

---

## 6. Design Decisions

### No Bidding in MVP

Bidding (`Bid` model, real-time bid submission, bid acceptance) is out of scope for this phase. The current schema does not include a `Bid` model. Worker assignment is direct — the customer selects a worker and assigns them. Bidding infrastructure is a planned Phase 2 addition.

### Escrow is Budget-Gated

Escrow is only created if the job has a `budget` value set. Jobs without a budget skip escrow creation silently. This avoids blocking MVP flows for jobs where pricing is agreed outside the platform.

### Transactional Integrity

Worker assignment and job confirmation both run inside `prisma.$transaction` to ensure atomicity across `Job`, `Worker`, `Escrow`, and `Payment` updates. Partial state (e.g. job assigned but escrow missing) cannot occur.

### Idempotency on Payments

Payment records use the key `job_payout_{jobId}` to prevent duplicate payout records if the confirm endpoint is called more than once in an error scenario.

### Worker Availability Lifecycle

Worker `isAvailable` is set to `false` on assignment and restored to `true` on job confirmation. This is a simple MVP-level concurrency control to prevent a worker being assigned to two jobs simultaneously.

---

## 7. Current Test Coverage Status

- `jobs.service.spec.ts` and `jobs.controller.spec.ts` are not yet created.
- Behavioral tests for all lifecycle transitions, ownership guards, and status validations should be implemented next.