import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <GoogleAuthButton mode="login" />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">
          Or
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-on-surface-variant ml-1">
          Email Address
        </label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input 
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary-container border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-on-surface"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center ml-1">
          <label className="text-sm font-bold text-on-surface-variant">
            Password
          </label>
          <Link 
            to="/forgot-password"
            className="text-xs font-bold text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input 
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-secondary-container border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-on-surface"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]",
          isLoading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
        )}
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </button>

      <div className="text-center pt-4">
        <p className="text-sm text-on-surface-variant font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
};
