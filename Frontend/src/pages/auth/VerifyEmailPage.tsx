import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../features/auth/components/AuthLayout";
import { authApi } from "../../features/auth/api/auth";

type VerifyState = "loading" | "success" | "error";

function resolveErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (Array.isArray(data?.message)) {
      return (
        data.message[0] ?? "Verification failed. Please request a new email."
      );
    }
    if (typeof data?.message === "string") {
      return data.message;
    }
  }

  return "Verification failed. Please request a new email.";
}

export const VerifyEmailPage: React.FC = () => {
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
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setState("error");
        setMessage(resolveErrorMessage(error));
      }
    };

    void runVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

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
