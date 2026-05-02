import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  GraduationCap,
  Hammer,
  LineChart,
  Store,
  UsersRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const joinPaths = [
  {
    audience: "Workers",
    title: "Turn your skill into a stronger professional profile.",
    description:
      "Create a verified presence, show your trade, receive relevant work opportunities, and build reputation through completed jobs.",
    icon: Hammer,
    points: ["Verified profile", "Job discovery", "Ratings and trust growth"],
  },
  {
    audience: "Customers",
    title: "Find dependable help without starting from uncertainty.",
    description:
      "Post service needs, compare credible profiles, reserve services, and get support when you need clarity.",
    icon: UsersRound,
    points: ["Cleaner hiring", "Reservation flow", "Support access"],
  },
  {
    audience: "Organisations",
    title: "Bring your services, products, and operations into one system.",
    description:
      "Manage listings, reservations, customer requests, and service delivery with a more professional marketplace presence.",
    icon: Building2,
    points: ["Product presence", "Reservation management", "Customer trust"],
  },
];

const growthSignals = [
  {
    title: "Earn through better visibility",
    description:
      "Workers and organisations can grow by being easier to discover, compare, and trust.",
    icon: CircleDollarSign,
  },
  {
    title: "Improve with every interaction",
    description:
      "Completed work, ratings, and cleaner communication help strong providers stand out over time.",
    icon: LineChart,
  },
  {
    title: "Build repeatable operations",
    description:
      "Reservations, support, and structured records make service delivery easier to scale.",
    icon: Store,
  },
  {
    title: "Learn the platform flow",
    description:
      "Customers, workers, and organisations can grow faster when every role understands the system.",
    icon: GraduationCap,
  },
];

export const CareersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fafbfc] font-body text-slate-950 selection:bg-slate-900 selection:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-10rem] top-[8rem] h-[32rem] w-[32rem] rounded-full bg-slate-200/75 blur-[120px]" />
        <div className="absolute left-[-12rem] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-blue-100/35 blur-[110px]" />
      </div>
      <main className="mx-auto w-full max-w-340 px-6 pb-20 pt-8 sm:px-10 sm:pt-10 lg:px-16 lg:pt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to landing
        </Link>

        <section className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/82 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                Company / Careers
              </p>
              <h1 className="mt-5 font-headline text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
                Grow your work, team, or service journey with Skill-Link.
              </h1>
            </div>
            <div>
              <p className="text-base leading-8 text-slate-600 sm:text-lg">
                Careers at Skill-Link are not only internal jobs. This page is
                for everyone who can grow through the platform: workers looking
                for better opportunities, customers looking for dependable help,
                and organisations building stronger service operations.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="group mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800"
              >
                Create your account
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                Join paths
              </p>
              <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-[-0.04em] text-slate-950">
                Three ways to belong on Skill-Link.
              </h2>
            </div>
            <BriefcaseBusiness className="hidden h-10 w-10 text-slate-400 sm:block" />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {joinPaths.map((path) => {
              const Icon = path.icon;

              return (
                <article
                  key={path.audience}
                  className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {path.audience}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                    {path.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {path.description}
                  </p>
                  <div className="mt-6 grid gap-2">
                    {path.points.map((point) => (
                      <div
                        key={point}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-16 grid gap-8 border-t border-slate-200/80 pt-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
              How growth happens
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950">
              The platform rewards clarity, reliability, and good service.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
              Skill-Link helps users grow by turning trust into something
              visible: complete profiles, cleaner booking flows, stronger
              records, and better support paths.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {growthSignals.map((signal) => {
              const Icon = signal.icon;

              return (
                <article
                  key={signal.title}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-[-0.02em] text-slate-950">
                    {signal.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {signal.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                Start here
              </p>
              <h2 className="mt-4 font-headline text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                Join as the role that fits you today. Grow into the next one
                tomorrow.
              </h2>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-100"
            >
              Join the platform
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
