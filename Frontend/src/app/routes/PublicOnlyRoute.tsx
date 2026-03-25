import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";
import { getHomeRouteForRole } from "../../features/auth/utils/authHelpers";

export const PublicOnlyRoute: React.FC = () => {
  const { user, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="rounded-3xl border border-border bg-white px-8 py-10 shadow-sm">
          <p className="text-lg font-semibold text-primary">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
};
