import React from 'react';
import { Layout } from '../../features/customer/components/layout/Layout';
import { WalletView } from '../../shared/components/ui/WalletView';

export const MyWalletPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-8 px-4">
        <div className="mb-8">
          <h1 className="font-headline font-bold text-2xl text-foreground">My Virtual Wallet</h1>
          <p className="text-muted-foreground font-body mt-1 text-sm">
            View your available balance and track refunds.
          </p>
        </div>
        <WalletView />
      </div>
    </Layout>
  );
};
