import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Sparkles, Workflow } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const heroPoints = [
  {
    icon: ShieldCheck,
    title: "Verified skilled workers",
    description: "Connect with trusted professionals who are background-checked and ready to work.",
  },
  {
    icon: Workflow,
    title: "Seamless hiring process",
    description: "Post jobs, review bids, and hire the right talent in minutes, not days.",
  },
  {
    icon: Sparkles,
    title: "Quality you can trust",
    description: "Secure payments, real-time tracking, and guaranteed satisfaction on every project.",
  },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.08),_transparent_28%),linear-gradient(135deg,_#f7f8fb_0%,_#edf3ff_52%,_#f8f3ec_100%)] md:h-screen">
      <div className="flex min-h-screen flex-col md:h-screen md:flex-row">
        <div className="relative hidden md:flex md:h-screen md:w-[47%] md:overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#07111f_0%,#0c1d35_55%,#0c2233_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.15),transparent_20%),radial-gradient(circle_at_78%_16%,rgba(249,115,22,0.11),transparent_22%),radial-gradient(circle_at_52%_78%,rgba(45,212,191,0.08),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid)" />
            </svg>
          </div>

          <div className="relative z-10 flex h-full w-full flex-col px-12 py-8 lg:px-16 lg:py-10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/12 bg-white/10 px-5 py-3 backdrop-blur-xl">
                <span className="text-sm font-black uppercase tracking-[0.38em] text-white">
                  Skill-Link
                </span>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-xl">
                Premium skilled marketplace
              </div>
            </div>

            <div className="flex flex-1 items-center">
              <div className="max-w-[34rem]">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur-xl">
                  <Sparkles className="h-4 w-4" />
                  Trusted by thousands of businesses
                </div>

                <h1 className="font-headline text-4xl font-extrabold leading-[0.96] tracking-[-0.05em] text-white lg:text-5xl">
                  Connect talent
                  <br />
                  with confidence.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                  Find skilled workers for any job, manage projects effortlessly, and grow your business with India's most trusted marketplace.
                </p>

                <div className="mt-6 space-y-4">
                  {heroPoints.map((point) => (
                    <div
                      key={point.title}
                      className="flex items-start gap-4 rounded-[1.75rem] border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-xl"
                    >
                      <div className="rounded-2xl bg-white/10 p-2 text-cyan-100">
                        <point.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">{point.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative md:hidden">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#07111f_0%,#0c1d35_55%,#0c2233_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.12),transparent_26%)]" />
          <div className="relative px-5 pb-6 pt-5 text-white">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showBackButton && (
                  <button
                    onClick={() => navigate(-1)}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-white/10 p-2.5 backdrop-blur"
                    aria-label="Go back"
                    title="Go back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <span className="text-xs font-black uppercase tracking-[0.36em] text-white/90">
                  Skill-Link
                </span>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                Trusted access
              </div>
            </div>

            <h1 className="font-headline text-3xl font-extrabold leading-tight tracking-[-0.04em]">
              Connect talent with confidence.
            </h1>
            <p className="mt-3 max-w-sm text-xs leading-6 text-slate-300">
              Find skilled workers, manage projects, and grow your business with India's trusted marketplace.
            </p>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-6 py-8 sm:px-8 md:h-screen md:w-[53%] md:px-10 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),rgba(255,255,255,0)_52%)]" />

          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="absolute left-6 top-6 z-20 hidden cursor-pointer items-center gap-2 rounded-full border border-white/75 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:bg-white md:flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <div className="relative z-10 w-full max-w-[48rem] px-4 sm:px-6">
            <div className="rounded-[1.8rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,252,0.98))] px-8 py-6 shadow-[0_28px_80px_rgba(15,23,42,0.14)] sm:py-7 md:px-10 md:py-8 lg:px-12">
              <div className="mb-5">
                <div className="mb-3 inline-flex items-center rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-primary/70">
                  Welcome to Skill-Link
                </div>
                <h2 className="font-headline text-3xl font-extrabold tracking-[-0.05em] text-primary sm:text-4xl">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
