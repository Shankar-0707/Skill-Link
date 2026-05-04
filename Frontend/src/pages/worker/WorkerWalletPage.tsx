import React from 'react';
import { WorkerLayout } from '../../features/worker/components/layout/Layout';
import { WalletView } from '../../shared/components/ui/WalletView';

export const WorkerWalletPage: React.FC = () => {
  return (
    <WorkerLayout>
      <div className="py-8 px-4 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline font-bold text-3xl text-foreground tracking-tight">Earnings Vault</h1>
          <p className="text-muted-foreground font-medium mt-2 text-sm leading-relaxed max-w-2xl">
            View your balance from completed jobs. Funds are released into this wallet seamlessly when customers confirm job completion.
          </p>
        </div>
        <WalletView />
      </div>
    </WorkerLayout>
  );
};
