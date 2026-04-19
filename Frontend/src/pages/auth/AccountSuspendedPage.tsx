import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft } from 'lucide-react';
import { clearAuthNotice, getAuthNotice } from '@/features/auth/utils/authNotice';

export const AccountSuspendedPage: React.FC = () => {
  const notice = getAuthNotice();
  const message =
    notice?.message ||
    'Account has been suspended. Please contact linkskillofficial@gmail.com for support.';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-[2rem] border border-black bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-10">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-black bg-black text-white">
          <AlertOctagon className="h-7 w-7" />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-black/50">
          Account Status
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-black">
          Account Suspended
        </h1>
        <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-black/70">
          {message}
        </p>

        <div className="mt-5 rounded-2xl border border-black/10 bg-black/[0.04] p-4">
          <p className="text-sm font-semibold text-black">Need help?</p>
          <p className="mt-2 text-sm leading-6 text-black/70">
            If you think this was a mistake, email{' '}
            <a
              href="mailto:linkskillofficial@gmail.com"
              className="font-semibold text-black underline underline-offset-4"
            >
              linkskillofficial@gmail.com
            </a>
            . An admin can review your case and unblacklist your account.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/login"
            onClick={() => clearAuthNotice()}
            className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-black/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Login
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-transparent px-5 py-3 text-sm font-bold text-black transition hover:bg-black/[0.04]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};
