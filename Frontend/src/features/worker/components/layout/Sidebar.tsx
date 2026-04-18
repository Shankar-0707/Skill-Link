import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Search,
  Briefcase,
  Wallet,
  HelpCircle,
  Settings,
  Zap,
  LogOut,
} from 'lucide-react';

import { useAuth } from '../../../../app/context/useAuth';

interface WorkerSidebarProps {
  // Add any needed props here if any remain
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/worker/dashboard' },
  { id: 'available-jobs', label: 'Find Jobs', icon: Search, path: '/worker/available-jobs' },
  { id: 'my-assignments', label: 'My Work', icon: Briefcase, path: '/worker/my-assignments' },
  { id: 'wallet', label: 'My Wallet', icon: Wallet, path: '/worker/wallet' },
];

export const WorkerSidebar: React.FC<WorkerSidebarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      if (window.confirm('Are you sure you want to logout?')) {
        await logout();
        navigate('/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-white border-r border-gray-100 flex flex-col z-20">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Skill-Link
            </p>
            <p className="text-[9px] text-gray-400 tracking-widest uppercase">Worker Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-150
                ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-5 flex flex-col gap-1">
        <button
          onClick={() => navigate('/worker/help')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            location.pathname === '/worker/help' || location.pathname.startsWith('/worker/help/')
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          Help Center
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-label"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>

        <button
          onClick={() => navigate('/worker/settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            location.pathname === '/worker/settings'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </button>
      </div>
    </aside>
  );
};
