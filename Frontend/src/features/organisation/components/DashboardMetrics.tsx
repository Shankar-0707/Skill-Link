import React from 'react';
import { Plus, Calendar, Wallet } from 'lucide-react';

export const QuickActions: React.FC = () => {
  return (
    <div className="bg-[#0b101b] text-white p-8 rounded-2xl h-full flex flex-col justify-between">
      <div>
        <h3 className="font-headline font-bold text-xl mb-2">Quick Actions</h3>
        <p className="text-muted-foreground text-sm font-medium">Manage your shop operations efficiently</p>
      </div>

      <div className="flex gap-4 mt-8">
        <button className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl p-6 transition-all border border-white/10 flex flex-col items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase">Add Product</span>
        </button>
        <button className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl p-6 transition-all border border-white/10 flex flex-col items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase">Manage Schedule</span>
        </button>
      </div>
    </div>
  );
};

export const StockValue: React.FC = () => {
  return (
    <div className="bg-[#d7eaff] p-8 rounded-2xl flex items-center justify-between h-full group cursor-pointer transition-all hover:bg-[#c5e1ff]">
      <div>
        <p className="text-[10px] font-bold text-primary/60 tracking-widest uppercase mb-1">Total Stock Value</p>
        <h3 className="text-4xl font-headline font-bold text-primary">$42,850</h3>
      </div>
      <div className="p-4 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
        <Wallet className="w-6 h-6 text-primary" />
      </div>
    </div>
  );
};
