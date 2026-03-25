import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import type { Product } from '../types';
import { productsApi } from '../api/productsApi';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onDeleted: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, product, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await productsApi.deleteProduct(product.id);
      onDeleted();
      onClose();
    } catch (err: any) {
      console.error('Delete error', err);
      setError(err?.response?.data?.message || 'Failed to delete product. It may have active reservations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border bg-secondary">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-headline font-bold">Delete Product</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground mb-4">
            Are you sure you want to delete <span className="font-bold text-primary">{product.name}</span>? 
            This action cannot be undone, and will fail if there are active reservations.
          </p>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={onClose} disabled={loading} className="bg-secondary/50 font-bold text-[10px] tracking-widest px-6 border border-border h-10">
              CANCEL
            </Button>
            <Button onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-[10px] tracking-widest px-6 h-10">
              {loading ? 'DELETING...' : 'CONFIRM DELETE'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
