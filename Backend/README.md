# SkillLink Backend

NestJS + PostgreSQL + Prisma backend. MVP scope.

---

## Team ownership

| Module | Owner | Status |
|---|---|---|
| `auth/` | Vidhit | In progress |
| `jobs/`, `workers/`, `kyc/` | Udit | In progress |
| `organisations/`, `products/`, `reservations/` | You | ✅ Done |
| `escrow/`, `common/`, `prisma/` | Shared | ✅ Done |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Generate Prisma client
npm run db:generate

# 4. Run migrations
npm run db:migrate

# 5. Seed the database
npm run db:seed

# 6. Start dev server
npm run start:dev
```

Swagger UI: http://localhost:3000/api/docs

---

## Project structure

```
src/
├── common/                  # Shared across ALL modules — do not modify without discussing
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # @CurrentUser() → JwtPayload
│   │   └── roles.decorator.ts          # @Roles(Role.CUSTOMER)
│   ├── guards/
│   │   ├── jwt-auth.guard.ts           # Validates JWT (depends on Vidhit's JwtStrategy)
│   │   └── roles.guard.ts              # Checks role after JWT
│   ├── filters/
│   │   └── http-exception.filter.ts    # Unified error shape
│   ├── interceptors/
│   │   └── transform.interceptor.ts    # Wraps all responses in { success, statusCode, data }
│   └── dto/
│       └── pagination.dto.ts           # PaginationDto + paginate() helper
│
├── prisma/                  # Global Prisma singleton — import PrismaModule in AppModule only
├── escrow/                  # SHARED: both reservations and jobs use EscrowService
├── organisations/           # GET /organisations, PATCH /organisations/me/profile
├── products/                # Full CRUD + image management
├── reservations/            # Full lifecycle + cron expiry
│
├── app.module.ts
└── main.ts
```

---

## API contract

All responses are wrapped:

```json
// Success
{ "success": true, "statusCode": 200, "data": { ... } }

// Error
{ "success": false, "statusCode": 404, "message": "Product not found", "error": "NotFoundException", "path": "/api/v1/products/xyz", "timestamp": "..." }
```

---

## For Vidhit (Auth module)

Your JwtStrategy **must** populate `request.user` with this exact shape:

```typescript
// src/common/decorators/current-user.decorator.ts
export interface JwtPayload {
  sub: string    // userId (User.id from DB)
  email: string
  role: string   // Role enum value
  iat?: number
  exp?: number
}
```

The `JwtAuthGuard` in `common/guards/` extends `AuthGuard('jwt')` — it will work automatically once your `JwtStrategy` is named `'jwt'` and registered via `PassportModule`.

Export `JwtAuthGuard`, `RolesGuard`, and `PassportModule` from your `AuthModule` so other modules can use them. Or just let everyone use the guards from `common/` directly (preferred — they already live there).

---

## For Udit (Jobs module)

**Escrow** — do NOT create a second EscrowService. Import `EscrowModule` in your `JobsModule`:

```typescript
// jobs/jobs.module.ts
@Module({
  imports: [EscrowModule],
  ...
})
```

Then inject `EscrowService` and call:
- `escrowService.createEscrow({ jobId, amount }, tx)` — when a job gets assigned
- `escrowService.releaseEscrow(escrowId, tx)` — when job is COMPLETED
- `escrowService.refundEscrow(escrowId, tx)` — when job is CANCELLED

Always pass the Prisma transaction client `tx` so the escrow write is atomic with your status update.

---

## Reservation state machine

```
PENDING ──[org confirms]──► CONFIRMED ──[customer picks up]──► PICKED_UP
   │                            │                                (escrow RELEASED)
   │                            │
   └──[customer/org cancels]────┴──► CANCELLED
   │                                  (escrow REFUNDED, stock restored)
   │
   └──[cron: expiresAt < now]──► EXPIRED
                                  (escrow REFUNDED, stock restored)
```

The state machine is enforced in `ReservationsService.assertTransition()`.
Any attempt to make an invalid jump throws `400 BadRequest`.

---

## Running tests

```bash
# Unit tests
npm test

# With coverage
npm run test:cov
```

---

## Docker

```yaml
# docker-compose.yml (add to root)
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: skilllink
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d   # start postgres
npm run db:migrate     # apply schema
npm run db:seed        # seed dummy data
```