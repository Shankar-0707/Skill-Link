import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { reservationApi } from '@/features/organisation/api/reservation.service';
import type { Reservation } from '@/features/organisation/types/reservation.types';
import { ReservationStatus } from '@/features/organisation/types/reservation.types';
import { ReservationList } from '@/features/organisation/components/ReservationList';
import { ReservationDetailsModal } from '@/features/organisation/components/ReservationDetailsModal';
import { CancelReservationModal } from '@/features/organisation/components/CancelReservationModal';

export const AllReservationsView: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL');
  
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const params = filter === 'ALL' ? {} : { status: filter };
      const data = await reservationApi.getIncoming(params);
      setReservations(data.items);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filter]);

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

  const openDetails = (id: string) => {
    const res = reservations.find(r => r.id === id);
    if (res) {
      setSelectedReservation(res);
      setIsDetailsOpen(true);
    }
  };

  const openCancel = (id: string) => {
    setCancellingId(id);
    setIsCancelOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Reservations</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage all incoming product reservations from your customers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="pl-9 pr-4 py-2 bg-white border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 appearance-none min-w-[160px]"
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

      <div className="bg-white border border-border rounded-[2rem] p-8 shadow-sm overflow-hidden relative">
        <ReservationList 
          reservations={reservations}
          isLoading={isLoading}
          onConfirm={handleConfirm}
          onCancel={openCancel}
          onViewDetails={openDetails}
        />
      </div>

      <ReservationDetailsModal 
        reservation={selectedReservation}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onConfirm={handleConfirm}
        onCancel={openCancel}
      />

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
