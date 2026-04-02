import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  User, 
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { Reservation } from '../types/reservation.types';
import { ReservationStatus } from '../types/reservation.types';

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
      case ReservationStatus.PENDING: return <Clock className="w-3.5 h-3.5 mr-1" />;
      case ReservationStatus.CONFIRMED: return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case ReservationStatus.PICKED_UP: return <Package className="w-3.5 h-3.5 mr-1" />;
      case ReservationStatus.CANCELLED: return <XCircle className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-secondary/20 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/10 rounded-2xl border-2 border-dashed border-secondary">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-bold text-muted-foreground">No reservations found</h3>
        <p className="text-sm text-muted-foreground/60">When customers reserve your products, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <div 
          key={reservation.id}
          className="group bg-white border border-border hover:border-primary/30 hover:shadow-md transition-all rounded-xl p-5 flex items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-secondary/30 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
              {reservation.product.images?.[0] ? (
                <img 
                  src={reservation.product.images[0].imageUrl} 
                  alt={reservation.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-full h-full p-4 text-muted-foreground/50" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                  {reservation.product.name}
                </h4>
                <Badge variant={getStatusVariant(reservation.status)} className="font-bold">
                  {getStatusIcon(reservation.status)}
                  {reservation.status}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{reservation.customer.user.name}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-xs font-bold px-1.5 py-0.5 bg-secondary rounded text-foreground">
                    Qty: {reservation.quantity}
                  </span>
                </div>
                <div className="text-xs font-medium">
                  Reserved {new Date(reservation.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {reservation.status === ReservationStatus.PENDING && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-100 font-bold"
                  onClick={() => onCancel?.(reservation.id)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="bg-primary text-white hover:bg-primary/90 font-bold shadow-sm"
                  onClick={() => onConfirm?.(reservation.id)}
                >
                  Confirm
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50"
              onClick={() => onViewDetails?.(reservation.id)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
