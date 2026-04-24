import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Settings,
  HelpCircle,
  LogOut,
  Building2,
  ChevronRight,
  ClipboardList,
  Wallet,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/context/useAuth";
import { cn } from "@/shared/utils/cn";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  isActive,
}) => (
  <Link
    to={href}
    className={cn(
      "flex items-center px-4 py-3 transition-colors duration-200 group relative gap-3",
      isActive
        ? "text-primary font-bold border-r-4 border-primary translate-x-1"
        : "text-muted-foreground hover:text-primary hover:bg-secondary/50",
    )}
  >
    <Icon
      size={20}
      className={cn(
        "shrink-0 transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground group-hover:text-primary",
      )}
    />
    <span className="text-xs font-semibold tracking-wider uppercase">
      {label}
    </span>
  </Link>
);

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [isReservationsOpen, setIsReservationsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-white border-r border-border flex flex-col pt-8 pb-4 transition-all duration-300 ease-in-out z-40 shrink-0 overflow-hidden",
        "w-60",
      )}
    >
      {/* Logo & Header */}
      <div
        className={cn("flex flex-col mb-10 transition-all duration-300 px-6")}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl shrink-0 flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Building2 size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tighter text-foreground leading-none">
              Skill-Link
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-primary mt-1">
              Hyperlocal Portal
            </span>
          </div>
        </div>
        {user?.organisation && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs font-bold text-foreground truncate">
              {user.organisation.businessName}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest truncate">
              {user.organisation.businessType}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <SidebarItem
          icon={LayoutDashboard}
          label="Dashboard"
          href="/organisation"
          isActive={location.pathname === "/organisation"}
        />

        <SidebarItem
          icon={Wallet}
          label="Wallet"
          href="/organisation/wallet"
          isActive={location.pathname === "/organisation/wallet"}
        />

        {/* Reservations Section with Dropdown */}
        <div className="space-y-1">
          <button
            onClick={() => setIsReservationsOpen(!isReservationsOpen)}
            className={cn(
              "w-full flex items-center px-4 py-3 transition-colors duration-200 group relative",
              location.pathname.startsWith("/organisation/reservations")
                ? "text-primary font-bold border-r-4 border-primary translate-x-1"
                : "text-muted-foreground hover:bg-secondary/50",
              "justify-between",
            )}
          >
            <div className="flex items-center gap-3">
              <ClipboardList
                size={20}
                className={cn(
                  "shrink-0 transition-colors",
                  location.pathname.startsWith("/organisation/reservations")
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary",
                )}
              />
              <span className="text-xs font-semibold tracking-wider uppercase group-hover:text-primary transition-colors">
                Reservations
              </span>
            </div>
            <ChevronRight
              size={14}
              className={cn(
                "transition-transform duration-200",
                isReservationsOpen
                  ? "rotate-90 text-primary"
                  : "text-muted-foreground group-hover:text-primary",
              )}
            />
          </button>

          {isReservationsOpen && (
            <div className="pl-11 pr-4 space-y-1 py-1 animate-in slide-in-from-top-1 duration-200">
              <Link
                to="/organisation/reservations/all"
                className={cn(
                  "block px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                  location.pathname === "/organisation/reservations/all"
                    ? "text-primary bg-primary/5 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent",
                )}
              >
                All
              </Link>
              <Link
                to="/organisation/reservations/pending"
                className={cn(
                  "block px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                  location.pathname === "/organisation/reservations/pending"
                    ? "text-primary bg-primary/5 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent",
                )}
              >
                Pending
              </Link>
            </div>
          )}
        </div>

        {/* Products Section with Dropdown */}
        <div className="space-y-1">
          <button
            onClick={() => setIsProductsOpen(!isProductsOpen)}
            className={cn(
              "w-full flex items-center px-4 py-3 transition-colors duration-200 group relative",
              location.pathname.startsWith("/organisation/products")
                ? "text-primary font-bold border-r-4 border-primary translate-x-1"
                : "text-muted-foreground hover:bg-secondary/50",
              "justify-between",
            )}
          >
            <div className="flex items-center gap-3">
              <Package
                size={20}
                className={cn(
                  "shrink-0 transition-colors",
                  location.pathname.startsWith("/organisation/products")
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary",
                )}
              />
              <span className="text-xs font-semibold tracking-wider uppercase group-hover:text-primary transition-colors">
                Products
              </span>
            </div>
            <ChevronRight
              size={14}
              className={cn(
                "transition-transform duration-200",
                isProductsOpen
                  ? "rotate-90 text-primary"
                  : "text-muted-foreground group-hover:text-primary",
              )}
            />
          </button>

          {isProductsOpen && (
            <div className="pl-11 pr-4 space-y-1 py-1 animate-in slide-in-from-top-1 duration-200">
              <Link
                to="/organisation/products/see_all"
                className={cn(
                  "block px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                  location.pathname === "/organisation/products/see_all"
                    ? "text-primary bg-primary/5 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent",
                )}
              >
                See all
              </Link>
              <Link
                to="/organisation/products/create"
                className={cn(
                  "block px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                  location.pathname === "/organisation/products/create"
                    ? "text-primary bg-primary/5 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent",
                )}
              >
                Create
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div
        className={cn(
          "mt-auto pt-6 border-t border-border/50 transition-all duration-300 space-y-1",
          "px-0",
        )}
      >
        <div className="px-6 mb-4">
          <button
            onClick={() =>
              (window.location.href = "/organisation/products/create")
            }
            className="w-full bg-primary text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Post New Listing
          </button>
        </div>
        <SidebarItem
          icon={HelpCircle}
          label="Help Center"
          href="/organisation/help"
          isActive={location.pathname.startsWith("/organisation/help")}
        />
        <SidebarItem
          icon={Settings}
          label="Settings"
          href="/organisation/settings"
          isActive={location.pathname === "/organisation/settings"}
        />
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "w-full flex items-center px-4 py-3 transition-colors duration-200 group relative text-muted-foreground hover:text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60",
            "gap-3",
          )}
        >
          <LogOut size={20} className="shrink-0 transition-colors" />
          <span className="text-xs font-semibold tracking-wider uppercase">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
};
