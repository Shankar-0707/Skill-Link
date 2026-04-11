import React, { useState } from 'react';
import { Search, Bell, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CurrentUser } from '../../types/index';

interface TopbarProps {
  user: CurrentUser & { memberTier?: string };
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [''];

export const Topbar: React.FC<TopbarProps> = ({ user, activeTab, onTabChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-[200px] right-0 h-[64px] bg-background border-b border-border z-10 flex items-center px-6 gap-6">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Search service workers or shop products..."
          className="w-full pl-9 pr-4 py-2 bg-surface-container rounded-lg text-sm font-body text-foreground placeholder:text-muted-foreground border border-transparent focus:border-outline focus:outline-none transition-colors"
        />
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`text-sm font-label font-medium pb-0.5 transition-colors relative
              ${activeTab === tab
                ? 'text-foreground after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[2px] after:bg-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Right icons */}
      <div className="ml-auto flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors">
          <Bell className="w-4.5 h-4.5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors">
          <MessageSquare className="w-4.5 h-4.5 text-muted-foreground" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-label font-semibold text-foreground leading-tight">{user.name}</p>
            <p className="text-[11px] text-muted-foreground font-body">{user.memberTier ?? 'Member'}</p>
          </div>
          <img
            src={user.profileImage ?? `https://i.pravatar.cc/36?u=${user.id}`}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-border cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/user/settings')}
          />
        </div>
      </div>
    </header>
  );
};