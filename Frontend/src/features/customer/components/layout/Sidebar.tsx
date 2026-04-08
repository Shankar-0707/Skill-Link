import React from 'react';
import {
  LayoutGrid,
  Briefcase,
  Package,
  Calendar,
  ShoppingBag,
  // Users,
  // BarChart2,
  Settings,
  HelpCircle,
  Zap,
  Plus,
} from 'lucide-react';

import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'marketplace',    label: 'Marketplace',      icon: LayoutGrid,  path: '/user/home' },
  { id: 'my-jobs',        label: 'My Jobs',           icon: Briefcase,   path: '/user/my-jobs' },
  { id: 'products',       label: 'Products',          icon: Package,     path: '/user/products' },
  { id: 'reservations',   label: 'My Reservations',   icon: ShoppingBag, path: '/user/products/reservations' },
  { id: 'schedule',       label: 'Schedule',          icon: Calendar,    path: '/user/schedule' },
  // { id: 'staff',       label: 'Staff',             icon: Users,       path: '/user/staff' },
  // { id: 'analytics',   label: 'Analytics',         icon: BarChart2,   path: '/user/analytics' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === '/user/home') return 'marketplace';
    if (location.pathname === '/user/create-job') return 'create-job';
    if (location.pathname === '/user/my-jobs') return 'my-jobs';
    if (location.pathname === '/user/products/reservations') return 'reservations';
    if (location.pathname.startsWith('/user/products')) return 'products';
    if (location.pathname === '/user/help') return 'help';
    if (location.pathname === '/user/schedule') return 'schedule';
    if (location.pathname === '/user/settings') return 'settings';
    return '';
  };

  const activePage = getActiveTab();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-background border-r border-border flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-background" fill="currentColor" />
          </div>
          <div>
            <p className="font-headline font-bold text-sm text-foreground leading-tight">Skill-Link</p>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-label">Hyperlocal Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-label font-medium transition-all duration-150 text-left
                ${isActive
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-surface-container hover:text-foreground'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 flex flex-col gap-1">
        {/* Post New Listing CTA */}
        <button
          onClick={() => navigate('/user/create-job')}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-foreground text-background rounded-xl text-sm font-label font-semibold hover:opacity-90 transition-opacity mb-3 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Post New Listing
        </button>

        <button
          onClick={() => navigate('/user/help')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-label font-medium transition-all
            ${activePage === 'help'
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-foreground hover:bg-surface-container hover:text-foreground'
            }`}
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
        <button
          onClick={() => navigate('/user/settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-label font-medium text-muted-foreground hover:bg-surface-container hover:text-foreground transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
};
