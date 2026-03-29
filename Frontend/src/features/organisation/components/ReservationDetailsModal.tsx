import { 
  Package, 
  User, 
  CreditCard, 
  Info,
  Phone,
  Mail,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/modal';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { Reservation } from '../types/reservation.types';
import { ReservationStatus } from '../types/reservation.types';

interface ReservationDetailsModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onConfirm,
  onCancel
}) => {
  if (!reservation) return null;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reservation Details"
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="font-bold">
            Close
          </Button>
          {reservation.status === ReservationStatus.PENDING && (
            <>
              <Button 
                variant="outline" 
                className="text-rose-600 border-rose-100 hover:bg-rose-50 font-bold"
                onClick={() => {
                  onCancel?.(reservation.id);
                  onClose();
                }}
              >
                Cancel Reservation
              </Button>
              <Button 
                onClick={() => {
                  onConfirm?.(reservation.id);
                  onClose();
                }}
                className="font-bold shadow-lg shadow-primary/20"
              >
                Confirm Reservation
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product Information
            </h3>
            <div className="bg-secondary/10 p-4 rounded-xl border border-secondary/20 flex gap-4">
              <div className="w-20 h-20 bg-white rounded-lg border border-border overflow-hidden flex-shrink-0">
                {reservation.product.images?.[0] ? (
                  <img src={reservation.product.images[0].imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-full h-full p-6 text-muted-foreground/30" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-lg">{reservation.product.name}</h4>
                <p className="text-primary font-bold">₹{reservation.product.price.toLocaleString()}</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="font-bold">
                    Quantity: {reservation.quantity}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Reservation Status
            </h3>
            <div className="flex items-center gap-3">
              <Badge variant={getStatusVariant(reservation.status)} className="px-4 py-1 text-sm font-bold">
                {reservation.status}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                Last updated: {new Date(reservation.updatedAt).toLocaleString()}
              </span>
            </div>
            {reservation.status === ReservationStatus.CANCELLED && reservation.cancelReason && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-sm">
                <span className="font-bold block mb-1">Cancellation Reason:</span>
                {reservation.cancelReason}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {reservation.customer.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{reservation.customer.user.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">Customer ID: {reservation.customerId.split('-')[0]}</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Mail className="w-4 h-4" />
                  {reservation.customer.user.email}
                </div>
                {reservation.customer.user.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Phone className="w-4 h-4" />
                    {reservation.customer.user.phone}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment & Escrow
            </h3>
            <div className="bg-secondary/5 border border-border p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold text-lg text-foreground">₹{(reservation.product.price * reservation.quantity).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Escrow Status</span>
                <Badge variant={reservation.escrow?.status === 'HELD' ? 'info' : 'success'} className="font-bold">
                  {reservation.escrow?.status || 'NOT CREATED'}
                </Badge>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
};
