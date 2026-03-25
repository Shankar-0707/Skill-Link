import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../features/auth/components/AuthLayout";
import { authApi } from "../../features/auth/api/auth";
import { resolveApiErrorMessage } from "../../features/auth/utils/errorMessage";

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
            "Email verified successfully. You can sign in now.",
        );
        window.setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1800);
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
      title="Verify Email"
      subtitle="Securing your Skill-Link account"
    >
      <div className="p-8 md:p-10 space-y-5">
        <p
          className={`rounded-xl px-4 py-4 text-sm font-semibold ${
            state === "success"
              ? "border border-green-300 bg-green-50 text-green-700"
              : state === "error"
                ? "border border-red-300 bg-red-50 text-red-700"
                : "border border-blue-300 bg-blue-50 text-blue-700"
          }`}
        >
          {message}
        </p>

        {state === "error" && (
          <p className="text-sm font-medium text-on-surface-variant">
            Need a fresh link? Go to forgot password or request a new
            verification from your account flow.
          </p>
        )}

        <Link
          to="/login"
          className="block w-full rounded-2xl bg-primary py-4 text-center text-lg font-bold text-on-primary shadow-xl shadow-primary/20 transition-all hover:opacity-90"
        >
          Go To Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};
