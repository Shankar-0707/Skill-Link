

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../../pages/auth/LoginPage";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../../pages/auth/ForgotPasswordPage";
import { GoogleAuthCallbackPage } from "../../pages/auth/GoogleAuthCallbackPage";
import { ResetPasswordPage } from "../../pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "../../pages/auth/VerifyEmailPage";
import { CheckEmailPage } from "../../pages/auth/CheckEmailPage";
import { CheckResetEmailPage } from "../../pages/auth/CheckResetEmailPage";
// import { OrganisationHomePage } from "../../pages/OrganisationHomePage";
// import { UserHomePage } from "../../pages/UserHomePage";
// import { WorkerHomePage } from "../../pages/WorkerHomePage";
// import { OrganisationHomePage } from "../../pages/OrganisationHomePage";
import OrganisationPage from "@/pages/organisation/OrganisationPage";
import SettingsPage from "@/pages/organisation/SettingsPage";
import SeeAllProductsPage from "@/pages/organisation/SeeAllProductsPage";
import CreateProductPage from "@/pages/organisation/CreateProductPage";
import EditProductPage from "@/pages/organisation/EditProductPage";
import ProductExplorePage from "@/pages/organisation/ProductExplorePage";
import AllReservationsPage from "@/pages/organisation/AllReservationsPage";
import PendingReservationsPage from "@/pages/organisation/PendingReservationsPage";
import OrganisationLayout from "@/pages/organisation/OrganisationLayout";
// import { UserHomePage } from "../../pages/UserHomePage";
// import { WorkerHomePage } from "../../pages/WorkerHomePage";
import CustomerPage from "@/pages/customer/CustomerPage";
import WorkerPage from "@/pages/worker/WorkerPage";
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
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/check-reset-email" element={<CheckResetEmailPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<RoleHomeRedirect />} />

        <Route element={<RoleRoute allowedRole="CUSTOMER" />}>
          <Route path="/customer" element={<CustomerPage />} />
        </Route>

        <Route element={<RoleRoute allowedRole="WORKER" />}>
          <Route path="/worker" element={<WorkerPage />} />
        </Route>

        <Route element={<RoleRoute allowedRole="ORGANISATION" />}>
          <Route element={<OrganisationLayout />}>
            <Route path="/organisation" index element={<OrganisationPage />} />
            <Route path="/organisation/settings" element={<SettingsPage />} />
            <Route path="/organisation/products/see_all" element={<SeeAllProductsPage />} />
            <Route path="/organisation/products/create" element={<CreateProductPage />} />
            <Route path="/organisation/products/edit/:id" element={<EditProductPage />} />
            <Route path="/organisation/products/:id/explore" element={<ProductExplorePage />} />
            
            {/* Reservations */}
            <Route path="/organisation/reservations/all" element={<AllReservationsPage />} />
            <Route path="/organisation/reservations/pending" element={<PendingReservationsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/preview" element={<ThemePreview />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
