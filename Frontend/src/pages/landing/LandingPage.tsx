import React from "react";
import {
  ArrowRight,
  Clock3,
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { submitContactInquiry } from "./api/contact";
import { LandingNavbar } from "./sections/LandingNavbar";
import { LandingHero } from "./sections/LandingHero";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = React.useState("");
  const [activeSocial, setActiveSocial] = React.useState<
    "instagram" | "linkedin" | "github"
  >();

  React.useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el = document.getElementById(hash);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash]);

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setSubmitStatus("error");
      setSubmitMessage("Please fill in all fields before sending.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      await submitContactInquiry({
        fullName: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });

      setSubmitStatus("success");
      setSubmitMessage(
        "Inquiry sent successfully. Our team will get back to you shortly.",
      );
      setFullName("");
      setEmail("");
      setMessage("");
    } catch {
      setSubmitStatus("error");
      setSubmitMessage(
        "We could not send your inquiry right now. Please try again in a minute.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerColumns = [
    {
      title: "Platform",
      links: [
        { label: "How it works", href: "/platform/how-it-works" },
        { label: "Verified workers", href: "/platform/verified-workers" },
        { label: "Reservations", href: "/platform/reservations" },
        { label: "Safety standards", href: "/platform/safety-standards" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Skill-Link", href: "/company/about" },
        { label: "Careers", href: "/company/careers" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy policy", href: "/legal/privacy-policy" },
        { label: "Refund policy", href: "/legal/refund-policy" },
      ],
    },
  ];

  const developerSocials = {
    instagram: {
      label: "Instagram",
      icon: Instagram,
      accent: "from-pink-500 to-orange-400",
      profiles: [
        {
          name: "Vidhit Sikri",
          handle: "@vidhitsikri09._",
          href: "https://www.instagram.com/vidhitsikri09._",
        },
        {
          name: "Shankar Jangid",
          handle: "@shankar_jangid_07",
          href: "https://www.instagram.com/shankar_jangid_07",
        },
        {
          name: "Udit Bansal",
          handle: "@smraat_udit_2312",
          href: "https://www.instagram.com/smraat_udit_2312",
        },
      ],
    },
    linkedin: {
      label: "LinkedIn",
      icon: Linkedin,
      accent: "from-blue-600 to-cyan-500",
      profiles: [
        {
          name: "Udit Bansal",
          handle: "Professional profile",
          href: "https://www.linkedin.com/in/udit-bansal-4515712b2/",
        },
        {
          name: "Shankar Jangid",
          handle: "Professional profile",
          href: "https://www.linkedin.com/in/shankar-07jangid/",
        },
        {
          name: "Vidhit Sikri",
          handle: "Professional profile",
          href: "https://www.linkedin.com/in/vidhit-sikri/",
        },
      ],
    },
    github: {
      label: "GitHub",
      icon: Github,
      accent: "from-slate-950 to-slate-600",
      profiles: [
        {
          name: "Vidhit Sikri",
          handle: "VidhitSikri",
          href: "https://github.com/VidhitSikri",
        },
        {
          name: "Shankar Jangid",
          handle: "Shankar-0707",
          href: "https://github.com/Shankar-0707",
        },
        {
          name: "Udit Bansal",
          handle: "Udi2312",
          href: "https://github.com/Udi2312",
        },
      ],
    },
  };

  const activeDeveloperSocial = activeSocial
    ? developerSocials[activeSocial]
    : null;
  const ActiveSocialIcon = activeDeveloperSocial?.icon;

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#fafbfc] font-body selection:bg-slate-900 selection:text-white scroll-smooth">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] h-[70vw] w-[70vw] rounded-full bg-linear-to-b from-slate-200/50 to-transparent opacity-70 mix-blend-multiply blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[60vw] w-[60vw] rounded-full bg-linear-to-tr from-slate-200/60 to-transparent opacity-60 mix-blend-multiply blur-[120px]" />
        <div className="absolute left-[20%] top-[20%] h-[40vw] w-[40vw] rounded-full bg-blue-100/30 mix-blend-multiply blur-[120px]" />
      </div>

      <LandingNavbar />

      <main className="relative z-10 mx-auto w-full max-w-340 flex-1 px-6 pb-20 pt-32 sm:px-10 lg:px-16 lg:pt-36">
        <section id="home" className="scroll-mt-36">
          <LandingHero />
        </section>

        <section
          id="about"
          className="scroll-mt-36 border-t border-slate-200/80 pt-20"
        >
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                About Skill-Link
              </p>
              <h2 className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Built to make hiring skilled workers calm, clear, and reliable.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Skill-Link brings customers, workers, and organisations into one
                structured flow. The platform focuses on verified talent,
                transparent work steps, and dependable support so teams can move
                from inquiry to completion with confidence.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigate("/register")}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800"
                >
                  Start with Skill-Link
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-400 hover:bg-white"
                >
                  Talk to our team
                </a>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <article className="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  01
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950">
                  Trust Layer
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  KYC, quality controls, and clear accountability are designed
                  into the core workflow.
                </p>
              </article>
              <article className="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  02
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950">
                  Operational Clarity
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Structured booking and reservation flows reduce confusion and
                  improve delivery reliability.
                </p>
              </article>
              <article className="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  03
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-[-0.02em] text-slate-950">
                  Professional Presence
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Workers and organisations get a stronger, more credible way to
                  present their capabilities.
                </p>
              </article>
              <article className="rounded-[1.75rem] border border-slate-200/70 bg-slate-900 p-6 text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  04
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-[-0.02em]">
                  One Connected System
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Customer hiring, worker discovery, and organisation operations
                  all stay aligned in one experience.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="scroll-mt-36 border-t border-slate-200/80 pt-20"
        >
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-4xl border border-slate-200/70 bg-white/80 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                Contact Us
              </p>
              <h2 className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Let us help you get started.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Have questions about onboarding, hiring flow, or account setup?
                Share your details and our team will get back to you.
              </p>

              <form
                onSubmit={handleContactSubmit}
                className="mt-8 grid gap-4 sm:grid-cols-2"
              >
                <label className="flex flex-col gap-2 sm:col-span-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Full Name
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    required
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-slate-400"
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Work Email
                  </span>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-slate-400"
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Message
                  </span>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you are looking for"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    required
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-slate-400"
                  />
                </label>
                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800"
                  >
                    {isSubmitting ? "Sending..." : "Send Inquiry"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-400"
                  >
                    Create Account
                  </button>
                </div>
                {submitStatus !== "idle" && (
                  <p
                    className={`text-sm sm:col-span-2 ${
                      submitStatus === "success"
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {submitMessage}
                  </p>
                )}
              </form>
            </div>

            <aside className="grid gap-4">
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">Email</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  linkskillofficial@gmail.com
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">Phone</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">+91 88829 30649</p>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-900">Office</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">Delhi, India</p>
              </div>
              <div className="rounded-3xl border border-slate-200/70 bg-slate-900 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-slate-300" />
                  <p className="text-sm font-semibold">Support Hours</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Monday to Saturday, 9:00 AM to 7:00 PM IST.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-auto shrink-0 border-t border-slate-200/80 bg-white/65 backdrop-blur-md">
        <div className="mx-auto grid max-w-340 gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16">
          <div>
            <p className="font-headline text-2xl font-black uppercase tracking-[0.18em] text-slate-900">
              Skill-Link
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              A modern platform for trustworthy hiring, strong worker presence,
              and smoother service operations.
            </p>
            <div className="relative mt-6 flex max-w-md flex-wrap gap-2">
              <div className="flex flex-wrap gap-2">
                {(
                  Object.keys(developerSocials) as Array<
                    keyof typeof developerSocials
                  >
                ).map((platform) => {
                  const social = developerSocials[platform];
                  const Icon = social.icon;
                  const isActive = activeSocial === platform;

                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() =>
                        setActiveSocial((current) =>
                          current === platform ? undefined : platform,
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? "border-slate-950 bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {social.label}
                    </button>
                  );
                })}
              </div>

              {activeDeveloperSocial && ActiveSocialIcon && (
                <div className="absolute bottom-full left-0 z-30 mb-4 w-[min(92vw,24rem)] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                  <div
                    className={`bg-linear-to-r ${activeDeveloperSocial.accent} p-4 text-white`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/20">
                          <ActiveSocialIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-black">
                            Meet the developers
                          </p>
                          <p className="text-xs font-semibold text-white/75">
                            Open any {activeDeveloperSocial.label} profile
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSocial(undefined)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                        aria-label="Close developer profiles"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2 bg-slate-50 p-3">
                    {activeDeveloperSocial.profiles.map((profile) => (
                      <a
                        key={`${activeSocial}-${profile.name}`}
                        href={profile.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-0.5 hover:ring-slate-300"
                      >
                        <span>
                          <span className="block text-sm font-bold text-slate-950">
                            {profile.name}
                          </span>
                          <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                            {profile.handle}
                          </span>
                        </span>
                        <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-slate-950" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={typeof link === "string" ? link : link.label}>
                      {typeof link === "string" ? (
                        <a
                          href="#"
                          className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                        >
                          {link}
                        </a>
                      ) : (
                        <a
                          href={link.href}
                          className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-200/70">
          <div className="mx-auto flex max-w-340 flex-col gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
            <p>2026 Skill-Link. All rights reserved.</p>
            <p>Built for modern service marketplaces.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
