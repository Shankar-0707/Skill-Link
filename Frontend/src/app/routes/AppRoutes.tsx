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
import { UserHomePage } from "../../pages/customer/UserHomePage";
import { CreateJobPage } from "../../pages/customer/Createjobpage";
import { MyJobsPage } from "../../pages/customer/MyJobsPage";
import { JobDetailPage } from "../../pages/customer/JobDetailPage";
import { WorkerProfilePage } from "../../pages/customer/WorkerProfilePage";
import { ComingSoonPage } from "../../pages/customer/ComingSoonPage";
import { SettingsPage as CustomerSettingsPage } from "../../pages/customer/SettingsPage";
import { ProductsPage } from "../../pages/customer/ProductsPage";
import { MyReservationsPage } from "../../pages/customer/MyReservationsPage";
// import { WorkerHomePage } from "../../pages/WorkerHomePage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { RoleHomeRedirect } from "./RoleHomeRedirect";
import { RoleRoute } from "./RoleRoute";
import ThemePreview from "../../ThemePreview";
import { WorkerDashboardPage as WorkerDashboard } from "@/pages/worker/WorkerDashboard";
import { AvailableJobsPage as AvailableJobs } from "@/pages/worker/AvailableJobs";
import { MyAssignmentsPage as MyWork } from "@/pages/worker/MyAssignments";
import { WorkerJobDetailPage as WorkerJobDetail } from "@/pages/worker/JobDetail";
import { WorkerSettingsPage as WorkerSettings } from "@/pages/worker/Settings";
import OrganisationSettingsPage from "@/pages/organisation/SettingsPage";
import OrganisationLayout from "@/pages/organisation/OrganisationLayout";
import OrganisationPage from "@/pages/organisation/OrganisationPage";
import SeeAllProductsPage from "@/pages/organisation/SeeAllProductsPage";
import CreateProductPage from "@/pages/organisation/CreateProductPage";
import EditProductPage from "@/pages/organisation/EditProductPage";
import ProductExplorePage from "@/pages/organisation/ProductExplorePage";
import AllReservationsPage from "@/pages/organisation/AllReservationsPage";
import PendingReservationsPage from "@/pages/organisation/PendingReservationsPage";
// import OrganisationSettingsPage from "@/pages/organisation/SettingsPage";
import { AdminLayout } from "@/features/admin/components/layout/AdminLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminJobsPage } from "@/pages/admin/AdminJobsPage";
import { KycManagementPage } from "@/pages/admin/KycManagementPage";


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
          <Route path="/user/home" element={<UserHomePage />} />
          <Route path="/user/create-job" element={<CreateJobPage />} />
          <Route path="/user/my-jobs" element={<MyJobsPage />} />
          <Route path="/user/job-detail/:id" element={<JobDetailPage />} />
          <Route path="/user/worker/:id" element={<WorkerProfilePage />} />
          <Route path="/user/products" element={<ProductsPage />} />
          <Route path="/user/products/reservations" element={<MyReservationsPage />} />
          <Route path="/user/schedule" element={<ComingSoonPage />} />
          <Route path="/user/settings" element={<CustomerSettingsPage />} />
        </Route>

        <Route element={<RoleRoute allowedRole="WORKER" />}>
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/available-jobs" element={<AvailableJobs />} />
          <Route path="/worker/my-assignments" element={<MyWork />} />
          <Route path="/worker/job/:id" element={<WorkerJobDetail />} />
          <Route path="/worker/earnings" element={<ComingSoonPage />} />
          <Route path="/worker/schedule" element={<ComingSoonPage />} />
          <Route path="/worker/settings" element={<WorkerSettings />} />
          <Route path="/worker" element={<Navigate to="/worker/dashboard" replace />} />
        </Route>

        <Route element={<RoleRoute allowedRole="ORGANISATION" />}>
          <Route element={<OrganisationLayout />}>
            <Route path="/organisation" index element={<OrganisationPage />} />
            <Route path="/organisation/settings" element={<OrganisationSettingsPage />} />
            <Route path="/organisation/products/see_all" element={<SeeAllProductsPage />} />
            <Route path="/organisation/products/create" element={<CreateProductPage />} />
            <Route path="/organisation/products/edit/:id" element={<EditProductPage />} />
            <Route path="/organisation/products/:id/explore" element={<ProductExplorePage />} />
            
            {/* Reservations */}
            <Route path="/organisation/reservations/all" element={<AllReservationsPage />} />
            <Route path="/organisation/reservations/pending" element={<PendingReservationsPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRole="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/reservations" element={<ComingSoonPage />} />
            <Route path="/admin/users" element={<ComingSoonPage />} />
            <Route path="/admin/kyc" element={<KycManagementPage />} />
            <Route path="/admin/help" element={<ComingSoonPage />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
      </Route>

      <Route path="/preview" element={<ThemePreview />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
