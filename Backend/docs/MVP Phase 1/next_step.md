# Senior Strategy Guide: Skill-Link Frontend (Phase 1)

As your senior technical advisor, I have reviewed the current state of the repository (`Backend` and `Frontend`). Your MVP core is solid. Below is the strategic recommendation on how to proceed.

---

## 1. The Strategic Verdict: Frontend First

**Recommendation:** Implement the **Frontend MVP** before moving to "Phase 2" of the Backend.

### Why not Backend Phase 2?
- **Feature Sufficiency:** Your backend already covers Auth (Vidhit), Jobs/Payments (Udit), and Organisations/Products/Reservations (Shankar). This is a complete "Happy Path" for a marketplace.
- **Risk of Over-Engineering:** Building "Phase 2" features (like complex bidding or analytics) before the "Phase 1" UI is tested by users often leads to wasted effort. 
- **The "Stress Test" Factor:** Frontend implementation is the ultimate validator for backend API contracts. It will reveal if the data shapes, status codes, and security guards actually work in a real-world user flow.

---

## 2. Updated Stack: The "WOW" Factory (Tailwind + Shadcn + Aceternity)

For a high-impact MVP where speed and visual excellence are key, your choice of **Tailwind CSS** combined with **Shadcn/UI** and **Aceternity UI** is top-tier.

### A. Tailwind CSS: The Solid Foundation
- **Role**: Atomic styling.
- **Tip**: Stick to the "Container-Query" or "Responsive" utilities early. It avoids the "Mobile-afterthought" common in MVPs.

### B. Shadcn/UI: Reliable Components
- **Role**: Logic for Buttons, Forms, and Data Tables.
- **Strategy**: Only `npx shadcn@latest add` what you need (e.g., `button`, `card`, `dialog`). This keeps your `components/ui` folder clean.

### C. Aceternity UI: The Visual Edge
- **Role**: Hero sections, complex background effects, and 3D-like animations.
- **Caution**: Use these sparingly! They are high-impact but use **Framer Motion** heavily. Use them for the "Hero" and "Success" states to wow the user.

---

## 3. The "Smoothness" Secret: Logic Still Matters

While Shadcn/Aceternity makes it look good, it only *feels* smooth if the data is fast.
- **TanStack Query (React Query)** is still mandatory here. It powers the "Optimistic Updates" (e.g., liking a product happens instantly, syncing with Vidhit's backend occurs in the background).

---

## 4. Team Work Distribution

To maximize efficiency, I recommend mirroring your backend ownership. 

### 👤 Member 1 (Shankar: The "Core & Marketplace" Lead)
**Focus**: The foundation and the marketplace discovery.
- **Tasks**:
  - **The Frame**: Setup Tailwind, Shadcn/UI, and the main Layout (Sidebar/Navbar).
  - **API Engine**: Configure TanStack Query and Global Axios Interceptors.
  - **Discovery**: Product browsing, Search/Filters, and the Reservation flow.

### 👤 Member 2 (Vidhit: The "Identity & Access" Lead)
**Focus**: User lifecycle and onboarding.
- **Tasks**:
  - **Auth Flows**: Login, Registration, OTP, and Password Reset pages.
  - **OAuth**: Google Login integration (Frontend side).
  - **Profiles**: The User/Worker/Org profile editors.

### 👤 Member 3 (Udit: The "Service Lifecycle" Lead)
**Focus**: The Job economy and execution.
- **Tasks**:
  - **Job Posting**: The multi-step form for customers to post jobs.
  - **Worker Discovery**: The job board for workers to find available jobs.
  - **The Lifecycle**: The job tracking page (ASSIGNED -> IN_PROGRESS -> COMPLETED).

---

## 5. Coordination & Mocking

Since you'll be working in the same Vite repo:
1.  **Shared UI first**: Shankar should push the `components/ui` (Shadcn) and `styles/globals.css` first.
2.  **Mocking API**: Since Auth might be needed by everyone, use the `MockAuthGuard` in the backend while the frontend Auth flow is being polished. 
    - **Header**: Send `x-mock-user-id` and `x-mock-role` (e.g., `CUSTOMER`, `WORKER`) in your headers during development. This avoids being blocked by the full Login flow.
3.  **Components Folder**: Group components by feature (e.g., `components/auth/`, `components/jobs/`) so you don't step on each other's code.

---

### Final Note
Building the frontend now will give the team immediate visual progress and highlight exactly where the backend needs "Phase 2" tweaks.
