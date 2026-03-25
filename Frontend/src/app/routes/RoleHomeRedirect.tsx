import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";
import { getHomeRouteForRole } from "../../features/auth/utils/authHelpers";

export const RoleHomeRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomeRouteForRole(user.role)} replace />;
};
