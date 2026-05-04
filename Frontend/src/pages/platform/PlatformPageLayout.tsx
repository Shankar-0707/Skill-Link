import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type Metric = {
  value: string;
  label: string;
};

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type ProcessStep = {
  label: string;
  title: string;
  description: string;
};

type PlatformPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  heroIcon: LucideIcon;
  metrics: Metric[];
  features: Feature[];
  processTitle: string;
  processDescription: string;
  steps: ProcessStep[];
  highlightTitle: string;
  highlightDescription: string;
  highlightPoints: string[];
};

export const PlatformPageLayout: React.FC<PlatformPageLayoutProps> = ({
  eyebrow,
  title,
  description,
  heroIcon: HeroIcon,
  metrics,
  features,
  processTitle,
  processDescription,
  steps,
  highlightTitle,
  highlightDescription,
  highlightPoints,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fafbfc] font-body text-slate-950 selection:bg-slate-900 selection:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-[16%] top-0 h-[42rem] w-[42rem] rounded-full bg-blue-100/35 blur-[120px]" />
        <div className="absolute -left-[18%] top-[30rem] h-[38rem] w-[38rem] rounded-full bg-slate-200/65 blur-[120px]" />
      </div>
      <main className="mx-auto w-full max-w-340 px-6 pb-20 pt-8 sm:px-10 sm:pt-10 lg:px-16 lg:pt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to landing
        </Link>

        <section className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_0.82fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl font-headline text-4xl font-extrabold leading-[1] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800"
              >
                Start with Skill-Link
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <Link
                to="/#contact"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-400 hover:bg-white"
              >
                Talk to our team
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  Platform overview
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Clear, verified, accountable
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)]">
                <HeroIcon className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-headline text-2xl font-extrabold text-slate-950">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-18 border-t border-slate-200/80 pt-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-white/82 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-lg font-bold tracking-[-0.02em] text-slate-950">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-16 grid gap-8 border-t border-slate-200/80 pt-16 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
              Built into the flow
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950">
              {processTitle}
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
              {processDescription}
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map((step) => (
              <article
                key={step.label}
                className="grid gap-4 rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)] sm:grid-cols-[auto_1fr]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                  {step.label}
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                Why it matters
              </p>
              <h2 className="mt-4 font-headline text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                {highlightTitle}
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
                {highlightDescription}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlightPoints.map((point) => (
                <div
                  key={point}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/7 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-6 text-slate-200">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
