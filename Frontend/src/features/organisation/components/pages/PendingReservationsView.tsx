import React, { useEffect, useState, useMemo } from 'react';
import { reservationApi } from '@/features/organisation/api/reservation.service';
import type { Reservation } from '@/features/organisation/types/reservation.types';
import { ReservationStatus } from '@/features/organisation/types/reservation.types';
import { ReservationList } from '@/features/organisation/components/ReservationList';
import { CancelReservationModal } from '@/features/organisation/components/CancelReservationModal';
import { Clock, Search, Inbox } from 'lucide-react';

export const PendingReservationsView: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchPendingReservations = async () => {
    setIsLoading(true);
    try {
      const data = await reservationApi.getIncoming({ status: ReservationStatus.PENDING, limit: 100 });
      setReservations(data.items);
    } catch (error) {
      console.error('Failed to fetch pending reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReservations();
  }, []);

  const handleConfirm = async (id: string) => {
    setIsActionLoading(true);
    try {
      await reservationApi.confirm(id);
      await fetchPendingReservations();
    } catch (error) {
      console.error('Failed to confirm reservation:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async (id: string, reason: string) => {
    setIsActionLoading(true);
    try {
      await reservationApi.cancel(id, { reason });
      setIsCancelOpen(false);
      setCancellingId(null);
      await fetchPendingReservations();
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const openCancel = (id: string) => {
    setCancellingId(id);
    setIsCancelOpen(true);
  };

  const filteredReservations = useMemo(() => {
    if (!searchQuery.trim()) return reservations;
    const query = searchQuery.toLowerCase();
    return reservations.filter(res => 
      res.customer.user.name.toLowerCase().includes(query) ||
      res.product.name.toLowerCase().includes(query) ||
      res.id.toLowerCase().includes(query)
    );
  }, [reservations, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4 sm:px-6">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 animate-pulse-subtle">
            <Clock className="w-7 h-7" />
          </div>
          <section>
            <p className="text-amber-600/70 font-semibold tracking-[0.2em] uppercase text-[9px] mb-1">Action Required</p>
            <h1 className="text-4xl font-black text-primary tracking-tighter leading-tight mb-2">Pending Requests</h1>
            <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Filter pending requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-border/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm border border-border/40 rounded-[2rem] p-4 sm:p-8 shadow-sm relative min-h-[400px]">
        <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-4">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            Voucher Queue
          </h3>
          <span className="text-[10px] font-black px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-tighter">
            {filteredReservations.length} items
          </span>
        </div>

        <ReservationList 
          reservations={filteredReservations}
          isLoading={isLoading}
          onConfirm={handleConfirm}
          onCancel={openCancel}
        />
      </div>

      <CancelReservationModal 
        reservationId={cancellingId}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancel}
        isLoading={isActionLoading}
      />
    </div>
  );
};
