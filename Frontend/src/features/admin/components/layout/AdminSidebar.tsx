import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  CalendarCheck, 
  Users, 
  HelpCircle,
  LogOut, 
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/app/context/useAuth";
import { cn } from "@/shared/utils/cn";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, href, isActive, isCollapsed }) => (
  <Link
    to={href}
    title={isCollapsed ? label : undefined}
    className={cn(
      "flex items-center px-4 py-3 transition-colors duration-200 group relative",
      isActive 
        ? "text-primary font-bold border-r-4 border-primary translate-x-1" 
        : "text-muted-foreground hover:text-primary hover:bg-secondary/20",
      isCollapsed ? "justify-center px-0 w-12 mx-auto border-r-0" : "gap-3"
    )}
  >
    <Icon size={20} className={cn("shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
    {!isCollapsed && <span className="text-xs font-semibold tracking-wider uppercase">{label}</span>}
    
    {isCollapsed && (
      <div className="absolute left-full ml-4 px-2 py-1 bg-[#001F3F] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 bg-[#f2f4f6] flex flex-col pt-8 pb-4 transition-all duration-300 ease-in-out z-40 shrink-0 overflow-hidden",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-sm z-50"
      >
        {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>

      {/* Logo & Header */}
      <div className={cn(
        "flex flex-col mb-10 transition-all duration-300 px-6",
        isCollapsed ? "items-center px-2" : ""
      )}>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#001F3F] rounded-xl shrink-0 flex items-center justify-center text-white shadow-md shadow-[#001F3F]/20">
              <ShieldCheck size={22} />
            </div>
            {!isCollapsed && (
            <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tighter text-foreground leading-none">
                  Skill-Link
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-primary mt-1">
                  Admin Console
                </span>
            </div>
            )}
        </div>
        {!isCollapsed && user && (
             <div className="mt-4 pt-4 border-t border-border/20">
                 <p className="text-xs font-bold text-foreground truncate">Master Admin</p>
                 <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest truncate">{user.email}</p>
             </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          href="/admin/dashboard" 
          isActive={location.pathname === "/admin/dashboard"}
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Briefcase} 
          label="Jobs" 
          href="/admin/jobs" 
          isActive={location.pathname.startsWith("/admin/jobs")}
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={CalendarCheck} 
          label="Reservations" 
          href="/admin/reservations" 
          isActive={location.pathname.startsWith("/admin/reservations")}
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={Users} 
          label="Users" 
          href="/admin/users" 
          isActive={location.pathname.startsWith("/admin/users")}
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={ShieldCheck} 
          label="KYC Approvals" 
          href="/admin/kyc" 
          isActive={location.pathname.startsWith("/admin/kyc")}
          isCollapsed={isCollapsed}
        />
      </nav>

      <div className="mt-auto pt-6 border-t border-border/20 space-y-1">
        <SidebarItem 
          icon={HelpCircle} 
          label="Help Center" 
          href="/admin/help" 
          isActive={location.pathname === "/admin/help"}
          isCollapsed={isCollapsed}
        />
        <button
          onClick={() => logout()}
          className={cn(
            "w-full flex items-center px-4 py-3 transition-colors duration-200 group relative text-muted-foreground hover:text-red-500 hover:bg-red-50",
            isCollapsed ? "justify-center px-0 w-12 mx-auto" : "gap-3"
          )}
        >
          <LogOut size={20} className="shrink-0 transition-colors" />
          {!isCollapsed && <span className="text-xs font-semibold tracking-wider uppercase">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
