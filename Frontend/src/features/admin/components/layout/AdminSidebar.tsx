import React from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  CalendarCheck, 
  Users, 
  BarChart3,
  HelpCircle,
  LogOut, 
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
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
      "flex items-center transition-all duration-150 group relative rounded-lg text-sm font-label font-medium",
      isActive 
        ? "bg-foreground text-background shadow-sm" 
        : "text-muted-foreground hover:bg-surface-container hover:text-foreground",
      isCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2.5"
    )}
  >
    <Icon size={18} className={cn("shrink-0 transition-colors", isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground")} />
    {!isCollapsed && <span>{label}</span>}
    
    {isCollapsed && (
      <div className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggle,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r border-border flex flex-col transition-all duration-300 ease-in-out z-20",
        "overflow-hidden",
        isCollapsed ? "w-20" : "w-[200px]"
      )}
      >
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-5 z-30 w-8 h-8 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-container transition-all",
          isCollapsed ? "left-1/2 -translate-x-1/2" : "right-3"
        )}
      >
        {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>

      <div className={cn(
        "px-5 py-5 border-b border-border",
        isCollapsed ? "px-3 pt-16" : "pt-16"
      )}>
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-2.5")}>
            <div className="w-8 h-8 bg-foreground rounded-lg shrink-0 flex items-center justify-center text-background">
              <Zap className="w-4 h-4" fill="currentColor" />
            </div>
            {!isCollapsed && (
            <div className="flex flex-col">
                <h1 className="font-headline font-bold text-sm text-foreground leading-tight">
                  Skill-Link
                </h1>
                <span className="text-[9px] text-muted-foreground tracking-widest uppercase font-label">
                  Admin Console
                </span>
            </div>
            )}
        </div>
        {!isCollapsed && user && (
             <div className="mt-4 pt-4 border-t border-border">
                 <p className="text-xs font-label font-semibold text-foreground truncate">Master Admin</p>
                 <p className="text-[10px] font-body text-muted-foreground uppercase tracking-widest truncate">{user.email}</p>
             </div>
        )}
      </div>

      <nav className={cn("flex-1 py-4", isCollapsed ? "px-2" : "px-3")}>
        <div className="flex flex-col gap-1">
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
          icon={BarChart3} 
          label="Analytics" 
          href="/admin/analytics" 
          isActive={location.pathname.startsWith("/admin/analytics")}
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={ShieldCheck} 
          label="KYC Approvals" 
          href="/admin/kyc" 
          isActive={location.pathname.startsWith("/admin/kyc")}
          isCollapsed={isCollapsed}
        />
        </div>
      </nav>

      <div className={cn("mt-auto pb-5 pt-3 border-t border-border", isCollapsed ? "px-2" : "px-3")}>
        <div className="flex flex-col gap-1">
        <SidebarItem 
          icon={HelpCircle} 
          label="Help Center" 
          href="/admin/help" 
          isActive={location.pathname.startsWith("/admin/help")}
          isCollapsed={isCollapsed}
        />
        <button
          onClick={() => logout()}
          className={cn(
            "w-full flex items-center rounded-lg text-sm font-label font-medium transition-all duration-150 group relative text-muted-foreground hover:text-red-600 hover:bg-red-50",
            isCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut size={18} className="shrink-0 transition-colors" />
          {!isCollapsed && <span>Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
        </div>
      </div>
    </aside>
  );
};
