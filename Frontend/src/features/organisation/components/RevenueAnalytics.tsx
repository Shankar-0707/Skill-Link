import React from 'react';
import { cn } from '@/shared/utils/cn';

const data = [
  { day: 'MAY 01', value: 40 },
  { day: 'MAY 05', value: 65 },
  { day: 'MAY 10', value: 45 },
  { day: 'MAY 15', value: 85 },
  { day: 'MAY 20', value: 50 },
  { day: 'MAY 25', value: 60 },
  { day: 'TODAY', value: 100, active: true },
];

export const RevenueAnalytics: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-2xl border flex flex-col h-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="font-headline font-bold text-2xl text-primary">Revenue Analytics</h3>
          <p className="text-muted-foreground text-sm font-medium">Performance across all service categories</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-lg">
          <button className="px-4 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">7 DAYS</button>
          <button className="px-4 py-1.5 text-xs font-bold bg-white text-primary rounded-md shadow-sm">30 DAYS</button>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-4 mt-8 h-64">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-4">
            <div 
              className={cn(
                "w-full rounded-t-sm transition-all duration-500",
                item.active ? "bg-primary" : "bg-secondary"
              )}
              style={{ height: `${item.value}%` }}
            ></div>
            <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap tracking-wider">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
