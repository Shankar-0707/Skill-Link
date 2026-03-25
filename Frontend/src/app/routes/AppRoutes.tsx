

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../../pages/auth/LoginPage";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../../pages/auth/ForgotPasswordPage";
import { GoogleAuthCallbackPage } from "../../pages/auth/GoogleAuthCallbackPage";
import { ResetPasswordPage } from "../../pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "../../pages/auth/VerifyEmailPage";
import { OrganisationHomePage } from "../../pages/OrganisationHomePage";
import { UserHomePage } from "../../pages/UserHomePage";
import { WorkerHomePage } from "../../pages/WorkerHomePage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { RoleHomeRedirect } from "./RoleHomeRedirect";
import { RoleRoute } from "./RoleRoute";
import ThemePreview from "../../ThemePreview";


export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/auth/google/callback"
          element={<GoogleAuthCallbackPage />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<RoleHomeRedirect />} />

        <Route element={<RoleRoute allowedRole="CUSTOMER" />}>
          <Route path="/user/home" element={<UserHomePage />} />
        </Route>

        <Route element={<RoleRoute allowedRole="WORKER" />}>
          <Route path="/worker/home" element={<WorkerHomePage />} />
        </Route>

        <Route element={<RoleRoute allowedRole="ORGANISATION" />}>
          <Route path="/organisation/home" element={<OrganisationHomePage />} />
        </Route>
      </Route>

      <Route path="/preview" element={<ThemePreview />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
