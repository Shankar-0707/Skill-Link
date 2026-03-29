import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../features/auth/components/AuthLayout';
import { Mail, ArrowRight } from 'lucide-react';

export const CheckResetEmailPage: React.FC = () => {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || 'your email';

  return (
    <AuthLayout
      title="Check Your Email"
      subtitle="Password reset link sent"
      showBackButton={false}
    >
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-700">
            Password reset email sent to
          </p>
          <p className="text-lg font-bold text-primary">{email}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-left">
          <p className="text-sm leading-6 text-slate-600">
            Click the reset link in your email to create a new password. The link will expire in 1 hour.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-sm text-slate-500">
            Didn't receive the email? Check your spam folder or{' '}
            <Link to="/forgot-password" className="font-bold text-primary hover:underline">
              try again
            </Link>
          </p>

          <Link
            to="/login"
            className="group flex items-center justify-center gap-2 rounded-[1.35rem] bg-[linear-gradient(135deg,#000613_0%,#0b1b33_100%)] py-3 text-lg font-bold text-white shadow-[0_18px_35px_rgba(2,6,23,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(2,6,23,0.25)] active:scale-[0.98]"
          >
            Go to Sign In
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
