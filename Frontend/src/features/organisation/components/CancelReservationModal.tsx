import React, { useState } from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';

interface CancelReservationModalProps {
  reservationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
  isLoading?: boolean;
}

export const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  reservationId,
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }
    if (reservationId) {
      onConfirm(reservationId, reason);
      setReason('');
      setError('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Reservation"
      size="sm"
      footer={
        <div className="flex gap-3 w-full">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 font-bold"
            disabled={isLoading}
          >
            No, Keep it
          </Button>
          <Button 
            variant="outline"
            className="flex-1 bg-rose-600 text-white hover:bg-rose-700 border-transparent font-bold"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-medium leading-tight">
            Are you sure you want to cancel this reservation? This action will refund the customer and release the product stock.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Reason for Cancellation
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., Product is out of stock, business closing early today, etc."
            className="w-full h-32 p-3 rounded-xl border border-border focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none text-sm"
          />
          {error && (
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
