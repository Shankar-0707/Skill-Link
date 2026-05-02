import React, { useState } from 'react';
import { Briefcase, HelpCircle, Home, LogOut, Package, ShoppingBag, Wallet } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../../../app/context/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Browse');

  if (!user) return null;

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar user={user} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="min-h-screen pt-[64px] md:ml-[200px]">
        <div className="p-4 pb-24 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
      <button
        type="button"
        onClick={() => navigate('/user/help')}
        className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-[0_14px_32px_rgba(15,23,42,0.22)] md:hidden"
        aria-label="Open help center"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-background/95 px-1.5 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        {[
          { label: 'Home', icon: Home, path: '/user/home' },
          { label: 'Jobs', icon: Briefcase, path: '/user/my-jobs' },
          { label: 'Products', icon: Package, path: '/user/products' },
          {
            label: 'Reserve',
            icon: ShoppingBag,
            path: '/user/products/reservations',
          },
          { label: 'Wallet', icon: Wallet, path: '/user/wallet' },
        ].map(({ label, icon: Icon, path }) => {
          const isActive =
            location.pathname === path ||
            (path === '/user/products' &&
              location.pathname.startsWith('/user/products') &&
              location.pathname !== '/user/products/reservations');

          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold ${
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground'
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
