import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../features/auth/components/AuthLayout";
import { authApi } from "../../features/auth/api/auth";

function resolveErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (Array.isArray(data?.message)) {
      return data.message[0] ?? "Request failed. Please try again.";
    }
    if (typeof data?.message === "string") {
      return data.message;
    }
  }

  return "Request failed. Please try again.";
}

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams],
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const missingToken = token.length === 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (missingToken) {
      setErrorMessage(
        "Reset token is missing from the URL. Please use the link from your email.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.resetPassword(token, newPassword);
      setSuccessMessage(
        response.message ?? "Password reset successful. You can sign in now.",
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a strong new password">
      <div className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-on-surface-variant">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-2xl border border-border bg-secondary-container px-4 py-4 font-medium text-on-surface outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-on-surface-variant">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-2xl border border-border bg-secondary-container px-4 py-4 font-medium text-on-surface outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || missingToken}
            className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-on-primary shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          <p className="pt-2 text-center text-sm font-medium text-on-surface-variant">
            Back to{" "}
            <Link
              to="/login"
              className="font-bold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};
