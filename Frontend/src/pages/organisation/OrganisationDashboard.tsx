import React from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { RevenueAnalytics } from '@/features/organisation/components/RevenueAnalytics';
import { QuickActions, StockValue } from '@/features/organisation/components/DashboardMetrics';
import { ServiceReservations } from '@/features/organisation/components/ServiceReservations';
import { StaffOverview } from '@/features/organisation/components/StaffOverview';
import { ProductInventory } from '@/features/organisation/components/ProductInventory';

export const OrganisationDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Management Console</p>
        <h1 className="text-5xl font-headline font-bold text-primary tracking-tight">Operations Overview</h1>
        <div className="w-24 h-1.5 bg-primary mt-4 rounded-full"></div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueAnalytics />
        </div>
        <div className="space-y-8">
          <div className="flex-1">
            <QuickActions />
          </div>
          <div className="h-40">
            <StockValue />
          </div>
        </div>
      </div>

      {/* Middle Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ServiceReservations />
        <StaffOverview />
      </div>

      {/* Bottom Inventory Section */}
      <ProductInventory />
    </DashboardLayout>
  );
};
