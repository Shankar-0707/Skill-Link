import React from "react";
import {
  ArrowLeft,
  Database,
  Eye,
  FileText,
  KeyRound,
  LockKeyhole,
  Mail,
  ServerCog,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const summaryCards = [
  {
    title: "We collect what the platform needs",
    description:
      "Account details, role-specific profile information, KYC documents, reservations, jobs, wallet records, and support communication.",
    icon: Database,
  },
  {
    title: "We do not sell personal information",
    description:
      "Information is shared only when needed for service delivery, security, payments, support, or legal compliance.",
    icon: ShieldCheck,
  },
  {
    title: "Security is built into operations",
    description:
      "Passwords are encrypted, access is limited, and verification data is handled with care across the platform.",
    icon: LockKeyhole,
  },
];

const policySections = [
  {
    title: "1. Information we collect",
    body:
      "When you register for Skill-Link, we collect information such as your email address, full name, phone number, encrypted password, profile image, and selected role. Workers may provide skills, experience, service radius, bio, availability, KYC documents such as Aadhaar, PAN, Driving License, Passport, skill certificates, and profile photographs. Organisations may provide business name, business type, business description, product listings, and product images. We also collect job postings, product reservations, transaction history, wallet records, pickup OTP activity, help tickets, support requests, feedback, and reviews.",
    icon: FileText,
  },
  {
    title: "2. Information collected automatically",
    body:
      "When you use the platform, we may automatically collect device and usage information including IP address, browser type, operating system, pages visited, features used, time spent on the platform, access times, error logs, and performance data. This helps us keep Skill-Link stable, secure, and easier to improve.",
    icon: Eye,
  },
  {
    title: "3. Google sign-in information",
    body:
      "If you sign in using Google OAuth, we receive your email address, name, profile picture, and Google ID. We do not access other Google account information unless you explicitly permit it.",
    icon: KeyRound,
  },
  {
    title: "4. How we use your information",
    body:
      "We use your information to create and manage accounts, verify email addresses, process job postings and assignments, facilitate reservations, manage escrow and wallet activity, generate pickup OTPs, enable support, send password reset links, provide transaction updates, prevent fraud, enforce platform rules, improve product reliability, and comply with applicable legal obligations.",
    icon: ServerCog,
  },
  {
    title: "5. How information is shared",
    body:
      "We share information only when needed. Customers can view worker profiles, skills, and ratings. Workers may view relevant job postings and assigned customer details. Organisations can display business and product information to customers. Transaction participants can see information required to complete a service. Trusted service providers may help with hosting, email delivery, Cloudinary image storage, payment processing, analytics, and monitoring. These providers are expected to protect your information and use it only for the services they provide to Skill-Link.",
    icon: UserCheck,
  },
  {
    title: "6. Your choices and support",
    body:
      "You can keep your account information accurate, update profile details, manage role-specific information, and contact support for privacy-related questions. Some information may need to be retained for security, dispute resolution, payment records, fraud prevention, or legal compliance.",
    icon: Mail,
  },
];

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#fafbfc] font-body text-slate-950 selection:bg-slate-900 selection:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-10rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-blue-100/40 blur-[120px]" />
        <div className="absolute left-[-14rem] top-[34rem] h-[34rem] w-[34rem] rounded-full bg-slate-200/70 blur-[120px]" />
      </div>
      <main className="mx-auto w-full max-w-340 px-6 pb-20 pt-8 sm:px-10 sm:pt-10 lg:px-16 lg:pt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to landing
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
              Legal / Privacy Policy
            </p>
            <h1 className="mt-5 font-headline text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Your information should be handled with clarity and care.
            </h1>
          </div>
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
            <p className="text-sm font-bold text-slate-950">
              Last Updated: May 2, 2026
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Welcome to Skill-Link. This Privacy Policy explains how we
              collect, use, disclose, and safeguard information when you use our
              platform. By accessing or using Skill-Link, you agree to the
              practices described here.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-bold tracking-[-0.02em] text-slate-950">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-16 grid gap-5">
          {policySections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="grid gap-5 rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_16px_44px_rgba(15,23,42,0.05)] sm:grid-cols-[auto_1fr]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-950">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {section.body}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-16 rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                Privacy support
              </p>
              <h2 className="mt-4 font-headline text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                Questions about your information?
              </h2>
            </div>
            <p className="text-sm leading-7 text-slate-300 sm:text-base">
              Contact Skill-Link support if you need help understanding your
              account information, verification records, or privacy choices.
              We may update this policy as the platform grows, and the latest
              version will always be reflected by the Last Updated date.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
