import React, { useState, useEffect } from 'react';
import { WorkerSidebar } from './Sidebar';
import { WorkerTopbar } from './Topbar';
import { useAuth } from '../../../../app/context/useAuth';
import { workerService } from '../../../customer/services/workerService';

interface WorkerLayoutProps {
  children: React.ReactNode;
}

export const WorkerLayout: React.FC<WorkerLayoutProps> = ({
  children,
}) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <WorkerSidebar />
      <WorkerTopbar
        workerName={user?.name ?? 'Worker'}
        profileImage={user?.profileImage}
      />
      <main className="ml-[200px] pt-[64px] min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};