import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Filter, Search } from 'lucide-react';
import { reservationApi } from '@/features/organisation/api/reservation.service';
import type { Reservation } from '@/features/organisation/types/reservation.types';
import { ReservationStatus } from '@/features/organisation/types/reservation.types';
import { ReservationList } from '@/features/organisation/components/ReservationList';
import { CancelReservationModal } from '@/features/organisation/components/CancelReservationModal';

export const AllReservationsView: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = filter === 'ALL' ? {} : { status: filter };
      const data = await reservationApi.getIncoming({ ...params, limit: 100 });
      setReservations(data.items);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleConfirm = async (id: string) => {
    setIsActionLoading(true);
    try {
      await reservationApi.confirm(id);
      await fetchReservations();
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
      await fetchReservations();
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
        <section>
          <p className="text-primary/70 font-semibold tracking-[0.2em] uppercase text-[9px] mb-1">Logistics Center</p>
          <h1 className="text-4xl font-black text-primary tracking-tighter leading-tight mb-3">Reservations</h1>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
        </section>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search by customer, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-border/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as ReservationStatus | 'ALL')}
              className="w-full sm:w-44 pl-9 pr-6 py-2 bg-white border border-border/60 rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value={ReservationStatus.PENDING}>Pending</option>
              <option value={ReservationStatus.CONFIRMED}>Confirmed</option>
              <option value={ReservationStatus.PICKED_UP}>Picked Up</option>
              <option value={ReservationStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm border border-border/40 rounded-[2rem] p-4 sm:p-8 shadow-sm">
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
