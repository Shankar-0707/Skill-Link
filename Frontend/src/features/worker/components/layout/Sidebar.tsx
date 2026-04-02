import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Search,
  Briefcase,
  IndianRupee,
  // Calendar,
  Settings,
  Zap,
} from 'lucide-react';

interface WorkerSidebarProps {
  isAvailable: boolean;
  onToggleAvailability: () => void;
}

const NAV_ITEMS = [
  { path: '/worker/dashboard',      label: 'Dashboard', icon: LayoutGrid  },
  { path: '/worker/available-jobs', label: 'Find Jobs',  icon: Search      },
  { path: '/worker/my-assignments', label: 'My Work',    icon: Briefcase   },
  { path: '/worker/earnings',       label: 'Earnings',   icon: IndianRupee },
//   { path: '/worker/schedule',       label: 'Schedule',   icon: Calendar    },
  { path: '/worker/settings',       label: 'Settings',   icon: Settings    },
];

export const WorkerSidebar: React.FC<WorkerSidebarProps> = ({
  isAvailable,
  onToggleAvailability,
}) => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-white border-r border-gray-100 flex flex-col z-20">

      {/* Logo */}
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

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-150
                ${isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Availability Toggle */}
      <div className="px-3 pb-5">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">Availability</span>
            {/* Toggle switch */}
            <button
              onClick={onToggleAvailability}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
                ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
                  ${isAvailable ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
          <p className={`text-[10px] font-medium ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
            {isAvailable ? '● Accepting jobs' : '● Not available'}
          </p>
        </div>
      </div>

    </aside>
  );
};