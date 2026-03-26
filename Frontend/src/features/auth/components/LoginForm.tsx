import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { useAuth } from '../../../app/context/useAuth';
import { getHomeRouteForRole } from '../utils/authHelpers';
import { resolveApiErrorMessage } from '../utils/errorMessage';
import { cn } from '../../../shared/utils/cn';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVerifiedToast, setShowVerifiedToast] = useState(false);
  const [showPasswordResetToast, setShowPasswordResetToast] = useState(false);

  useEffect(() => {
    const emailVerified = (location.state as { emailVerified?: boolean })?.emailVerified;
    const passwordReset = (location.state as { passwordReset?: boolean })?.passwordReset;
    
    if (emailVerified) {
      setShowVerifiedToast(true);
      window.history.replaceState({}, document.title);
      setTimeout(() => setShowVerifiedToast(false), 5000);
    }
    
    if (passwordReset) {
      setShowPasswordResetToast(true);
      window.history.replaceState({}, document.title);
      setTimeout(() => setShowPasswordResetToast(false), 5000);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await login(email.trim(), password);
      const fallbackRoute = getHomeRouteForRole(response.user.role);
      const destination =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? fallbackRoute;

      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(
        resolveApiErrorMessage(error, 'Sign in failed. Please try again.'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showVerifiedToast && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">
            Email verified successfully! You can now sign in.
          </p>
        </div>
      )}

      {showPasswordResetToast && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">
            Password reset successful! You can now sign in.
          </p>
        </div>
      )}

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
            placeholder="Enter your email"
            className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-3 pl-12 pr-4 text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="ml-1 flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">
            Password
          </label>
          <Link 
            to="/forgot-password"
            className="text-xs font-semibold text-primary/80 transition hover:text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
          <input 
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/80 py-3 pl-12 pr-12 text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/10"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:text-primary"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
        disabled={isLoading}
        className={cn(
          "w-full rounded-[1.35rem] bg-[linear-gradient(135deg,#000613_0%,#0b1b33_100%)] py-3 text-lg font-bold text-white shadow-[0_18px_35px_rgba(2,6,23,0.22)] transition-all active:scale-[0.98]",
          isLoading ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(2,6,23,0.25)]"
        )}
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </button>

      <div className="flex items-center gap-4 py-1">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleAuthButton mode="login" />

      <div className="border-t border-slate-200/80 pt-4 text-center">
        <p className="text-sm font-medium text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary transition hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
};
