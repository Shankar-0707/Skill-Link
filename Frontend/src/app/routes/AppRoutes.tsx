import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LandingPage } from "../../pages/landing/LandingPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { RegisterPage } from "../../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../../pages/auth/ForgotPasswordPage";
import { GoogleAuthCallbackPage } from "../../pages/auth/GoogleAuthCallbackPage";
import { ResetPasswordPage } from "../../pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "../../pages/auth/VerifyEmailPage";
import { CheckEmailPage } from "../../pages/auth/CheckEmailPage";
import { CheckResetEmailPage } from "../../pages/auth/CheckResetEmailPage";
import { AccountSuspendedPage } from "../../pages/auth/AccountSuspendedPage";
import { UserHomePage } from "../../pages/customer/UserHomePage";
import { CreateJobPage } from "../../pages/customer/Createjobpage";
import { MyJobsPage } from "../../pages/customer/MyJobsPage";
import { JobDetailPage } from "../../pages/customer/JobDetailPage";
import { WorkerProfilePage } from "../../pages/customer/WorkerProfilePage";
import { ComingSoonPage } from "../../pages/customer/ComingSoonPage";
import { SettingsPage as CustomerSettingsPage } from "../../pages/customer/SettingsPage";
import { HelpPage } from "../../pages/customer/HelpPage";
import { ProductsPage } from "../../pages/customer/ProductsPage";
import { MyReservationsPage } from "../../pages/customer/MyReservationsPage";
import { CustomerHelpCenterPage } from "../../pages/customer/HelpCenterPage";
import { CustomerHelpTicketPage } from "../../pages/customer/HelpTicketPage";
import { MyWalletPage } from "../../pages/customer/MyWalletPage";
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
import { WorkerHelpCenterPage } from "@/pages/worker/HelpCenterPage";
import { WorkerHelpTicketPage } from "@/pages/worker/HelpTicketPage";
import { WorkerWalletPage } from "@/pages/worker/WorkerWalletPage";
import OrganisationSettingsPage from "@/pages/organisation/SettingsPage";
import OrganisationLayout from "@/pages/organisation/OrganisationLayout";
import OrganisationPage from "@/pages/organisation/OrganisationPage";
import SeeAllProductsPage from "@/pages/organisation/SeeAllProductsPage";
import CreateProductPage from "@/pages/organisation/CreateProductPage";
import EditProductPage from "@/pages/organisation/EditProductPage";
import ProductExplorePage from "@/pages/organisation/ProductExplorePage";
import AllReservationsPage from "@/pages/organisation/AllReservationsPage";
import PendingReservationsPage from "@/pages/organisation/PendingReservationsPage";
import OrganisationHelpCenterPage from "@/pages/organisation/HelpCenterPage";
import OrganisationHelpTicketPage from "@/pages/organisation/HelpTicketPage";
import ReservationDetailPage from "@/pages/organisation/ReservationDetailPage";
import OrganisationWalletPage from "@/pages/organisation/OrganisationWalletPage";
import { AdminLayout } from "@/features/admin/components/layout/AdminLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminJobsPage } from "@/pages/admin/AdminJobsPage";
import { AdminReservationsPage } from "@/pages/admin/AdminReservationsPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { KycManagementPage } from "@/pages/admin/KycManagementPage";
import { AdminHelpCenterPage } from "@/pages/admin/AdminHelpCenterPage";
import { AdminHelpTicketPage } from "@/pages/admin/AdminHelpTicketPage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminEscrowControlPage } from "@/pages/admin/AdminEscrowControlPage";
import { AdminWalletPage } from "@/pages/admin/AdminWalletPage";

const SuspendedNavigationHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSuspended = () => {
      navigate("/account-suspended", { replace: true });
    };

    window.addEventListener("auth:suspended", handleSuspended);

    return () => {
      window.removeEventListener("auth:suspended", handleSuspended);
    };
  }, [navigate]);

  return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <>
      <SuspendedNavigationHandler />
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
          <Route path="/account-suspended" element={<AccountSuspendedPage />} />
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
            <Route
              path="/user/products/reservations"
              element={<MyReservationsPage />}
            />
            <Route path="/user/wallet" element={<MyWalletPage />} />
            <Route path="/user/help" element={<CustomerHelpCenterPage />} />
            <Route
              path="/user/help/ticket"
              element={<CustomerHelpTicketPage />}
            />
            <Route path="/user/help/legacy" element={<HelpPage />} />
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
            <Route path="/worker/wallet" element={<WorkerWalletPage />} />
            <Route path="/worker/help" element={<WorkerHelpCenterPage />} />
            <Route
              path="/worker/help/ticket"
              element={<WorkerHelpTicketPage />}
            />
            <Route path="/worker/settings" element={<WorkerSettings />} />
            <Route
              path="/worker"
              element={<Navigate to="/worker/dashboard" replace />}
            />
          </Route>

          <Route element={<RoleRoute allowedRole="ORGANISATION" />}>
            <Route element={<OrganisationLayout />}>
              <Route
                path="/organisation"
                index
                element={<OrganisationPage />}
              />
              <Route
                path="/organisation/settings"
                element={<OrganisationSettingsPage />}
              />
              <Route
                path="/organisation/products/see_all"
                element={<SeeAllProductsPage />}
              />
              <Route
                path="/organisation/products/create"
                element={<CreateProductPage />}
              />
              <Route
                path="/organisation/products/edit/:id"
                element={<EditProductPage />}
              />
              <Route
                path="/organisation/products/:id/explore"
                element={<ProductExplorePage />}
              />
              <Route
                path="/organisation/help"
                element={<OrganisationHelpCenterPage />}
              />
              <Route
                path="/organisation/help/ticket"
                element={<OrganisationHelpTicketPage />}
              />
              <Route
                path="/organisation/wallet"
                element={<OrganisationWalletPage />}
              />
              <Route
                path="/organisation/reservations/all"
                element={<AllReservationsPage />}
              />
              <Route
                path="/organisation/reservations/pending"
                element={<PendingReservationsPage />}
              />
              <Route
                path="/organisation/reservations/:id"
                element={<ReservationDetailPage />}
              />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRole="ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/jobs" element={<AdminJobsPage />} />
              <Route
                path="/admin/reservations"
                element={<AdminReservationsPage />}
              />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/kyc" element={<KycManagementPage />} />
              <Route
                path="/admin/escrows"
                element={<AdminEscrowControlPage />}
              />
              <Route path="/admin/help" element={<AdminHelpCenterPage />} />
              <Route
                path="/admin/help/:ticketId"
                element={<AdminHelpTicketPage />}
              />
              <Route path="/admin/wallet" element={<AdminWalletPage />} />
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="/preview" element={<ThemePreview />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<Navigate to="/#about" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};
