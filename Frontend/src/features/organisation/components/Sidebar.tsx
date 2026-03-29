import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  Building2,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../app/context/useAuth";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "../../../shared/utils/cn";

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
      "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative",
      isActive 
        ? "bg-primary/10 text-primary font-medium" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      isCollapsed ? "justify-center px-0 w-12 mx-auto" : "justify-between"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={cn("shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
      {!isCollapsed && <span className="text-sm truncate">{label}</span>}
    </div>
    {!isCollapsed && isActive && <ChevronRight size={14} className="text-primary shrink-0" />}
    
    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [isReservationsOpen, setIsReservationsOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const organisationName = user?.organisation?.businessName || "Organisation";
  const organisationType = user?.organisation?.businessType || "Business Dashboard";

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 bg-white border-r border-border flex flex-col p-4 shadow-sm transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm z-50"
      >
        {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>

      {/* Logo & Header */}
      <div className={cn(
        "flex items-center gap-3 mb-10 px-2 transition-all duration-300",
        isCollapsed ? "justify-center" : ""
      )}>
        <div className="w-10 h-10 bg-primary rounded-xl shrink-0 flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Building2 size={22} />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden transition-all duration-300 opacity-100 scale-100 origin-left">
            <h1 className="font-bold text-lg leading-tight tracking-tight text-foreground truncate max-w-[160px]">
              {organisationName}
            </h1>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">
              {organisationType}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-4 mb-3 transition-opacity duration-300">
            Main Menu
          </p>
        )}
        
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          href="/organisation" 
          isActive={location.pathname === "/organisation"}
          isCollapsed={isCollapsed}
        />

        {/* Reservations Section with Dropdown */}
        <div className="space-y-1">
          <button
            onClick={() => !isCollapsed && setIsReservationsOpen(!isReservationsOpen)}
            className={cn(
              "w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative",
              location.pathname.startsWith("/organisation/reservations") 
                ? "bg-primary/5 text-primary font-medium" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              isCollapsed ? "justify-center px-0 w-12 mx-auto" : "justify-between"
            )}
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={20} className={cn("shrink-0 transition-colors", location.pathname.startsWith("/organisation/reservations") ? "text-primary" : "group-hover:text-foreground")} />
              {!isCollapsed && <span className="text-sm truncate">Reservations</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight 
                size={14} 
                className={cn(
                  "transition-transform duration-200",
                  isReservationsOpen ? "rotate-90 text-primary" : "text-muted-foreground"
                )} 
              />
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Reservations
              </div>
            )}
          </button>

          {!isCollapsed && isReservationsOpen && (
            <div className="pl-11 pr-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
              <Link
                to="/organisation/reservations/all"
                className={cn(
                  "block px-4 py-2 text-xs rounded-lg transition-all",
                  location.pathname === "/organisation/reservations/all"
                    ? "text-primary font-bold bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                All Reservations
              </Link>
              <Link
                to="/organisation/reservations/pending"
                className={cn(
                  "block px-4 py-2 text-xs rounded-lg transition-all",
                  location.pathname === "/organisation/reservations/pending"
                    ? "text-primary font-bold bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                Pending Reservations
              </Link>
            </div>
          )}
        </div>

        {/* Products Section with Dropdown */}
        <div className="space-y-1">
          <button
            onClick={() => !isCollapsed && setIsProductsOpen(!isProductsOpen)}
            className={cn(
              "w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative",
              location.pathname.startsWith("/organisation/products") 
                ? "bg-primary/5 text-primary font-medium" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              isCollapsed ? "justify-center px-0 w-12 mx-auto" : "justify-between"
            )}
          >
            <div className="flex items-center gap-3">
              <Package size={20} className={cn("shrink-0 transition-colors", location.pathname.startsWith("/organisation/products") ? "text-primary" : "group-hover:text-foreground")} />
              {!isCollapsed && <span className="text-sm truncate">Products</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight 
                size={14} 
                className={cn(
                  "transition-transform duration-200",
                  isProductsOpen ? "rotate-90 text-primary" : "text-muted-foreground"
                )} 
              />
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Products
              </div>
            )}
          </button>

          {!isCollapsed && isProductsOpen && (
            <div className="pl-11 pr-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
              <Link
                to="/organisation/products/see_all"
                className={cn(
                  "block px-4 py-2 text-xs rounded-lg transition-all",
                  location.pathname === "/organisation/products/see_all"
                    ? "text-primary font-bold bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                See all products
              </Link>
              <Link
                to="/organisation/products/create"
                className={cn(
                  "block px-4 py-2 text-xs rounded-lg transition-all",
                  location.pathname === "/organisation/products/create"
                    ? "text-primary font-bold bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                Create a product
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className={cn(
        "mt-auto space-y-2 pt-6 border-t border-border transition-all duration-300",
        isCollapsed ? "items-center" : ""
      )}>
        <SidebarItem 
          icon={Settings} 
          label="Settings" 
          href="/organisation/settings" 
          isActive={location.pathname === "/organisation/settings"}
          isCollapsed={isCollapsed}
        />
        <Button
          variant="ghost"
          onClick={() => logout()}
          className={cn(
            "w-full justify-start gap-3 px-4 py-6 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all group relative",
            isCollapsed ? "px-0 justify-center w-12 mx-auto" : ""
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </Button>
      </div>
    </aside>
  );
};
