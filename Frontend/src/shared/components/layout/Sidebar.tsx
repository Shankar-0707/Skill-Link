import React from 'react';
import { 
  Store, 
  Briefcase, 
  Package, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  CircleHelp,
  Plus
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { Button } from '@/shared/components/ui/button';

const navItems = [
  { icon: Store, label: 'MARKETPLACE', path: '/marketplace' },
  { icon: Briefcase, label: 'MY JOBS', path: '/jobs' },
  { icon: Package, label: 'INVENTORY', path: '/inventory' },
  { icon: Calendar, label: 'SCHEDULE', path: '/schedule' },
  { icon: Users, label: 'STAFF', path: '/staff' },
  { icon: BarChart3, label: 'ANALYTICS', path: '/analytics' },
];

const footerItems = [
  { icon: Settings, label: 'SETTINGS', path: '/settings' },
  { icon: CircleHelp, label: 'HELP', path: '/help' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r bg-white flex flex-col sticky top-0 h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary p-1.5 rounded-lg">
            <h1 className="text-white font-bold text-xl leading-none">SL</h1>
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl text-primary leading-tight">Skill-Link</h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest leading-none">HYPERLOCAL PORTAL</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors group",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-muted-foreground hover:bg-secondary hover:text-primary"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-6">
        <Button className="w-full bg-primary text-white hover:bg-primary/90 rounded-md font-bold text-xs py-6 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          POST NEW LISTING
        </Button>

        <nav className="space-y-1">
          {footerItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
