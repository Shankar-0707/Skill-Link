import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../../../app/context/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Browse');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar user={user} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="ml-[200px] pt-[64px] min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};