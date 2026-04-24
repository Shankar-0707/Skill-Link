import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Compass,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from './sections/LandingNavbar';

const manifestoPoints = [
  'Discovery should feel curated, not chaotic.',
  'Trust should be visible before work begins.',
  'Professional workers deserve a better stage.',
  'Operations should stay clear from inquiry to completion.',
];

const audiencePanels = [
  {
    title: 'Customers',
    kicker: 'Hire with less hesitation',
    body: 'A calmer way to find skilled people, compare options, and move forward without the usual marketplace ambiguity.',
  },
  {
    title: 'Workers',
    kicker: 'Be seen for real capability',
    body: 'A stronger platform presence for serious professionals who want credibility, visibility, and better-fit opportunities.',
  },
  {
    title: 'Organisations',
    kicker: 'Run service operations with structure',
    body: 'A more orderly environment for managing talent, reservations, and delivery flows across growing teams.',
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: 'Trust as infrastructure',
    body: 'Verification, accountability, and support are part of the foundation, not decorative features layered on top.',
  },
  {
    icon: Compass,
    title: 'Clarity over noise',
    body: 'We prefer guided flows, restrained interfaces, and information that helps users decide with confidence.',
  },
  {
    icon: Building2,
    title: 'Built for real operations',
    body: 'Skill-Link is shaped around the realities of jobs, reservations, coordination, and follow-through.',
  },
];

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7f8] font-body text-slate-900 selection:bg-slate-900 selection:text-white">
      <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.35),transparent_28%),radial-gradient(circle_at_left,rgba(226,232,240,0.85),transparent_26%)]" />
      <div className="absolute left-[8%] top-[10rem] h-40 w-40 rounded-full border border-white/60 bg-white/30 blur-3xl" />
      <div className="absolute bottom-[18%] right-[6%] h-52 w-52 rounded-full bg-slate-200/60 blur-[120px]" />

      <LandingNavbar />

      <main className="relative z-10 mx-auto max-w-[85rem] px-6 pb-24 pt-32 sm:px-10 lg:px-16 lg:pt-36">
        <section className="grid gap-10 border-b border-slate-200/70 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="max-w-4xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.32em] text-slate-500">
              About Skill-Link
            </p>
            <h1 className="max-w-4xl font-headline text-5xl font-extrabold leading-[0.92] tracking-[-0.055em] text-slate-950 sm:text-7xl lg:text-[5.4rem]">
              A cleaner standard for how skilled work gets discovered.
            </h1>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Skill-Link is not trying to be a noisy marketplace. It is being shaped as a more deliberate platform for customers, workers, and organisations that want confidence, structure, and a more professional experience from the first click.
              </p>
              <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                  Working Thesis
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  People do not just need access to skilled talent. They need a platform that makes those decisions feel safer, clearer, and more accountable.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => navigate('/register')}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
              >
                Start with Skill-Link
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-7 py-4 text-base font-semibold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-white"
              >
                Return to Landing
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-1">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="Professionals in discussion"
                className="h-[19rem] w-full rounded-[1.5rem] object-cover"
              />
              <div className="absolute bottom-8 left-8 max-w-xs rounded-[1.4rem] bg-slate-950/88 px-5 py-4 text-white backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-300">Not a listing board</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  A more composed environment for trusted talent discovery and better service coordination.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-[1.75rem] border border-slate-200/70 bg-[#101826] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">North Star</p>
                <p className="mt-4 font-headline text-3xl font-bold leading-tight tracking-[-0.04em]">
                  Make skilled work feel credible online.
                </p>
              </div>
              <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/70 p-3 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80"
                  alt="Team planning operations"
                  className="h-48 w-full rounded-[1.25rem] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">Why It Exists</p>
            <h2 className="mt-4 max-w-xl font-headline text-4xl font-extrabold leading-tight tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Most service platforms solve access. Fewer solve confidence.
            </h2>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-slate-200/70 bg-white/75 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <p className="text-base leading-8 text-slate-600">
                There is no shortage of places where people can browse talent. The harder problem is knowing who to trust, how work will be coordinated, and whether the experience will hold together when it actually matters. Skill-Link is being designed around that harder problem.
              </p>
              <p className="mt-5 text-base leading-8 text-slate-600">
                That means a sharper emphasis on verification, stronger platform accountability, and workflows that feel more composed than the usual scroll-and-hope experience. The goal is simple: a marketplace that looks better because it behaves better.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-200/70 shadow-[0_24px_60px_rgba(15,23,42,0.05)] sm:grid-cols-2">
              {manifestoPoints.map((point, index) => (
                <div key={point} className="bg-white/85 p-6 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                    0{index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 border-y border-slate-200/70 py-16 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">Designed For</p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-[-0.045em] text-slate-950">
              Three groups.
              <br />
              One professional system.
            </h2>
          </div>

          <div className="grid gap-5">
            {audiencePanels.map((panel) => (
              <article
                key={panel.title}
                className="group grid gap-5 rounded-[2rem] border border-slate-200/70 bg-white/75 p-7 shadow-[0_20px_50px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.08)] md:grid-cols-[0.28fr_0.72fr]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-headline text-2xl font-bold tracking-[-0.035em] text-slate-950">
                    {panel.title}
                  </h3>
                  <ArrowUpRight className="h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {panel.kicker}
                  </p>
                  <p className="mt-3 text-base leading-8 text-slate-600">{panel.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.25rem] border border-white/80 bg-[#0f172a] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.12)] lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">Principles</p>
            <h2 className="mt-4 max-w-xl font-headline text-4xl font-extrabold leading-tight tracking-[-0.045em]">
              The product should feel restrained, capable, and dependable.
            </h2>

            <div className="mt-10 space-y-6">
              {principles.map(({ icon: Icon, title, body }) => (
                <div key={title} className="border-t border-white/10 pt-6 first:border-t-0 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <Icon className="h-5 w-5 text-slate-100" />
                    </div>
                    <h3 className="font-headline text-2xl font-bold tracking-[-0.03em]">{title}</h3>
                  </div>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">Trust Layer</p>
              <p className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
                Confidence should show up in the product before it is ever promised in the copy.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-slate-900" />
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">What That Means</p>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex gap-3 text-sm leading-7 text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-950" />
                  Verification and accountability mechanisms that support credibility.
                </li>
                <li className="flex gap-3 text-sm leading-7 text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-950" />
                  Interface decisions that reduce clutter and improve decision quality.
                </li>
                <li className="flex gap-3 text-sm leading-7 text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-950" />
                  Support for customers, workers, and organisations inside one coherent experience.
                </li>
              </ul>
            </div>

            <div id="contact" className="rounded-[2rem] border border-slate-200/70 bg-[#e9eef5] p-8 shadow-[0_24px_60px_rgba(15,23,42,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-500">Next Step</p>
                  <h3 className="mt-3 font-headline text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
                    If that standard feels right, join early.
                  </h3>
                </div>
                <Users className="h-6 w-6 text-slate-500" />
              </div>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
                Skill-Link is being built for people who want skilled work online to feel more serious, more trustworthy, and more thoughtfully managed.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigate('/register')}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800"
                >
                  Create Account
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-400 hover:bg-white"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
