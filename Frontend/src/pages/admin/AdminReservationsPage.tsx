import { useEffect, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  PackageCheck,
  RefreshCcw,
} from 'lucide-react';
import { adminApi } from '../../features/admin/api/admin';
import type { RecentReservation } from '../../features/admin/types';
import { cn } from '@/shared/utils/cn';

const formatReservationStatusLabel = (status: string) => status.replace('_', ' ');

const formatReservationDate = (date: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));

const getReservationStatusClassName = (status: string) =>
  cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
    status === 'CONFIRMED'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'PENDING'
        ? 'bg-amber-50 text-amber-700'
        : status === 'PICKED_UP'
          ? 'bg-blue-50 text-blue-700'
          : 'bg-slate-100 text-slate-700',
  );

export const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getReservations();
      setReservations(response);
      setError(null);
    } catch {
      setError('Unable to load reservations right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReservations();
  }, []);

  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#001F3F] tracking-tight">
            Reservations
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Latest reservation activity across all listed marketplace products.
          </p>
        </div>
        <button
          onClick={() => void loadReservations()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#001F3F] rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#001F3F]" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading reservations...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <CalendarCheck className="h-10 w-10 text-gray-300 mx-auto" />
          <h2 className="mt-4 text-lg font-bold text-[#001F3F]">
            No reservations found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Reservation activity will appear here as customers reserve products.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr_0.9fr] gap-4 px-6 py-4 border-b border-gray-100 bg-[#fcfcfc] text-[11px] font-bold uppercase tracking-wider text-gray-500">
            <span>Product</span>
            <span>Organisation</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Qty</span>
            <span>Updated</span>
          </div>
          <div className="divide-y divide-gray-100">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr_0.9fr] gap-4 px-6 py-5 items-center hover:bg-[#f8f9fb] transition-colors"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {reservation.productName}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Reservation ID: {reservation.id.slice(0, 8)}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {reservation.organisationName}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {reservation.customerName}
                </p>
                <div>
                  <span className={getReservationStatusClassName(reservation.status)}>
                    {reservation.status === 'CONFIRMED' && <CheckCircle2 size={12} />}
                    {reservation.status === 'PENDING' && <Clock size={12} />}
                    {reservation.status === 'PICKED_UP' && <PackageCheck size={12} />}
                    {formatReservationStatusLabel(reservation.status)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {reservation.quantity}
                </p>
                <p className="text-xs font-semibold text-gray-400">
                  {formatReservationDate(reservation.date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
