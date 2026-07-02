import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

/**
 * Global rate-limit banner.
 * Listens for the 'auth:rate-limited' custom event dispatched by the API
 * interceptor and shows an amber toast with a live countdown timer.
 * Auto-dismisses when the countdown reaches zero.
 */
export const RateLimitBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleRateLimit = (e: Event) => {
      const { retryAfter, message: msg } = (
        e as CustomEvent<{ retryAfter: number; message: string }>
      ).detail;

      setMessage(msg);
      setCountdown(retryAfter);
      setVisible(true);

      // Clear any existing countdown interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setVisible(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    window.addEventListener('auth:rate-limited', handleRateLimit);
    return () => {
      window.removeEventListener('auth:rate-limited', handleRateLimit);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4"
      style={{ animation: 'slideDown 0.3s ease' }}
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 shadow-lg shadow-amber-100">
        <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-800">Too Many Requests</p>
          <p className="text-sm text-amber-700 mt-0.5">{message}</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold tabular-nums text-amber-800">
          {countdown}s
        </span>
      </div>
    </div>
  );
};
