import React from "react";
import {
  ArrowLeft,
  BadgeIndianRupee,
  CheckCircle2,
  Clock3,
  FileQuestion,
  HandCoins,
  HelpCircle,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LandingNavbar } from "../landing/sections/LandingNavbar";

const refundHighlights = [
  "Refunds are generally processed to your Skill-Link virtual wallet.",
  "A 5% platform service fee applies to transactions and is usually non-refundable.",
  "Eligibility depends on job or reservation status, cancellation timing, and dispute evidence.",
  "Disputes should be raised quickly through a help ticket with clear supporting details.",
];

const jobRules = [
  {
    status: "POSTED",
    detail: "No payment has been made yet, so no refund is necessary.",
  },
  {
    status: "ASSIGNED",
    detail:
      "Full refund may apply within 24 hours before work begins. Later cancellations may receive 90% or 75% depending on timing and circumstances.",
  },
  {
    status: "IN_PROGRESS",
    detail:
      "Refunds are reviewed case-by-case. Customers should submit a help ticket with photos, messages, or other evidence of the issue.",
  },
  {
    status: "COMPLETED",
    detail:
      "Refunds are generally unavailable once a job is completed. Quality disputes must be raised within 48 hours for review.",
  },
];

const reservationRules = [
  {
    status: "PENDING",
    detail:
      "A customer cancellation before organisation confirmation may receive a full wallet refund, with stock restored automatically.",
  },
  {
    status: "CONFIRMED",
    detail:
      "Refund eligibility depends on cancellation timing, pickup readiness, and whether the organisation has already prepared the item.",
  },
  {
    status: "PICKED_UP",
    detail:
      "Once a product is picked up using the OTP flow, payment is released and refunds are limited to verified quality or fulfilment issues.",
  },
  {
    status: "EXPIRED",
    detail:
      "If a reservation expires because it was not confirmed within the required timeframe, eligible funds are returned to the customer wallet.",
  },
];

const processSteps = [
  {
    title: "Open a help ticket",
    description:
      "Describe what happened, include the job or reservation reference, and explain the refund request clearly.",
    icon: HelpCircle,
  },
  {
    title: "Attach evidence",
    description:
      "Photos, messages, service notes, pickup information, or payment records help admins review the issue fairly.",
    icon: FileQuestion,
  },
  {
    title: "Admin review",
    description:
      "Skill-Link reviews timing, status, user history, evidence, and platform records before making a decision.",
    icon: ShieldCheck,
  },
  {
    title: "Wallet refund",
    description:
      "Approved refunds are credited to the Skill-Link wallet unless another method is required by the platform.",
    icon: HandCoins,
  },
];

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fafbfc] font-body text-slate-950 selection:bg-slate-900 selection:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-blue-100/35 blur-[120px]" />
        <div className="absolute right-[-14rem] top-[30rem] h-[34rem] w-[34rem] rounded-full bg-slate-200/75 blur-[120px]" />
      </div>

      <LandingNavbar />

      <main className="mx-auto w-full max-w-340 px-6 pb-20 pt-32 sm:px-10 lg:px-16 lg:pt-36">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to landing
        </Link>

        <section className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                Legal / Refund Policy
              </p>
              <h1 className="mt-5 font-headline text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
                Clear refund rules for jobs, reservations, and escrow.
              </h1>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">
                Last Updated: May 2, 2026
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                This Refund Policy explains when refunds are issued on
                Skill-Link. The platform uses escrow to protect customers,
                workers, and organisations while services and reservations are
                being completed.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950">
              <BadgeIndianRupee className="h-7 w-7" />
            </div>
            <h2 className="mt-6 font-headline text-3xl font-extrabold tracking-[-0.03em]">
              Escrow keeps payment decisions traceable.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Funds can move through HELD, RELEASED, or REFUNDED states. This
              gives Skill-Link a clearer way to handle cancellations, disputes,
              and completed transactions.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {refundHighlights.map((highlight) => (
              <div
                key={highlight}
                className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm leading-6 text-slate-650">
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-8 border-t border-slate-200/80 pt-16 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-6 w-6 text-slate-700" />
              <h2 className="font-headline text-3xl font-extrabold tracking-[-0.03em] text-slate-950">
                Job refund policy
              </h2>
            </div>
            <div className="mt-6 grid gap-3">
              {jobRules.map((rule) => (
                <article
                  key={rule.status}
                  className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)]"
                >
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    {rule.status}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {rule.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <PackageCheck className="h-6 w-6 text-slate-700" />
              <h2 className="font-headline text-3xl font-extrabold tracking-[-0.03em] text-slate-950">
                Product reservation refunds
              </h2>
            </div>
            <div className="mt-6 grid gap-3">
              {reservationRules.map((rule) => (
                <article
                  key={rule.status}
                  className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)]"
                >
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    {rule.status}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {rule.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-slate-200/80 pt-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
              Dispute process
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950">
              Refund decisions depend on timing, status, and evidence.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-[-0.02em] text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Clock3 className="h-7 w-7" />
            </div>
            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              Worker-initiated cancellations may result in a 100% customer
              refund and can affect worker account standing if repeated. Admin
              dispute decisions are usually made within 7 business days after a
              complete help ticket is submitted. Skill-Link may update this
              policy as payment, reservation, and support systems evolve.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
