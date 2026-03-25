import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>;
  product?: Product | null; // If provided, we are editing
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSubmit, product }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setStockQuantity(product.stockQuantity.toString());
      setIsActive(product.isActive);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setStockQuantity('');
      setIsActive(true);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await onSubmit({
          name, 
          description, 
          price: parseFloat(price), 
          stockQuantity: parseInt(stockQuantity, 10),
          isActive
        } as UpdateProductDto);
      } else {
        await onSubmit({
          name, 
          description, 
          price: parseFloat(price), 
          stockQuantity: parseInt(stockQuantity, 10)
        } as CreateProductDto);
      }
      onClose();
    } catch (err) {
      console.error('Submit error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-secondary">
          <h2 className="text-xl font-headline font-bold text-primary">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1">Product Name</label>
            <input 
              required
              className="w-full h-10 px-3 rounded-md border border-input bg-secondary text-primary focus:outline-none focus:ring-1 focus:ring-ring"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Premium Brake Pads"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-input bg-secondary text-primary focus:outline-none focus:ring-1 focus:ring-ring"
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Short description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1">Price ($)</label>
              <input 
                required type="number" step="0.01" min="0"
                className="w-full h-10 px-3 rounded-md border border-input bg-secondary text-primary focus:outline-none focus:ring-1 focus:ring-ring"
                value={price} onChange={e => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1">Stock QTY</label>
              <input 
                required type="number" min="0"
                className="w-full h-10 px-3 rounded-md border border-input bg-secondary text-primary focus:outline-none focus:ring-1 focus:ring-ring"
                value={stockQuantity} onChange={e => setStockQuantity(e.target.value)}
              />
            </div>
          </div>

          {product && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <input 
                type="checkbox" id="isActive"
                checked={isActive} onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-primary">Active Listing</label>
            </div>
          )}

          <div className="pt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="bg-secondary/50 font-bold text-[10px] tracking-widest px-6 border border-border h-10">
              CANCEL
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] tracking-widest px-6 h-10">
              {loading ? 'SAVING...' : 'SAVE PRODUCT'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
