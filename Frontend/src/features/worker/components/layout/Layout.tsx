import React, { useEffect, useState } from 'react';
import { WorkerSidebar } from './Sidebar';
import { WorkerTopbar } from './Topbar';
import { useAuth } from '../../../../app/context/useAuth';
import { useSocket } from '../../../../shared/hooks/useSocket';
import {
  SOCKET_EVENTS,
  type JobNotificationPayload,
} from '../../../../services/socket/socket';
// import { workerService } from '../../../customer/services/workerService';

interface WorkerLayoutProps {
  children: React.ReactNode;
}

export const WorkerLayout: React.FC<WorkerLayoutProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [jobNotifications, setJobNotifications] = useState<
    JobNotificationPayload[]
  >([]);

  useEffect(() => {
    const handleJobNotification = (notification: JobNotificationPayload) => {
      setJobNotifications((current) => {
        if (current.some((item) => item.jobId === notification.jobId)) {
          return current;
        }

        return [notification, ...current].slice(0, 10);
      });
    };

    socket.on(SOCKET_EVENTS.JOB_NOTIFICATION, handleJobNotification);

    return () => {
      socket.off(SOCKET_EVENTS.JOB_NOTIFICATION, handleJobNotification);
    };
  }, [socket]);

  const dismissJobNotification = (jobId: string) => {
    setJobNotifications((current) =>
      current.filter((notification) => notification.jobId !== jobId),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkerSidebar />
      <WorkerTopbar
        workerName={user?.name ?? 'Worker'}
        profileImage={user?.profileImage}
        jobNotifications={jobNotifications}
        onDismissJobNotification={dismissJobNotification}
      />
      <main className="ml-[200px] pt-[64px] min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
