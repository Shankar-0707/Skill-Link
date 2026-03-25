import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/context/useAuth";
import type { User } from "../features/auth/types";
import { getRoleLabel } from "../features/auth/utils/authHelpers";
import { resolveApiErrorMessage } from "../features/auth/utils/errorMessage";

type ActionButton = {
  label: string;
  variant?: "primary" | "secondary";
};

type HomePageLayoutProps = {
  title: string;
  description: string;
  buttons: ActionButton[];
  user: User;
};

export const HomePageLayout: React.FC<HomePageLayoutProps> = ({
  title,
  description,
  buttons,
  user,
}) => {
  const navigate = useNavigate();
  const { logout, deleteAccount } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (logoutError) {
      setError(resolveApiErrorMessage(logoutError, "Logout failed."));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    const shouldDelete = window.confirm(
      "Delete this account? This will deactivate the user in the backend.",
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteAccount();
      navigate("/register", { replace: true });
    } catch (deleteError) {
      setError(
        resolveApiErrorMessage(deleteError, "Could not delete this account."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8 md:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-primary px-6 py-8 text-white shadow-lg md:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
            {getRoleLabel(user)} Home
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium text-white/80 md:text-base">
            {description}
          </p>
          <div className="mt-5 rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white/80">
              Signed in as {user.name || user.email}
            </p>
            <p className="mt-1 text-sm text-white/70">{user.email}</p>
            <p className="mt-1 text-sm text-white/70">
              Email verified: {user.emailVerified ? "Yes" : "No"}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {buttons.map((button) => (
            <button
              key={button.label}
              type="button"
              onClick={() =>
                setMessage(`${button.label} is a placeholder button for now.`)
              }
              className={`rounded-[1.5rem] border px-5 py-5 text-left transition-colors ${
                button.variant === "secondary"
                  ? "border-border bg-secondary text-foreground hover:bg-muted"
                  : "border-primary bg-white text-primary hover:bg-primary hover:text-white"
              }`}
            >
              <p className="text-lg font-bold">{button.label}</p>
              <p className="mt-2 text-sm font-medium opacity-75">
                Static home action wired for layout testing.
              </p>
            </button>
          ))}
        </section>

        {message && (
          <p className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <section className="flex flex-col gap-3 rounded-[2rem] border border-border bg-white p-6 md:flex-row">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut || isDeleting}
            className="rounded-2xl bg-primary px-5 py-4 text-base font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting || isLoggingOut}
            className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-base font-bold text-red-700 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </button>
        </section>
      </div>
    </div>
  );
};
