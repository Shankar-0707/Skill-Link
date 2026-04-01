import { useState, useEffect } from 'react';
import { Users, Briefcase, Building2, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import type { AdminDashboardData } from '../../features/admin/types';
import { cn } from '@/shared/utils/cn';

// Mock data for initial iteration
const mockData: AdminDashboardData = {
  metrics: {
    total: 12840,
    customers: 8211,
    workers: 4129,
    organisations: 500,
  },
  recentJobs: [
    { id: '1', title: 'Fix electrical wiring', status: 'In Progress', workerName: 'Alice Moore', customerName: 'John Doe', date: 'Today, 10:30 AM', price: 1500 },
    { id: '2', title: 'Plumbing Repair', status: 'Assigned', workerName: 'Robert Vance', customerName: 'Jane Smith', date: 'Today, 2:15 PM', price: 800 },
    { id: '3', title: 'House Cleaning', status: 'Completed', workerName: 'Maya Singh', customerName: 'Bob Johnson', date: 'Yesterday', price: 2500 },
  ],
  recentReservations: [
    { id: '1', productName: 'Eco Bricks Pack', organisationName: 'GreenBuild Materials', customerName: 'TechCorp Inc.', status: 'Confirmed', date: 'Today' },
    { id: '2', productName: 'Electric Drill', organisationName: 'Urban Tools Hub', customerName: 'Alice Moore', status: 'Pending', date: 'Yesterday' },
  ]
};

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-[#001F3F]">{value.toLocaleString()}</h3>
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#f2f4f6] flex items-center justify-center text-[#001F3F]">
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 text-xs font-semibold text-emerald-600">
        ↑ {trend}% from last month
      </div>
    )}
  </div>
);

export const AdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => {
      setData(mockData);
    }, 500);
  }, []);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#001F3F]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-[#001F3F] tracking-tight">Marketplace Overview</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">Real-time performance metrics and active logistical status.</p>
        </div>
        <button className="px-6 py-2.5 bg-[#001F3F] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#001F3F]/20 hover:bg-[#001F3F]/90 transition-all">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={data.metrics.total} icon={Users} trend="12.5" />
        <StatCard title="Customers" value={data.metrics.customers} icon={ShoppingBag} trend="8.2" />
        <StatCard title="Workers" value={data.metrics.workers} icon={Briefcase} trend="15.3" />
        <StatCard title="Organizations" value={data.metrics.organisations} icon={Building2} trend="4.1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fcfcfc]">
            <h2 className="text-lg font-bold text-[#001F3F]">Active Job Assignments</h2>
            <button className="text-xs font-bold text-[#001F3F] hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {data.recentJobs.map(job => (
              <div key={job.id} className="p-6 hover:bg-[#f8f9fb] transition-colors group flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#001F3F] transition-colors">{job.title}</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">{job.workerName} • {job.customerName}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    job.status === 'Completed' ? "bg-emerald-50 text-emerald-700" :
                    job.status === 'In Progress' ? "bg-blue-50 text-blue-700" :
                    "bg-orange-50 text-orange-700"
                  )}>
                    {job.status === 'Completed' && <CheckCircle2 size={12} />}
                    {job.status === 'In Progress' && <Clock size={12} />}
                    {job.status}
                  </span>
                  <p className="text-xs font-semibold text-gray-400 mt-1">{job.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fcfcfc]">
            <h2 className="text-lg font-bold text-[#001F3F]">Recent Reservations</h2>
            <button className="text-xs font-bold text-[#001F3F] hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {data.recentReservations.map(res => (
              <div key={res.id} className="p-6 hover:bg-[#f8f9fb] transition-colors group flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#001F3F] transition-colors">{res.productName}</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">{res.organisationName}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    res.status === 'Confirmed' ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {res.status === 'Confirmed' && <CheckCircle2 size={12} />}
                    {res.status}
                  </span>
                  <p className="text-xs font-semibold text-gray-400 mt-2">{res.customerName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
