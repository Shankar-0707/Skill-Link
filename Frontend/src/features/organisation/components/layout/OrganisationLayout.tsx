import { Building2, ClipboardList, HelpCircle, LayoutDashboard, LogOut, Package, Wallet } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/context/useAuth";
import { Sidebar } from "@/features/organisation/components/Sidebar";

export const OrganisationLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <main className="w-full flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <button
        type="button"
        onClick={() => navigate("/organisation/help")}
        className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_14px_32px_rgba(15,23,42,0.22)] lg:hidden"
        aria-label="Open help center"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-white/95 px-1.5 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        {[
          { label: "Home", icon: LayoutDashboard, path: "/organisation" },
          { label: "Wallet", icon: Wallet, path: "/organisation/wallet" },
          {
            label: "Products",
            icon: Package,
            path: "/organisation/products/see_all",
          },
          {
            label: "Reserve",
            icon: ClipboardList,
            path: "/organisation/reservations/all",
          },
          { label: "Settings", icon: Building2, path: "/organisation/settings" },
        ].map(({ label, icon: Icon, path }) => {
          const isActive =
            location.pathname === path ||
            (path.includes("/products") &&
              location.pathname.startsWith("/organisation/products")) ||
            (path.includes("/reservations") &&
              location.pathname.startsWith("/organisation/reservations"));

          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold ${
                isActive ? "bg-primary text-white" : "text-muted-foreground"
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
