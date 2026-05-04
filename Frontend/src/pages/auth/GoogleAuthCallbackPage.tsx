import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../../features/auth/components/AuthLayout";
import { useAuth } from "../../app/context/useAuth";
import type { AuthResponse, User } from "../../features/auth/types";
import { getHomeRouteForRole } from "../../features/auth/utils/authHelpers";

function parseUser(rawUser: string | null): User | null {
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(rawUser)) as User;
  } catch {
    return null;
  }
}

export const GoogleAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeAuthSession } = useAuth();
  const [message, setMessage] = useState("Completing Google sign-in...");

  const payload = useMemo(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");
    const user = parseUser(searchParams.get("user"));

    return {
      accessToken,
      refreshToken,
      error,
      user,
    };
  }, [searchParams]);

  useEffect(() => {
    if (payload.error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage(payload.error);
      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
      return;
    }

    if (!payload.accessToken || !payload.refreshToken || !payload.user) {
      setMessage("Google sign-in payload is incomplete. Please try again.");
      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
      return;
    }

    const authResponse: AuthResponse = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: payload.user,
    };

    void completeAuthSession(authResponse).then(() => {
      navigate(getHomeRouteForRole(payload.user!.role), { replace: true });
    });
  }, [completeAuthSession, navigate, payload]);

  return (
    <AuthLayout
      title="Google Sign-In"
      subtitle="Connecting your Skill-Link account"
      showBackButton={false}
    >
      <div className="p-8 md:p-10">
        <p className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-4 text-sm font-semibold text-blue-700">
          {message}
        </p>
      </div>
    </AuthLayout>
  );
};
