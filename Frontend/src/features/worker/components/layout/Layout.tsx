import React, { useEffect, useState } from 'react';
import { Briefcase, HelpCircle, Home, LogOut, Search, Wallet } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      window.location.href = '/login';
    }
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
      <main className="min-h-screen pt-[64px] md:ml-[200px]">
        <div className="p-4 pb-24 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
      <button
        type="button"
        onClick={() => navigate('/worker/help')}
        className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-[0_14px_32px_rgba(15,23,42,0.22)] md:hidden"
        aria-label="Open help center"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-gray-100 bg-white/95 px-1.5 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        {[
          { label: 'Home', icon: Home, path: '/worker/dashboard' },
          { label: 'Find', icon: Search, path: '/worker/available-jobs' },
          { label: 'Work', icon: Briefcase, path: '/worker/my-assignments' },
          { label: 'Wallet', icon: Wallet, path: '/worker/wallet' },
        ].map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;

          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-500'
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
