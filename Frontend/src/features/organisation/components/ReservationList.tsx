import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  User, 
  ChevronRight,
  Mail,
  Calendar
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { Reservation } from '../types/reservation.types';
import { ReservationStatus } from '../types/reservation.types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

interface ReservationListProps {
  reservations: Reservation[];
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isLoading?: boolean;
}

export const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  onConfirm,
  onCancel,
  onViewDetails,
  isLoading
}) => {
  const navigate = useNavigate();

  const getStatusVariant = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING: return 'warning';
      case ReservationStatus.CONFIRMED: return 'info';
      case ReservationStatus.PICKED_UP: return 'success';
      case ReservationStatus.CANCELLED: return 'error';
      case ReservationStatus.EXPIRED: return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING: return <Clock className="w-3 h-3 mr-1" />;
      case ReservationStatus.CONFIRMED: return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case ReservationStatus.PICKED_UP: return <Package className="w-3 h-3 mr-1" />;
      case ReservationStatus.CANCELLED: return <XCircle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-secondary/20 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-10 bg-secondary/5 rounded-2xl border border-dashed border-border/60">
        <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-muted-foreground">No reservations found</h3>
        <p className="text-xs text-muted-foreground/50">When customers reserve your products, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((reservation) => (
        <div 
          key={reservation.id}
          onClick={() => navigate(`/organisation/reservations/${reservation.id}`)}
          className="group bg-white border border-border/60 hover:border-primary/40 hover:shadow-sm transition-all rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer relative overflow-hidden active:scale-[0.99] active:bg-secondary/5"
        >
          {/* Status highlight bar */}
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-1",
            reservation.status === ReservationStatus.PENDING ? "bg-amber-400" :
            reservation.status === ReservationStatus.CONFIRMED ? "bg-blue-400" :
            reservation.status === ReservationStatus.PICKED_UP ? "bg-emerald-400" :
            "bg-rose-400"
          )} />

          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-secondary/20 rounded-lg overflow-hidden flex-shrink-0 border border-border/40">
              {reservation.product.images?.[0] ? (
                <img 
                  src={reservation.product.images[0].imageUrl} 
                  alt={reservation.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Package className="w-full h-full p-3 text-muted-foreground/40" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-0.5">
                <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors pr-2">
                  {reservation.product.name}
                </h4>
                <Badge variant={getStatusVariant(reservation.status)} className="px-2 py-0 h-4 text-[9px] font-black uppercase tracking-wider">
                  {getStatusIcon(reservation.status)}
                  {reservation.status}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-medium">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{reservation.customer.user.name}</span>
                </div>
                <div className="flex items-center gap-1 border-l border-border/60 pl-3">
                  <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded font-black">
                    Qty: {reservation.quantity}
                  </span>
                </div>
                <div className="flex items-center gap-1 border-l border-border/60 pl-3">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(reservation.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {reservation.status === ReservationStatus.PENDING && (
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 text-[10px] text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-black px-3"
                  onClick={() => onCancel?.(reservation.id)}
                >
                  Reject
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 text-[10px] bg-primary text-white hover:bg-primary/90 font-black px-4 shadow-sm"
                  onClick={() => onConfirm?.(reservation.id)}
                >
                  Confirm
                </Button>
              </div>
            )}
            
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-colors hidden sm:flex"
              onClick={() => navigate(`/organisation/reservations/${reservation.id}`)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
