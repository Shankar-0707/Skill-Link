import { 
  Package, 
  User, 
  CreditCard, 
  Info,
  Phone,
  Mail,
  Tag,
  Layers,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/modal';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { Reservation } from '../types/reservation.types';
import { ReservationStatus } from '../types/reservation.types';
import React from 'react';

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
      case ReservationStatus.PENDING:   return 'warning';
      case ReservationStatus.CONFIRMED: return 'info';
      case ReservationStatus.PICKED_UP: return 'success';
      case ReservationStatus.CANCELLED: return 'error';
      case ReservationStatus.EXPIRED:   return 'secondary';
      default: return 'default';
    }
  };

  const baseAmount = reservation.product.price * reservation.quantity;
  const platformFee = reservation.platformFee ?? (baseAmount * 0.05);
  const totalAmount = reservation.totalAmount ?? (baseAmount + platformFee);
  const productImages = reservation.product.images ?? [];

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
                onClick={() => { onCancel?.(reservation.id); onClose(); }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={() => { onConfirm?.(reservation.id); onClose(); }}
                className="font-bold shadow-lg shadow-primary/20"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm Reservation
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* ── Product Hero ────────────────────────────────────────── */}
        <section className="bg-secondary/10 rounded-2xl overflow-hidden border border-secondary/20">
          {/* Image gallery */}
          {productImages.length > 0 ? (
            <div className="relative h-52 w-full overflow-hidden bg-secondary/30">
              <img
                src={productImages[0].imageUrl}
                alt={reservation.product.name}
                className="w-full h-full object-cover"
              />
              {productImages.length > 1 && (
                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  {productImages.slice(1).map((img, i) => (
                    <img
                      key={img.id ?? i}
                      src={img.imageUrl}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-md"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-40 w-full flex items-center justify-center bg-secondary/20">
              <Package className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}

          {/* Product details */}
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground leading-tight">{reservation.product.name}</h3>
                {reservation.product.category && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {reservation.product.category}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-2xl font-black text-primary tracking-tighter shrink-0">
                ₹{reservation.product.price.toLocaleString()}
              </span>
            </div>

            {reservation.product.description && (
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {reservation.product.description}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2 border-t border-secondary/30">
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Stock:</span>
                <span className={reservation.product.stockQuantity < 10 ? 'text-orange-500' : 'text-foreground'}>
                  {reservation.product.stockQuantity} units
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reserved:</span>
                <span className="text-foreground">{reservation.quantity} units</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Reservation Status ───────────────────────────────── */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4" />
              Reservation Status
            </h3>
            <div className="bg-secondary/5 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant={getStatusVariant(reservation.status)} className="px-4 py-1 text-sm font-bold">
                  {reservation.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground font-medium space-y-1">
                <p>Reserved: {new Date(reservation.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(reservation.updatedAt).toLocaleString()}</p>
                {reservation.expiresAt && (
                  <p className="text-amber-600">Expires: {new Date(reservation.expiresAt).toLocaleString()}</p>
                )}
              </div>
              {reservation.status === ReservationStatus.CANCELLED && reservation.cancelReason && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-sm">
                  <span className="font-bold block mb-1">Cancellation Reason:</span>
                  {reservation.cancelReason}
                </div>
              )}
            </div>
          </section>

          {/* ── Customer + Payment ───────────────────────────────── */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="bg-secondary/5 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-base">
                  {reservation.customer.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-foreground">{reservation.customer.user.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">ID: {reservation.customerId.split('-')[0]}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  {reservation.customer.user.email}
                </div>
                {reservation.customer.user.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Phone className="w-3.5 h-3.5" />
                    {reservation.customer.user.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Payment summary */}
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mt-4">
              <CreditCard className="w-4 h-4" />
              Payment Summary
            </h3>
            <div className="bg-secondary/5 border border-border rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Unit Price</span>
                <span className="font-bold">₹{reservation.product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-bold">× {reservation.quantity}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border text-sm font-medium">
                <span className="text-muted-foreground">Customer Paid</span>
                <span className="font-bold">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-violet-600 font-bold">Platform Fee (5%)</span>
                <span className="font-bold text-violet-600">₹{platformFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border text-base font-bold">
                <span className="text-emerald-600">Your Payout</span>
                <span className="text-xl font-black text-emerald-600">₹{baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {reservation.escrow && (
                <div className="flex justify-between items-center text-sm font-medium pt-1">
                  <span className="text-muted-foreground">Escrow</span>
                  <Badge variant={reservation.escrow.status === 'HELD' ? 'info' : 'success'} className="font-bold text-xs">
                    {reservation.escrow.status}
                  </Badge>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
};
