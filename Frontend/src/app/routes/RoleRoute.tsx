import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../../features/auth/types";
import { useAuth } from "../../features/auth/context/useAuth";
import { getHomeRouteForRole } from "../../features/auth/utils/authHelpers";

type RoleRouteProps = {
  allowedRole: Role;
};

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
};
