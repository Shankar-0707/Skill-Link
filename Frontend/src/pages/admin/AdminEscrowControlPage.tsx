import React, { useEffect, useState } from 'react';
import { adminApi } from '../../features/admin/api/admin';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Undo2, 
  Loader2, 
  RefreshCw,
  Clock,
  History,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { cn } from '../../shared/utils/cn';

export const AdminEscrowControlPage: React.FC = () => {
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const fetchEscrows = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getHeldEscrows();
      setEscrows(data);
    } catch (err) {
      console.error('Failed to fetch escrows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, []);

  const pendingEscrows = escrows.filter(e => e.status === 'HELD');
  const historyEscrows = escrows.filter(e => e.status !== 'HELD');

  const displayedEscrows = activeTab === 'pending' ? pendingEscrows : historyEscrows;

  const handleRelease = async (id: string) => {
    if (!window.confirm("Are you sure you want to FORCE RELEASE funds to the payee?")) return;
    setActionLoading(id);
    try {
      await adminApi.releaseEscrow(id);
      await fetchEscrows();
    } catch (err) {
      console.error('Failed to release', err);
      alert('Failed to release escrow.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (id: string) => {
    if (!window.confirm("Are you sure you want to FORCE REFUND funds to the customer?")) return;
    setActionLoading(id);
    try {
      await adminApi.refundEscrow(id);
      await fetchEscrows();
    } catch (err) {
      console.error('Failed to refund', err);
      alert('Failed to refund escrow.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen -mt-8 -mx-8 px-8 py-10 bg-slate-50/50 space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
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
            Monitor held payments, resolve disputes, and audit historical releases. 
          </p>
        </div>
        <button 
          onClick={fetchEscrows}
          className="group px-5 py-2.5 bg-white text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500", loading && "animate-spin")} />
          Sync Ledger
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="sticky top-4 z-20 flex gap-1 p-1 bg-white/80 backdrop-blur-xl border border-primary/10 rounded-xl w-fit shadow-xl shadow-primary/5">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            "relative px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2",
            activeTab === 'pending' 
              ? "bg-primary text-white shadow-md shadow-primary/20 z-10" 
              : "text-muted-foreground hover:text-primary hover:bg-slate-50"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Actions
          <span className={cn(
            "ml-1 px-1.5 py-0.5 rounded text-[8px]",
            activeTab === 'pending' ? "bg-white/20 text-white" : "bg-slate-100 text-muted-foreground"
          )}>
            {pendingEscrows.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "relative px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2",
            activeTab === 'history' 
              ? "bg-primary text-white shadow-md shadow-primary/20 z-10" 
              : "text-muted-foreground hover:text-primary hover:bg-slate-50"
          )}
        >
          <History className="w-3.5 h-3.5" />
          Audit History
          <span className={cn(
            "ml-1 px-1.5 py-0.5 rounded text-[8px]",
            activeTab === 'history' ? "bg-white/20 text-white" : "bg-slate-100 text-muted-foreground"
          )}>
            {historyEscrows.length}
          </span>
        </button>
      </div>

      {/* Content Area */}
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
          {displayedEscrows.map(escrow => (
            <div 
              key={escrow.id} 
              className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col lg:flex-row"
            >
              {/* Card Sidebar - Compact Context */}
              <div className="lg:w-64 p-5 lg:border-r border-slate-100 bg-slate-50/10">
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all duration-500",
                        escrow.status === 'HELD' 
                          ? "bg-white border-amber-200 text-amber-500" 
                          : "bg-white border-emerald-200 text-emerald-500"
                      )}>
                        {escrow.status === 'HELD' ? <Lock size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                            escrow.status === 'HELD' ? "bg-amber-100/50 text-amber-700" : "bg-emerald-100/50 text-emerald-700"
                          )}>
                            {escrow.status}
                          </span>
                        </div>
                        <p className="text-[9px] font-mono text-muted-foreground/40 mt-0.5 font-bold">#{escrow.id.substring(0, 8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                       <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5">Item/Service</p>
                       <p className="text-xs font-black text-primary leading-tight line-clamp-2">
                          {escrow.jobTitle || escrow.productName}
                       </p>
                    </div>
                  </div>

                  <div className="space-y-1 mt-2 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="font-bold text-muted-foreground uppercase opacity-30">Entry</span>
                      <span className="font-black text-primary/60">{new Date(escrow.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area - Compact Funds Flow */}
              <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between gap-6 relative">
                <div className="flex flex-col md:flex-row items-center gap-4 xl:gap-8">
                  
                  {/* Payer Card */}
                  <div className="flex-1 w-full max-w-sm">
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-sm font-black text-primary border border-slate-100 shrink-0">
                        {escrow.customerName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.1em] mb-0.5">Customer</p>
                        <p className="text-sm font-black text-primary tracking-tight truncate">{escrow.customerName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="hidden md:flex items-center text-primary/10">
                    <History size={16} />
                  </div>

                  {/* Payee Card */}
                  <div className="flex-1 w-full max-w-sm">
                    <div className="p-3 bg-primary/[0.02] rounded-xl border border-primary/10 flex items-center gap-3 relative overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-primary text-white shadow-sm flex items-center justify-center text-sm font-black border border-white shrink-0">
                        {(escrow.workerName || escrow.organisationName)?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.1em] mb-0.5">Payee</p>
                        <p className="text-sm font-black text-primary tracking-tight truncate">{escrow.workerName || escrow.organisationName || "Unassigned"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Section - Compact Financials & Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest pl-1">Balance:</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-primary opacity-20">₹</span>
                      <p className="text-3xl font-black text-primary tracking-tighter">
                        {escrow.amount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {activeTab === 'pending' ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                       <button
                         onClick={() => handleRelease(escrow.id)}
                         disabled={!!actionLoading}
                         className="flex-1 sm:px-8 py-3 bg-primary text-white hover:bg-black rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 shadow-lg shadow-primary/10 transition-all active:scale-95 disabled:opacity-50"
                       >
                         {actionLoading === escrow.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                         Release
                       </button>
                       <button
                         onClick={() => handleRefund(escrow.id)}
                         disabled={!!actionLoading}
                         className="px-5 py-3 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                       >
                         {actionLoading === escrow.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                       </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                       <CheckCircle2 size={14} className="text-emerald-500" strokeWidth={3} />
                       <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Settled</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Compact Info Footer */}
      <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex items-center gap-6 shadow-sm mt-8">
        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
           <ShieldAlert size={20} />
        </div>
        <p className="text-muted-foreground leading-relaxed text-[11px] font-medium max-w-4xl">
          <span className="text-primary font-black uppercase mr-2">Protocol:</span>
          All actions are permanent and recorded in the Immutable Financial Logs for compliance and platform auditing.
        </p>
      </div>
    </div>
  );
};

export default AdminEscrowControlPage;
