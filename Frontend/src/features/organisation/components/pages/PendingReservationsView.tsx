import React, { useEffect, useState } from 'react';
import { reservationApi } from '@/features/organisation/api/reservation.service';
import type { Reservation } from '@/features/organisation/types/reservation.types';
import { ReservationStatus } from '@/features/organisation/types/reservation.types';
import { ReservationList } from '@/features/organisation/components/ReservationList';
import { ReservationDetailsModal } from '@/features/organisation/components/ReservationDetailsModal';
import { CancelReservationModal } from '@/features/organisation/components/CancelReservationModal';
import { Clock } from 'lucide-react';

export const PendingReservationsView: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchPendingReservations = async () => {
    setIsLoading(true);
    try {
      const data = await reservationApi.getIncoming({ status: ReservationStatus.PENDING });
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
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100/80 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-200/50">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Pending Reservations</h1>
            <p className="text-muted-foreground mt-1 font-medium">Review and confirm customer reservations to finalize the process.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between group overflow-hidden relative">
          <div className="space-y-1 z-10">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Awaiting Review</p>
            <p className="text-4xl font-black text-foreground">{reservations.length}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <Clock size={120} />
          </div>
        </div>
        
        {/* Placeholder for other stats */}
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between opacity-60 grayscale group">
           <div className="space-y-1">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Conf. Rate</p>
            <p className="text-4xl font-black text-emerald-800">--%</p>
          </div>
        </div>

        <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col justify-between opacity-60 grayscale group">
           <div className="space-y-1">
            <p className="text-xs font-bold text-rose-700 uppercase tracking-widest">Avg. Stock</p>
            <p className="text-4xl font-black text-rose-800">--</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative min-h-[400px]">
        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
          Review List
          <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">{reservations.length}</span>
        </h3>
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
