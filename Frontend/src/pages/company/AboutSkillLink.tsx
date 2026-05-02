import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Layers3,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LandingNavbar } from "../landing/sections/LandingNavbar";

const pillars = [
  {
    title: "Trust before transaction",
    description:
      "Skill-Link brings verification, worker profiles, and visible service records into the hiring journey.",
    icon: ShieldCheck,
  },
  {
    title: "A place for every role",
    description:
      "Customers, workers, organisations, and admins each get tools built around their actual responsibilities.",
    icon: UsersRound,
  },
  {
    title: "Operations that feel calm",
    description:
      "Jobs, reservations, support, and payments are structured so teams can move without losing context.",
    icon: Layers3,
  },
];

const platformRoles = [
  "Customers find skilled help with clearer profiles and safer service flows.",
  "Workers build a professional identity that can grow with every completed job.",
  "Organisations manage products, reservations, workers, and customer trust in one place.",
];

export const AboutSkillLinkPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fafbfc] font-body text-slate-950 selection:bg-slate-900 selection:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-100/40 blur-[110px]" />
        <div className="absolute left-[-14rem] top-[34rem] h-[34rem] w-[34rem] rounded-full bg-slate-200/70 blur-[120px]" />
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

        <section className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
              Company / About Skill-Link
            </p>
            <h1 className="mt-5 font-headline text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Building the trust layer for local service work.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Skill-Link exists to make skilled hiring feel more professional,
              transparent, and dependable. We connect people who need work done
              with verified workers and capable organisations that can deliver
              with accountability.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800"
              >
                Join Skill-Link
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <Link
                to="/company/careers"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-400 hover:bg-white"
              >
                See growth paths
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white/82 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    Our model
                  </p>
                  <h2 className="mt-3 font-headline text-3xl font-extrabold tracking-[-0.03em]">
                    One platform, three connected journeys.
                  </h2>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                  <Building2 className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {platformRoles.map((role) => (
                  <div
                    key={role}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/7 p-4"
                  >
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                    <p className="text-sm leading-6 text-slate-200">{role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-4 border-t border-slate-200/80 pt-16 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article
                key={pillar.title}
                className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-bold tracking-[-0.02em] text-slate-950">
                  {pillar.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-16 rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                What we are building
              </p>
              <h2 className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950">
                A professional marketplace for everyday essential services.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Cleaner discovery for skilled professionals.",
                "More reliable service commitments through reservations.",
                "Better operational tools for growing organisations.",
                "Support and safety systems that keep trust visible.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <Sparkles className="h-5 w-5 text-slate-800" />
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
