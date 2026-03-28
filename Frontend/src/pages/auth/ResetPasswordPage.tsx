import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../features/auth/components/AuthLayout";
import { authApi } from "../../features/auth/api/auth";
import { resolveApiErrorMessage } from "../../features/auth/utils/errorMessage";
import { Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "../../shared/utils/cn";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams],
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const missingToken = token.length === 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

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
      await authApi.resetPassword(token, newPassword);
      navigate('/login', { 
        replace: true,
        state: { passwordReset: true }
      });
    } catch (error) {
      setErrorMessage(
        resolveApiErrorMessage(error, "Password reset failed. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Choose a strong new password"
      showBackButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="ml-1 text-xs font-semibold text-slate-700">
            New Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
            <input
              type={showNewPassword ? "text" : "password"}
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-3 pl-12 pr-12 text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
            <button 
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-slate-400 transition-colors hover:text-primary"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-xs font-semibold text-slate-700">
            Confirm Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-3 pl-12 pr-12 text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-slate-400 transition-colors hover:text-primary"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || missingToken}
          className={cn(
            "w-full cursor-pointer rounded-[1.35rem] bg-[linear-gradient(135deg,#000613_0%,#0b1b33_100%)] py-3 text-lg font-bold text-white shadow-[0_18px_35px_rgba(2,6,23,0.22)] transition-all active:scale-[0.98]",
            isLoading || missingToken ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(2,6,23,0.25)]"
          )}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="border-t border-slate-200/80 pt-4 text-center">
          <p className="text-sm font-medium text-slate-500">
            Back to{' '}
            <Link to="/login" className="font-bold text-primary transition hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
