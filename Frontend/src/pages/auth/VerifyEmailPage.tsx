import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../features/auth/components/AuthLayout";
import { authApi } from "../../features/auth/api/auth";
import { resolveApiErrorMessage } from "../../features/auth/utils/errorMessage";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type VerifyState = "loading" | "success" | "error";

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams],
  );
  const [state, setState] = useState<VerifyState>(() =>
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(() =>
    token
      ? "Verifying your email..."
      : "Verification token is missing from the URL.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const runVerification = async () => {
      try {
        const response = await authApi.verifyEmail(token);
        if (!isMounted) {
          return;
        }
        setState("success");
        setMessage(
          response.message ??
            "Email verified successfully!",
        );
        window.setTimeout(() => {
          navigate("/login", { 
            replace: true,
            state: { emailVerified: true }
          });
        }, 2500);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setState("error");
        setMessage(
          resolveApiErrorMessage(
            error,
            "Verification failed. Please request a new email.",
          ),
        );
      }
    };

    void runVerification();

    return () => {
      isMounted = false;
    };
  }, [navigate, token]);

  return (
    <AuthLayout
      title={state === "success" ? "Email Verified" : state === "loading" ? "Verifying..." : "Verification Failed"}
      subtitle={state === "success" ? "Welcome to Skill-Link" : "Securing your account"}
      showBackButton={false}
    >
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          {state === "loading" && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
          {state === "success" && <CheckCircle2 className="h-10 w-10 text-emerald-500" />}
          {state === "error" && <XCircle className="h-10 w-10 text-red-500" />}
        </div>

        <p className="text-base font-semibold text-slate-700">
          {message}
        </p>

        {state === "success" && (
          <p className="text-sm text-slate-500">
            Redirecting you to sign in...
          </p>
        )}

        {state === "error" && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600">
              The verification link may have expired or is invalid. Please try registering again or contact support.
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full cursor-pointer rounded-[1.35rem] bg-[linear-gradient(135deg,#000613_0%,#0b1b33_100%)] py-3 text-lg font-bold text-white shadow-[0_18px_35px_rgba(2,6,23,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(2,6,23,0.25)] active:scale-[0.98]"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};