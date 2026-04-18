import React from 'react';
import { WalletView } from '../../shared/components/ui/WalletView';

const OrganisationWalletPage: React.FC = () => {
  return (
    <div className="py-8 px-4 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-headline font-bold text-3xl text-foreground tracking-tight">Financial Hub</h1>
        <p className="text-muted-foreground font-medium mt-2 text-sm leading-relaxed max-w-2xl">
          Track your earnings and released escrows. Funds held in escrow will appear here once you verify a customer's pickup.
        </p>
      </div>
      <WalletView />
    </div>
  );
};

export default OrganisationWalletPage;
