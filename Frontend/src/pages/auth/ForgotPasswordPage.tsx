import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await authApi.forgotPassword(email.trim());
      setSuccessMessage(
        response.message ??
          "If the account exists, a password reset email has been sent.",
      );
      setEmail("");
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="We will email a secure reset link"
    >
      <div className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-on-surface-variant">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your account email"
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
            disabled={isLoading}
            className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-on-primary shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Sending Link..." : "Send Reset Link"}
          </button>

          <p className="pt-2 text-center text-sm font-medium text-on-surface-variant">
            Remembered your password?{" "}
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
