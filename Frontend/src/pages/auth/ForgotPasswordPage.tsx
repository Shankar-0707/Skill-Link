import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../features/auth/components/AuthLayout";
import { authApi } from "../../features/auth/api/auth";
import { resolveApiErrorMessage } from "../../features/auth/utils/errorMessage";
import { Mail } from "lucide-react";
import { cn } from "../../shared/utils/cn";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authApi.forgotPassword(email.trim());
      navigate('/check-reset-email', { 
        state: { email: email.trim() },
        replace: true 
      });
    } catch (error) {
      setErrorMessage(
        resolveApiErrorMessage(error, "Request failed. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="We will email a secure reset link"
      showBackButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="ml-1 text-xs font-semibold text-slate-700">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your account email"
              className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-3 pl-12 pr-4 text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full cursor-pointer rounded-[1.35rem] bg-[linear-gradient(135deg,#000613_0%,#0b1b33_100%)] py-3 text-lg font-bold text-white shadow-[0_18px_35px_rgba(2,6,23,0.22)] transition-all active:scale-[0.98]",
            isLoading ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(2,6,23,0.25)]"
          )}
        >
          {isLoading ? "Sending Link..." : "Send Reset Link"}
        </button>

        <div className="border-t border-slate-200/80 pt-4 text-center">
          <p className="text-sm font-medium text-slate-500">
            Remembered your password?{' '}
            <Link to="/login" className="font-bold text-primary transition hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
