# Backend Roadmap: Phase 2 (The "Scalability & Trust" Phase)

Following the MVP Phase 1 (Core Marketplace), Phase 2 focuses on building the infrastructure for trust (KYC), management (Admin), and competition (Bidding).

---

## 1. Trust & Safety: KYC Verification Flow
Your Prisma schema already has the models (`KycRequest`, `WorkerDocument`), but the service logic is missing.
- **Worker Side**: 
    - `POST /worker/kyc/upload`: Endpoint to upload Identity/Skill documents.
    - `POST /worker/kyc/submit`: Locks the documents and creates a `KycRequest` with status `PENDING`.
- **Validation**: Prevent workers from accepting jobs unless their `kycStatus` is `VERIFIED`.

## 2. The Admin Module (Control Tower)
This is a new module dedicated to the `ADMIN` role. 
- **Moderation**: APIs to list users, search by role, and block/unblock accounts.
- **KYC Approval**: `GET /admin/kyc/pending` to see worker docs and `PATCH /admin/kyc/:id/verify` to approve or reject them.
- **Financial Oversight**: A dashboard to monitor all active Escrows and manually intervene in disputes if needed.

## 3. Udit’s Phase 2: The Bidding System
Moving from "Direct Assignment" to a proper "Marketplace" feel.
- **The Bidding Cycle**:
    1.  Worker finds a job -> `POST /jobs/:id/bids`.
    2.  Customer views bids -> `GET /jobs/:id/bids`.
    3.  Customer accepts a bid -> `PATCH /jobs/:id/accept-bid/:bidId`. This triggers the Escrow flow.

## 4. Real-time Notifications
The app only feels "live" if users get notified immediately.
- **Implementation**: Integrate `Socket.io` or `FCM`.
- **Triggers**: New Job posted in category, Bid received, or Escrow released.

## 5. Reputation System (Ratings)
- **Review Logic**: `POST /jobs/:id/review`. Validate that only the assigned customer can rate the worker AFTER the job is `COMPLETED`.
- **Atomic Updates**: Automatically recalculating the `ratingAvg` on the `Worker` profile after every successful job.

---

## 6. Proposed Work Distribution & Justification

To ensure maximum development speed, roles are assigned based on existing domain expertise.

### 👤 Member 1 (Shankar: The "System Architect")
**Phase 2 Work**: **Admin Module & KYC Verification flow.**
- **Why?**: Shankar built the internal core (`Common`, `Prisma`, `Organisation`). He understands the overall data architecture and how different roles interact. Admin and KYC are "Horizontal" features that sit across the entire app. Since he already connects Orgs to Users, he is the best person to build the "Moderation" layer that oversees them all.

### 👤 Member 2 (Vidhit: The "Identity & Identity" expert)
**Phase 2 Work**: **Notifications Engine & Reputation/Ratings.**
- **Why?**: Vidhit already owns `Auth` and `MailService`. This makes him the natural owner of all "Communications." Moving from Email to Push/Sockets is a technological evolution of the same job. Since Ratings are tied to the `User` profile (which he built), he can implement them with zero learning curve.

### 👤 Member 3 (Udit: The "Business Logic" lead)
**Phase 2 Work**: **The Bidding System & Advanced Job Lifecycle.**
- **Why?**: Udit built the `Jobs` module and understands the complex "Post -> Assign -> Complete -> Release" state machine. Bidding is an extension of the `Job` model. It would be inefficient for someone else to learn the intricate rules of Job Statuses that Udit already perfected in Phase 1.
