import React from 'react';
import { Bell, MessageSquare } from 'lucide-react';

interface WorkerTopbarProps {
  workerName: string;
  profileImage?: string;
}

export const WorkerTopbar: React.FC<WorkerTopbarProps> = ({ workerName, profileImage }) => (
  <header className="fixed top-0 left-[200px] right-0 h-[64px] bg-white border-b border-gray-100 z-10 flex items-center px-6">
    <div className="ml-auto flex items-center gap-3">

      <button className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
        <Bell className="w-4.5 h-4.5 text-gray-400" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
        <MessageSquare className="w-4.5 h-4.5 text-gray-400" />
      </button>

      <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{workerName}</p>
          <p className="text-[11px] text-gray-400">Service Worker</p>
        </div>
        <img
          src={profileImage ?? `https://i.pravatar.cc/36?img=11`}
          alt={workerName}
          className="w-9 h-9 rounded-full object-cover border-2 border-gray-100"
        />
      </div>

    </div>
  </header>
);