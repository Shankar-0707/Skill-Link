import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Loader2,
  Shield,
} from 'lucide-react';
import { WorkerLayout } from '../../features/worker/components/layout/Layout';
import { platformContractService } from '../../features/worker/api/platformContractService';
import type { PlatformContractStatus } from '../../features/worker/api/platformContractService';

const PLATFORM_FEE_PERCENT = 10;

export const PlatformFeeContractPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PlatformContractStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformContractService.getStatus();
      setStatus(data);
      setError(null);
    } catch {
      setError('Failed to load platform contract status. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSign = async () => {
    if (!agreed) return;
    setSigning(true);
    setError(null);
    try {
      await platformContractService.sign();
      await fetchStatus();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError?.response?.data?.message ||
          'Failed to sign the platform contract. Please try again.',
      );
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Loading platform contract...</p>
        </div>
      </WorkerLayout>
    );
  }

  if (error && !status) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load contract</h2>
          <p className="text-gray-500 max-w-xs mb-6">{error}</p>
          <button
            onClick={fetchStatus}
            className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-xl"
          >
            Retry
          </button>
        </div>
      </WorkerLayout>
    );
  }

  if (!status) return null;

  if (status.kycStatus !== 'VERIFIED') {
    return (
      <WorkerLayout>
        <div className="max-w-2xl mx-auto">
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <Shield className="w-10 h-10 text-amber-600 mx-auto mb-4" />
            <h1 className="font-bold text-xl text-gray-900 mb-2">KYC Required First</h1>
            <p className="text-sm text-gray-600 mb-6">
              Complete identity verification before you can review and sign the platform fee contract.
            </p>
            <button
              onClick={() => navigate('/worker/settings')}
              className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:opacity-90"
            >
              Go to KYC Verification
            </button>
          </div>
        </div>
      </WorkerLayout>
    );
  }

  if (status.isSigned) {
    return (
      <WorkerLayout>
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
            <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-5 shadow-lg shadow-green-200">
              <BadgeCheck className="w-10 h-10" />
            </div>
            <h1 className="font-bold text-2xl text-gray-900 mb-2">Contract Signed</h1>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-4">
              You have agreed to the Skill-Link platform fee terms. You can now browse and accept jobs.
            </p>
            {status.signedAt && (
              <p className="text-xs text-green-600 font-semibold">
                Signed on {new Date(status.signedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </p>
            )}
            <button
              onClick={() => navigate('/worker/available-jobs')}
              className="mt-6 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:opacity-90"
            >
              Browse Available Jobs
            </button>
          </div>
        </div>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1
                className="font-bold text-3xl text-gray-900 leading-tight"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Platform Fee Agreement
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Required to start working on Skill-Link
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 mb-6">
          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed">
            Your KYC is verified. Review and accept this agreement to unlock job discovery and assignments.
            Until signed, no jobs will be shown to you on the platform.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Skill-Link Worker Platform Agreement
          </h2>

          <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
            <section>
              <h3 className="font-bold text-gray-900 mb-2">1. Purpose</h3>
              <p>
                This agreement governs your use of the Skill-Link marketplace as an independent service
                provider. By signing, you confirm that you understand how platform fees apply to completed jobs.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">2. Platform Fee</h3>
              <p>
                Skill-Link charges a platform service fee of{' '}
                <span className="font-bold text-gray-900">{PLATFORM_FEE_PERCENT}%</span> on each
                successfully completed job. This fee is deducted from the gross job payment before funds
                are released to your wallet.
              </p>
              <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Example</p>
                <p className="text-sm text-gray-700">
                  For a ₹1,000 job, the platform fee is ₹100 and your net payout is ₹900.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">3. Payments & Escrow</h3>
              <p>
                Customer payments are held in escrow until job completion is confirmed. After confirmation,
                your net earnings (after the platform fee) are credited to your Skill-Link wallet.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">4. Worker Responsibilities</h3>
              <p>
                You agree to deliver services professionally, maintain valid KYC, communicate clearly with
                customers, and comply with Skill-Link policies. Failure to comply may result in account
                restrictions.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">5. Acceptance</h3>
              <p>
                By checking the box below and clicking &quot;Sign Agreement&quot;, you acknowledge that you
                have read, understood, and agree to these terms, including the{' '}
                {PLATFORM_FEE_PERCENT}% per-job platform fee.
              </p>
            </section>
          </div>
        </div>

        <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            I have read and agree to the Skill-Link Platform Fee Agreement, including the{' '}
            {PLATFORM_FEE_PERCENT}% platform fee on each completed job.
          </span>
        </label>

        <button
          onClick={handleSign}
          disabled={!agreed || signing || !status.canSign}
          className="w-full py-4 bg-gray-900 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {signing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Sign Agreement
            </>
          )}
        </button>
      </div>
    </WorkerLayout>
  );
};
