# Shankar — MVP Phase 1 Development Log

**Module:** Customer ↔ Organisation  
**Stack:** NestJS · PostgreSQL · Prisma ORM · Docker  
**Date:** March 2026

---

## 1. What I Own

| Module | Files |
|---|---|
| `src/common/` | Shared guards, decorators, filters, interceptors, DTOs |
| `src/prisma/` | Global Prisma singleton |
| `src/escrow/` | Shared escrow service (used by me + Udit) |
| `src/organisations/` | Org profile and listing |
| `src/products/` | Full product CRUD + image management |
| `src/reservations/` | Full reservation lifecycle + cron expiry |
| `src/main.ts` | App bootstrap |
| `src/app.module.ts` | Root module |

---

## 2. Files Built

### Bootstrap
- `src/main.ts` — Helmet, compression, CORS, ValidationPipe (whitelist + transform), global exception filter, global transform interceptor, Swagger at `/api/docs`
- `src/app.module.ts` — Wires ConfigModule, ThrottlerModule (100 req/60s), ScheduleModule, PrismaModule, EscrowModule, OrganisationsModule, ProductsModule, ReservationsModule

### src/common/ — Shared by the whole team

**Decorators**
- `decorators/current-user.decorator.ts` — `@CurrentUser()` extracts `JwtPayload` from `request.user`. **Vidhit must match this shape:** `{ sub: string, email: string, role: string }`
- `decorators/roles.decorator.ts` — `@Roles(Role.CUSTOMER)` using `SetMetadata`

**Guards**
- `guards/jwt-auth.guard.ts` — Extends `AuthGuard('jwt')`. Depends on Vidhit's `JwtStrategy`
- `guards/roles.guard.ts` — Checks `request.user.role` against `@Roles()`. Always used after `JwtAuthGuard`
- `guards/mock-auth.guard.ts` — **Dev only. Delete before production.** Reads `x-mock-role` and `x-mock-user-id` headers
- `guards/smart-auth.guard.ts` — Switches between mock and real JWT via `USE_REAL_AUTH` env var

**Filters**
- `filters/http-exception.filter.ts` — All errors → `{ success: false, statusCode, message, error, path, timestamp }`

**Interceptors**
- `interceptors/transform.interceptor.ts` — All successes → `{ success: true, statusCode, data }`

**DTOs**
- `dto/pagination.dto.ts` — `PaginationDto` (page, limit, skip getter) + `paginate()` helper returning `{ items, meta }`

- `index.ts` — Barrel exporting everything so controllers do `import { ... } from '../common'`

### src/prisma/
- `prisma.service.ts` — `PrismaClient` with lifecycle hooks. Logs slow queries (>200ms) in dev
- `prisma.module.ts` — `@Global()` so `PrismaService` is injectable everywhere

### src/escrow/
> Shared with Udit. He must import `EscrowModule` in `JobsModule` — never write a second escrow service.

- `escrow.service.ts` — `createEscrow()`, `releaseEscrow()`, `refundEscrow()`, `findByReservationId()`, `findByJobId()`. All accept optional Prisma `tx` client for atomicity
- `escrow.module.ts` — Non-global. Imported explicitly by `ReservationsModule`

### src/organisations/
- `dto/organisation.dto.ts` — `ListOrganisationsDto`, `UpdateOrganisationDto`, `OrganisationResponseDto`
- `organisations.service.ts` — `findAll()` (search + businessType + pagination), `findOne()` (with products), `findMyProfile()`, `update()`, `resolveOrgId()` helper
- `organisations.controller.ts` — see endpoints below
- `organisations.module.ts` — Exports `OrganisationsService` for `ProductsModule`

### src/products/
- `dto/product.dto.ts` — `CreateProductDto`, `UpdateProductDto`, `AddProductImageDto`, `ListProductsDto`
- `products.service.ts` — `findAll()`, `findOne()`, `create()` (tx: product + images), `update()`, `remove()` (soft-delete, guards active reservations), `addImage()`, `removeImage()`, `findMyProducts()`, private `assertOwnership()`
- `products.controller.ts` — see endpoints below
- `products.module.ts` — Imports `OrganisationsModule`, exports `ProductsService`
- `products.service.spec.ts` — Unit tests (see Section 5)

### src/reservations/
- `dto/reservation.dto.ts` — `CreateReservationDto`, `CancelReservationDto`, `ListReservationsDto`, `ListIncomingReservationsDto`
- `reservations.service.ts` — Full state machine. All mutations are atomic `$transaction()` calls
- `reservations.controller.ts` — see endpoints below
- `reservations.module.ts` — Imports `EscrowModule`, registers `ReservationExpiryTask`
- `tasks/reservation-expiry.task.ts` — `@Cron` every 10 min. Expires overdue PENDING reservations, restores stock, refunds escrow
- `reservations.service.spec.ts` — Unit tests (see Section 5)

---

## 3. API Endpoints

### Organisations

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/organisations` | public | List with search, businessType, pagination |
| GET | `/organisations/:id` | public | Single org with first 20 active products |
| GET | `/organisations/me/profile` | ORGANISATION | Own profile with product count |
| PATCH | `/organisations/me/profile` | ORGANISATION | Update businessName, businessType, description |

### Products

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | public | List active products — search, organisationId, minPrice, maxPrice, sortBy, sortOrder |
| GET | `/products/:id` | public | Single product with images and org info |
| GET | `/products/me/all` | ORGANISATION | Own products including inactive |
| POST | `/products` | ORGANISATION | Create with optional images — atomic tx |
| PATCH | `/products/:id` | ORGANISATION | Update fields — ownership enforced |
| DELETE | `/products/:id` | ORGANISATION | Soft delete — fails if active reservations exist |
| POST | `/products/:id/images` | ORGANISATION | Add image URL |
| DELETE | `/products/:id/images/:imageId` | ORGANISATION | Remove image |

### Reservations

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/reservations` | CUSTOMER | Create — stock check + decrement + escrow (atomic) |
| GET | `/reservations/my` | CUSTOMER | Own reservations with status filter |
| PATCH | `/reservations/:id/pickup` | CUSTOMER | CONFIRMED → PICKED_UP, escrow RELEASED |
| GET | `/reservations/incoming` | ORGANISATION | Incoming reservations for org's products |
| PATCH | `/reservations/:id/confirm` | ORGANISATION | PENDING → CONFIRMED |
| PATCH | `/reservations/:id/cancel` | both | Cancel, restore stock, refund escrow |
| GET | `/reservations/:id` | both | Role-gated: customer sees own, org sees their product's |

---

## 4. Reservation State Machine

```
PENDING ──[org confirms]──────► CONFIRMED ──[customer picks up]──► PICKED_UP
   │                                │                               (escrow RELEASED)
   │                                │
   └──[customer or org cancels]─────┴──► CANCELLED
   │                                      (escrow REFUNDED, stock restored)
   │
   └──[cron: expiresAt < now]──────────► EXPIRED
                                          (escrow REFUNDED, stock restored)
```

- Expiry window: 24 hours from creation
- Invalid transitions throw `400 BadRequest` with descriptive message
- PICKED_UP, CANCELLED, EXPIRED are terminal — no further transitions

---

## 5. Tests Written

### products.service.spec.ts
- `findOne` → returns product when found
- `findOne` → throws 404 when not found
- `create` → creates product and images inside a transaction
- `remove` → soft-deletes when no active reservations
- `remove` → throws 400 when active reservations exist
- `remove` → throws 403 when wrong owner

### reservations.service.spec.ts
- `create` → full atomic flow (stock decrement + reservation + escrow)
- `create` → throws 409 ConflictException on insufficient stock
- `create` → throws 404 when customer profile not found
- `confirm` → PENDING to CONFIRMED success
- `confirm` → throws 403 for wrong org
- `markPickedUp` → CONFIRMED to PICKED_UP + escrow released
- `markPickedUp` → throws 400 when reservation is PENDING (not CONFIRMED)
- `cancel` → full flow: stock restored + escrow refunded
- `cancel` → throws 400 on terminal state (PICKED_UP)
- `cancel` → throws 403 for unrelated user

---

## 6. Key Design Decisions

### Atomic transactions
Every multi-table mutation is inside `$transaction()`. The three critical ones:
1. **Reservation creation** — stock check + decrement + reservation insert + escrow insert
2. **Pickup** — status update + escrow release
3. **Cancel** — status update + stock increment + escrow refund

### Ownership enforcement
`assertOwnership()` loads the resource including `organisation.userId` and compares against `request.user.sub`. Returns 403 even if the resource ID is valid.

### Soft deletes
`DELETE /products/:id` sets `isActive=false` and `deletedAt=now()`. All queries filter `{ isActive: true, deletedAt: null }`. Blocked if active reservations exist.

### Response shape
- Success: `{ success: true, statusCode, data }`
- Error: `{ success: false, statusCode, message, error, path, timestamp }`

---

## 7. Dev Testing (Postman)

While Vidhit's JWT auth is not ready, use `SmartAuthGuard` with env `USE_REAL_AUTH=false`.

**Required headers:**
```
x-mock-role     : CUSTOMER | ORGANISATION
x-mock-user-id  : <User.id from DB — NOT Organisation.id>
```

Get IDs with:
```sql
SELECT u.id, u.email, u.role FROM "User" u;
```

---

## 8. Coordination Notes

### For Vidhit (Auth)
Your `JwtStrategy.validate()` must return exactly:
```typescript
{ sub: string, email: string, role: string }
```
When auth is ready, set `USE_REAL_AUTH=true` in `.env`. No controller changes needed.

### For Udit (Jobs)
Import `EscrowModule` in your `JobsModule`. Call `EscrowService` methods with the Prisma `tx` client:
```typescript
await this.escrowService.createEscrow({ jobId, amount }, tx)
await this.escrowService.releaseEscrow(escrowId, tx)
await this.escrowService.refundEscrow(escrowId, tx)
```
Never create a second escrow service.