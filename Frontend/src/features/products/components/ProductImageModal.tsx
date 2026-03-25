import React, { useState } from 'react';
import { X, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import type { Product } from '../types';
import { productsApi } from '../api/productsApi';

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onImageUpdate: () => void; // Trigger list refetch
}

export const ProductImageModal: React.FC<ProductImageModalProps> = ({ isOpen, onClose, product, onImageUpdate }) => {
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setLoading(true);
    try {
      await productsApi.addImage(product.id, { imageUrl: newUrl });
      setNewUrl('');
      onImageUpdate();
    } catch (err) {
      console.error('Failed to add image', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    setLoading(true);
    try {
      await productsApi.removeImage(product.id, imageId);
      onImageUpdate();
    } catch (err) {
      console.error('Failed to remove image', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-secondary">
          <div>
            <h2 className="text-xl font-headline font-bold text-primary">Manage Images</h2>
            <p className="text-xs text-muted-foreground mt-1">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleAddImage} className="flex gap-3 items-end bg-secondary/30 p-4 rounded-lg border border-border">
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1">Image URL</label>
              <input 
                required type="url"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-primary focus:outline-none focus:ring-1 focus:ring-ring"
                value={newUrl} onChange={e => setNewUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground font-bold text-[10px] tracking-widest px-6 h-10 shrink-0">
              <Plus className="w-4 h-4 mr-2" /> ADD IMAGE
            </Button>
          </form>

          <div>
            <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4">Current Images ({product.images?.length || 0})</h3>
            {(!product.images || product.images.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
                <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">No images uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {product.images.map(img => (
                  <div key={img.id} className="relative group bg-secondary rounded-lg overflow-hidden border border-border">
                    <img src={img.imageUrl} alt="Product" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={loading}
                        className="bg-destructive text-white p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
