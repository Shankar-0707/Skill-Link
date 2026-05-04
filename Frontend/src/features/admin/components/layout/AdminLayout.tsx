import { useEffect, useState } from "react";
import { BarChart3, Briefcase, LayoutDashboard, LogOut, ShieldCheck, Users } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/context/useAuth";
import { AdminSidebar } from "./AdminSidebar";

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    return saved === "true";
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((current) => !current)}
      />
      <main
        className={
          isCollapsed
            ? "min-h-screen md:ml-20"
            : "min-h-screen md:ml-[200px]"
        }
      >
        <div className="p-4 pb-24 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-background/95 px-1.5 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        {[
          { label: "Home", icon: LayoutDashboard, path: "/admin/dashboard" },
          { label: "Jobs", icon: Briefcase, path: "/admin/jobs" },
          { label: "Users", icon: Users, path: "/admin/users" },
          { label: "KYC", icon: ShieldCheck, path: "/admin/kyc" },
          { label: "Stats", icon: BarChart3, path: "/admin/analytics" },
        ].map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname.startsWith(path);

          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="max-w-full truncate">{label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="max-w-full truncate">Logout</span>
        </button>
      </nav>
    </div>
  );
};
