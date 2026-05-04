import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import type { JobNotificationPayload } from '../../../../services/socket/socket';

interface WorkerTopbarProps {
  workerName: string;
  profileImage?: string;
  jobNotifications?: JobNotificationPayload[];
  onDismissJobNotification?: (jobId: string) => void;
}

export const WorkerTopbar: React.FC<WorkerTopbarProps> = ({
  workerName,
  profileImage,
  jobNotifications = [],
  onDismissJobNotification,
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = jobNotifications.length;

  const viewJob = (jobId: string) => {
    setShowNotifications(false);
    navigate(`/worker/job/${jobId}`);
  };

  return (
  <header className="fixed left-0 right-0 top-0 z-10 flex h-[64px] items-center border-b border-gray-100 bg-white px-4 md:left-[200px] md:px-6">
    <div className="ml-auto flex items-center gap-2 md:gap-3">

      <div className="relative">
      <button
        type="button"
        onClick={() => setShowNotifications((current) => !current)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Job notifications"
      >
        <Bell className="w-4.5 h-4.5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-11 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Job requests</p>
            <p className="text-xs text-gray-400">New matching jobs appear here in real time.</p>
          </div>

          {jobNotifications.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-gray-700">No new requests</p>
              <p className="text-xs text-gray-400 mt-1">You are connected and ready.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {jobNotifications.map((notification) => (
                <div
                  key={notification.jobId}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => viewJob(notification.jobId)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
                          {notification.category}
                        </span>
                        {notification.budget !== null && (
                          <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
                            Rs {notification.budget.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDismissJobNotification?.(notification.jobId)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                      aria-label="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>

      <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{workerName}</p>
          <p className="text-[11px] text-gray-400">Service Worker</p>
        </div>
        <img
          src={profileImage ?? `https://i.pravatar.cc/36?img=11`}
          alt={workerName}
          className="w-9 h-9 rounded-full object-cover border-2 border-gray-100"
          onClick={() => navigate('/worker/settings')}
        />
      </div>

    </div>
  </header>
);}
