import React from "react";
import { API_URL } from "../../../services/api/api";
import { cn } from "../../../shared/utils/cn";
import type { Role } from "../types";

type GoogleAuthButtonProps = {
  mode: "login" | "register";
  role?: Role;
  className?: string;
};

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.805 10.023H12v3.955h5.615c-.242 1.273-.968 2.352-2.062 3.078v2.558h3.34c1.957-1.801 3.087-4.455 3.087-7.614 0-.663-.06-1.3-.175-1.977Z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.79 0 5.13-.925 6.84-2.507l-3.34-2.558c-.925.62-2.107.987-3.5.987-2.692 0-4.972-1.817-5.787-4.26H2.76v2.64A10 10 0 0 0 12 22Z"
      fill="#34A853"
    />
    <path
      d="M6.213 13.662A5.996 5.996 0 0 1 5.89 12c0-.576.117-1.13.323-1.662V7.698H2.76A10 10 0 0 0 2 12c0 1.61.386 3.132 1.06 4.302l3.153-2.44Z"
      fill="#FBBC05"
    />
    <path
      d="M12 6.078c1.518 0 2.882.522 3.955 1.548l2.968-2.968C17.125 2.98 14.786 2 12 2A10 10 0 0 0 2.76 7.698l3.453 2.64C7.028 7.895 9.308 6.078 12 6.078Z"
      fill="#EA4335"
    />
  </svg>
);

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode,
  role,
  className,
}) => {
  const handleGoogleAuth = () => {
    const url = new URL(`${API_URL}/auth/google`);

    if (mode === "register" && role) {
      url.searchParams.set("role", role);
    }

    window.location.href = url.toString();
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white px-5 py-4 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-secondary",
        className,
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
        <GoogleIcon />
      </span>
      <span>
        {mode === "login" ? "Continue with Google" : "Sign up with Google"}
      </span>
    </button>
  );
};
