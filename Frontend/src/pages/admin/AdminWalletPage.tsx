import React from 'react';
import { WalletView } from '../../shared/components/ui/WalletView';

export const AdminWalletPage: React.FC = () => {
  return (
    <div className="py-8 px-4 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-headline font-bold text-3xl text-foreground tracking-tight flex items-center gap-3">
          Platform Treasure
        </h1>
        <p className="text-muted-foreground font-medium mt-2 text-sm leading-relaxed max-w-2xl">
          View your administrative virtual wallet. 
        </p>
      </div>
      <WalletView />
    </div>
  );
};
