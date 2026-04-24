import React, { useEffect, useState } from 'react';
import { paymentsApi } from '../../../services/api/payments';
import { ArrowDownRight, ArrowUpRight, DollarSign, RefreshCw, Wallet } from 'lucide-react';
import { cn } from '../../utils/cn';

interface WalletTx {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  referenceId?: string;
  referenceType?: string;
}

interface WalletData {
  id: string;
  balance: number;
  transactions: WalletTx[];
}

export const WalletView: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const data = await paymentsApi.getMyWallet();
      setWallet(data.data || data); // handle standard wrapper vs raw
    } catch (err) {
      console.error('Failed to load wallet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  if (loading && !wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-black text-primary/60 uppercase tracking-widest mt-4">Loading Wallet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header section with Balance Card */}
      <section className="bg-primary text-white rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center md:items-start w-full md:w-auto">
          <div className="flex items-center gap-2 text-white/70 mb-2">
            <Wallet className="w-4 h-4" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Available Balance</h2>
          </div>
          <p className="text-5xl md:text-6xl font-black tracking-tighter">
            ₹{(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="relative z-10">
          <button 
            onClick={fetchWallet}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </section>

      {/* Transaction History Section */}
      <section className="bg-white border border-border/60 rounded-[2rem] p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-border/40 pb-4">
          <DollarSign className="w-4 h-4 text-primary" />
          Transaction History
        </h3>

        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground/60 border border-dashed border-border rounded-xl">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm font-bold">No transactions found</p>
            <p className="text-xs">Your wallet activity will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wallet.transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/5 hover:bg-secondary/10 border border-border/40 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Icon Indicator */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  )}>
                    {tx.type === 'CREDIT' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  
                  {/* Tx Details */}
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {tx.type === 'CREDIT' ? 'Funds Received' : 'Funds Withdrawn/Paid'}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 mt-1 uppercase tracking-wider">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                      <span className="w-1 h-1 rounded-full bg-border" />
                      Ref: {tx.referenceType || 'SYSTEM'} #{tx.referenceId ? tx.referenceId.substring(0,6) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex flex-row sm:flex-col items-center justify-between sm:items-end">
                  <span className={cn(
                    "text-lg font-black tracking-tight",
                    tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-foreground'
                  )}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground mt-1">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
