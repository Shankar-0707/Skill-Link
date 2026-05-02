import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../features/admin/api/admin';
import type { EscrowItemRaw } from '../../features/admin/api/admin';
import {
  ShieldCheck,
  ShieldAlert,
  Undo2,
  Loader2,
  RefreshCw,
  Clock,
  History,
  CheckCircle2,
  Lock,
  Wallet,
  TrendingUp,
  ArrowRight,
  Percent,
  Building2,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
} from 'lucide-react';
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

export const AdminEscrowControlPage: React.FC = () => {
  const [escrows, setEscrows] = useState<EscrowItemRaw[]>([]);
  const [adminWallet, setAdminWallet] = useState<AdminWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setWalletLoading(true);
    try {
      const [escrowData, walletData] = await Promise.all([
        adminApi.getHeldEscrows(),
        adminApi.getAdminWallet(),
      ]);
      setEscrows(escrowData);
      setAdminWallet(walletData);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const pendingEscrows = escrows.filter(e => e.status === 'HELD');
  const historyEscrows = escrows.filter(e => e.status !== 'HELD');
  const displayedEscrows = activeTab === 'pending' ? pendingEscrows : historyEscrows;

  // Aggregate stats
  const totalHeld = pendingEscrows.reduce((s, e) => s + (e.amount ?? 0), 0);
  const totalFeeHeld = pendingEscrows.reduce((s, e) => s + (e.platformFee ?? 0), 0);

  const handleRelease = async (id: string) => {
    if (!window.confirm('Release funds? Payee receives their payout and platform revenue is processed.')) return;
    setActionLoading(id);
    try {
      await adminApi.releaseEscrow(id);
      await fetchAll();
    } catch {
      alert('Failed to release escrow.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (id: string) => {
    if (!window.confirm('Refund full amount to customer? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      await adminApi.refundEscrow(id);
      await fetchAll();
    } catch {
      alert('Failed to refund escrow.');
    } finally {
      setActionLoading(null);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen -mt-8 -mx-8 px-8 py-10 bg-slate-50/50 space-y-6 animate-in fade-in duration-700 pb-20">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary/40 uppercase tracking-[0.3em] font-black text-[9px]">
            <ShieldCheck size={12} />
            System Governance
          </div>
          <h1 className="font-headline font-black text-4xl text-primary tracking-tighter">
            Escrow Control
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed text-xs">
            Monitor held payments, service revenue, and release or refund escrow funds.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="group px-5 py-2.5 bg-white text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className={cn('w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500', loading && 'animate-spin')} />
          Sync Ledger
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Held', value: fmt(totalHeld), icon: Lock, color: 'amber' },
          { label: 'Revenue Pending', value: fmt(totalFeeHeld), icon: Percent, color: 'violet' },
          { label: 'Escrows Active', value: pendingEscrows.length.toString(), icon: Clock, color: 'blue' },
          { label: 'Platform Wallet', value: walletLoading ? '…' : fmt(adminWallet?.balance ?? 0), icon: Wallet, color: 'emerald' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center gap-4">
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0',
              stat.color === 'amber' && 'bg-amber-50 text-amber-500 border border-amber-200',
              stat.color === 'violet' && 'bg-violet-50 text-violet-500 border border-violet-200',
              stat.color === 'blue' && 'bg-blue-50 text-blue-500 border border-blue-200',
              stat.color === 'emerald' && 'bg-emerald-50 text-emerald-600 border border-emerald-200',
            )}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-primary tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Admin Wallet Panel ── */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 shadow-xl shadow-primary/20 text-white">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/50 text-[9px] font-black uppercase tracking-[0.3em]">
              <Wallet size={10} /> Admin Platform Wallet
            </div>
            <p className="text-4xl font-black tracking-tighter">
              {walletLoading ? <Loader2 className="w-8 h-8 animate-spin opacity-40 inline" /> : fmt(adminWallet?.balance ?? 0)}
            </p>
            <p className="text-white/60 text-xs font-medium">Current Balance</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/10">
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1 flex items-center gap-1"><TrendingUp size={9} /> Total Fees Collected</p>
              <p className="text-2xl font-black tracking-tighter">{walletLoading ? '…' : fmt(adminWallet?.totalFeeIncome ?? 0)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/10">
              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1 flex items-center gap-1"><Banknote size={9} /> Fee Rate</p>
              <p className="text-2xl font-black tracking-tighter">Standard</p>
            </div>
          </div>
        </div>

        {/* Recent wallet transactions */}
        {!walletLoading && adminWallet && adminWallet.transactions.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-5 space-y-2">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Recent Transactions</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {adminWallet.transactions.slice(0, 15).map(tx => (
                <div key={tx.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      tx.type === 'CREDIT' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'
                    )}>
                      {tx.type === 'CREDIT' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/80 leading-tight">{tx.note ?? 'Transaction'}</p>
                      <p className="text-[9px] text-white/30 font-mono">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <p className={cn(
                    'text-sm font-black tabular-nums',
                    tx.type === 'CREDIT' ? 'text-emerald-300' : 'text-rose-300'
                  )}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{fmt(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!walletLoading && adminWallet && adminWallet.transactions.length === 0 && (
          <p className="mt-4 text-white/30 text-xs text-center pt-4 border-t border-white/10">No transactions yet — fees appear here after first OTP verification.</p>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="sticky top-4 z-20 flex gap-1 p-1 bg-white/80 backdrop-blur-xl border border-primary/10 rounded-xl w-fit shadow-xl shadow-primary/5">
        {(['pending', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'relative px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2',
              activeTab === tab ? 'bg-primary text-white shadow-md shadow-primary/20 z-10' : 'text-muted-foreground hover:text-primary hover:bg-slate-50'
            )}
          >
            {tab === 'pending' ? <Clock className="w-3.5 h-3.5" /> : <History className="w-3.5 h-3.5" />}
            {tab === 'pending' ? 'Pending Actions' : 'Audit History'}
            <span className={cn(
              'ml-1 px-1.5 py-0.5 rounded text-[8px]',
              activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-muted-foreground'
            )}>
              {tab === 'pending' ? pendingEscrows.length : historyEscrows.length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Escrow Cards ── */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
          <p className="font-label text-xs uppercase tracking-[0.3em] font-black text-primary mt-6 animate-pulse">Syncing Vaults...</p>
        </div>
      ) : displayedEscrows.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-6 border border-slate-100">
            {activeTab === 'pending' ? <ShieldCheck className="w-8 h-8 text-emerald-500/30" /> : <History className="w-8 h-8 text-primary/20" />}
          </div>
          <p className="font-label text-xs uppercase tracking-[0.3em] font-black text-primary">
            {activeTab === 'pending' ? 'All Clear' : 'No Records'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayedEscrows.map(escrow => {
            const isReservation = escrow.type === 'RESERVATION';
            const payee = escrow.organisationName || escrow.workerName || 'Unassigned';
            const baseAmount = escrow.originalAmount > 0 ? escrow.originalAmount : escrow.amount;
            const fee = escrow.platformFee ?? 0;

            return (
              <div
                key={escrow.id}
                className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Top stripe */}
                <div className={cn(
                  'h-1 w-full',
                  escrow.status === 'HELD' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                  escrow.status === 'RELEASED' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                  'bg-gradient-to-r from-slate-300 to-slate-400'
                )} />

                <div className="p-6 flex flex-col lg:flex-row gap-6">
                  {/* Left: Meta */}
                  <div className="lg:w-56 shrink-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm',
                        escrow.status === 'HELD' ? 'bg-amber-50 border-amber-200 text-amber-500' :
                        escrow.status === 'RELEASED' ? 'bg-emerald-50 border-emerald-200 text-emerald-500' :
                        'bg-slate-100 border-slate-200 text-slate-400'
                      )}>
                        {escrow.status === 'HELD' ? <Lock size={15} /> : <CheckCircle2 size={15} />}
                      </div>
                      <div>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest',
                          escrow.status === 'HELD' ? 'bg-amber-100/50 text-amber-700' :
                          escrow.status === 'RELEASED' ? 'bg-emerald-100/50 text-emerald-700' :
                          'bg-slate-100 text-slate-500'
                        )}>
                          {escrow.status}
                        </span>
                        <p className="text-[8px] font-mono text-muted-foreground/40 mt-0.5">#{escrow.id.substring(0, 8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">
                        {isReservation ? 'Product' : 'Job'}
                      </p>
                      <p className="text-xs font-black text-primary leading-tight line-clamp-2">
                        {escrow.productName || escrow.jobTitle || '—'}
                      </p>
                      <p className="text-[8px] text-muted-foreground/40 mt-1 capitalize">{isReservation ? 'Reservation' : 'Job'} Flow</p>
                    </div>

                    <div className="text-[9px] text-muted-foreground/50 space-y-1 pt-1 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="font-bold uppercase opacity-60">Created</span>
                        <span className="font-black text-primary/60">{new Date(escrow.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                      </div>
                      {escrow.releasedAt && (
                        <div className="flex justify-between">
                          <span className="font-bold uppercase opacity-60">Released</span>
                          <span className="font-black text-emerald-600">{new Date(escrow.releasedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Flow */}
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Participants */}
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      {/* Customer */}
                      <div className="flex-1 w-full p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-primary border border-slate-100 text-sm shrink-0">
                          <User size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Customer (Payer)</p>
                          <p className="text-xs font-black text-primary truncate">{escrow.customerName || '—'}</p>
                          <p className="text-[8px] text-muted-foreground/40 truncate">{escrow.customerEmail}</p>
                        </div>
                      </div>

                      <ArrowRight size={14} className="text-primary/20 shrink-0 hidden md:block" />

                      {/* Payee */}
                      <div className="flex-1 w-full p-3 bg-primary/[0.03] rounded-xl border border-primary/10 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary text-white shadow-sm flex items-center justify-center shrink-0">
                          <Building2 size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Payee (Org/Worker)</p>
                          <p className="text-xs font-black text-primary truncate">{payee}</p>
                        </div>
                      </div>
                    </div>

                    {/* Fee Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Customer Paid</p>
                        <p className="text-base font-black text-primary tracking-tighter">{fmt(escrow.amount)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                        <p className="text-[8px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Org Receives</p>
                        <p className="text-base font-black text-emerald-700 tracking-tighter">{fmt(baseAmount)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-center">
                        <p className="text-[8px] font-black text-violet-600/70 uppercase tracking-widest mb-1">Service Commission</p>
                        <p className="text-base font-black text-violet-700 tracking-tighter">{fmt(fee)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-40 shrink-0 flex flex-col justify-between gap-3">
                    {escrow.status === 'HELD' ? (
                      <>
                        <button
                          onClick={() => handleRelease(escrow.id)}
                          disabled={!!actionLoading}
                          className="w-full py-3 bg-primary text-white hover:bg-black rounded-xl text-[10px] font-black uppercase tracking-[0.08em] flex items-center justify-center gap-2 shadow-lg shadow-primary/10 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {actionLoading === escrow.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                          Release
                        </button>
                        <button
                          onClick={() => handleRefund(escrow.id)}
                          disabled={!!actionLoading}
                          className="w-full py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-[0.08em] text-slate-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {actionLoading === escrow.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                          Refund
                        </button>
                        <p className="text-[8px] text-center text-muted-foreground/40 font-medium leading-tight">
                          Release sends {fmt(baseAmount)} to payee + commission to admin
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 px-2 py-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2.5} />
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest text-center">
                          {escrow.status === 'RELEASED' ? 'Settled' : 'Refunded'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex items-center gap-6 shadow-sm mt-8">
        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
          <ShieldAlert size={20} />
        </div>
        <p className="text-muted-foreground leading-relaxed text-[11px] font-medium max-w-4xl">
          <span className="text-primary font-black uppercase mr-2">Protocol:</span>
          When released, the payee receives their payout and the service commission is credited to the platform wallet. All actions are permanent and immutably logged for compliance.
        </p>
      </div>
    </div>
  );
};

export default AdminEscrowControlPage;
