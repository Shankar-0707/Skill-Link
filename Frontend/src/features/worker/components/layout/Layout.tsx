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
  const [isAvailable, setIsAvailable] = useState(true);

  // Fetch worker-specific profile on mount
  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        const profile = await workerService.getMe();
        setIsAvailable(profile.isAvailable);
      } catch (err) {
        console.error('Failed to fetch worker profile:', err);
      }
    };
    fetchWorkerProfile();
  }, []);

  const handleToggleAvailability = async () => {
    // In production: call PATCH /workers/profile/availability
    // We'll toggle local state for now
    setIsAvailable(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkerSidebar
        isAvailable={isAvailable}
        onToggleAvailability={handleToggleAvailability}
      />
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