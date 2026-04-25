import React, { useEffect, useState } from 'react';
import { adminApi } from '../../features/admin/api/admin';
import { WalletView } from '../../shared/components/ui/WalletView';
import { Wallet, TrendingUp, Percent, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

type AdminWallet = {
  adminEmail: string;
  balance: number;
  totalFeeIncome: number;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    note: string | null;
    escrowId: string | null;
    createdAt: string;
  }>;
};

export const AdminWalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<AdminWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAdminWallet()
      .then(setWallet)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const feeTransactions = wallet?.transactions.filter(t => t.note?.includes('Platform Fee')) ?? [];

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary/40 uppercase tracking-[0.3em] font-black text-[9px]">
          <Wallet size={11} /> Platform Finance
        </div>
        <h1 className="font-headline font-bold text-3xl text-foreground tracking-tight">
          Admin Wallet
        </h1>
        <p className="text-muted-foreground font-medium mt-1 text-sm leading-relaxed max-w-2xl">
          Track platform service fee income from every completed escrow. All 5% charges are credited here on OTP verification.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
        </div>
      ) : wallet && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-6 shadow-xl shadow-primary/20 col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 text-white/50 text-[9px] font-black uppercase tracking-widest mb-2">
                <Wallet size={10} /> Current Balance
              </div>
              <p className="text-4xl font-black tracking-tighter">{fmt(wallet.balance)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Total Fee Income</p>
                <p className="text-2xl font-black text-primary tracking-tighter">{fmt(wallet.totalFeeIncome)}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center">
                <Percent size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Platform Rate</p>
                <p className="text-2xl font-black text-primary tracking-tighter">5% per txn</p>
              </div>
            </div>
          </div>

          {/* Fee income log */}
          {feeTransactions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-black text-primary uppercase tracking-widest">Platform Fee Transactions</p>
                <span className="text-[9px] font-black bg-violet-100 text-violet-700 px-2 py-1 rounded-full">{feeTransactions.length} transactions</span>
              </div>
              <div className="divide-y divide-slate-50">
                {feeTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        {tx.type === 'CREDIT' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{tx.note ?? 'Transaction'}</p>
                        <p className="text-[9px] text-muted-foreground font-mono">
                          {new Date(tx.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className={cn(
                      'text-sm font-black tabular-nums',
                      tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-500'
                    )}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{fmt(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Full wallet view */}
      <div className="space-y-3">
        <p className="text-xs font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Full Wallet Ledger</p>
        <WalletView />
      </div>
    </div>
  );
};
