import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Edit2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { cn } from '../../../shared/utils/cn';
import { productsApi } from '../../products/api/productsApi';
import type { Product, CreateProductDto, UpdateProductDto } from '../../products/types';
import { ProductFormModal } from '../../products/components/ProductFormModal';
import { ProductImageModal } from '../../products/components/ProductImageModal';
import { ConfirmDeleteModal } from '../../products/components/ConfirmDeleteModal';

export const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.getMyProducts({ limit: 50 });
      setProducts(data.items);
      setFilteredProducts(data.items);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredProducts(products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        (p.description && p.description.toLowerCase().includes(lowerQuery))
      ));
    }
  }, [searchQuery, products]);

  const handleFormSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    if (selectedProduct) {
      await productsApi.updateProduct(selectedProduct.id, data as UpdateProductDto);
    } else {
      await productsApi.createProduct(data as CreateProductDto);
    }
    fetchProducts();
  };

  return (
    <div className="space-y-8" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline font-bold text-2xl text-primary">Product Inventory</h3>
          <p className="text-muted-foreground text-sm font-medium">Manage your catalogue and stock levels</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 h-10 pl-9 pr-4 rounded-md border border-input bg-secondary text-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[10px] tracking-widest px-6 h-10"
            onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" /> ADD PRODUCT
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-secondary h-72 rounded-2xl border border-border"></div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-secondary/30">
          <h4 className="text-lg font-bold text-muted-foreground">No products found</h4>
          <p className="text-sm font-medium text-muted-foreground mt-2">Adjust your search or add a new product to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-background border border-border rounded-2xl overflow-visible group hover:shadow-xl transition-all duration-300 relative">
              
              {/* Image Section */}
              <div className="h-48 bg-secondary rounded-t-2xl relative overflow-hidden group">
                <img 
                  src={product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1594535182308-8ffefbb6313a?q=80&w=300&auto=format&fit=crop'} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Status Badge */}
                <div className={cn(
                  "absolute top-3 left-3 px-2 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase",
                  product.isActive ? "bg-success text-white" : "bg-muted text-muted-foreground border border-border"
                )}>
                  {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>

                {/* Stock Warning */}
                {product.stockQuantity < 10 && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase bg-warning text-white shadow-md">
                    LOW STOCK
                  </div>
                )}
              </div>

              {/* Action Menu Toggle */}
              <button 
                className="absolute top-48 right-4 -translate-y-1/2 w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground shadow-sm hover:text-primary z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === product.id ? null : product.id);
                }}
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Action Menu Dropdown */}
              {openMenuId === product.id && (
                <div className="absolute right-4 top-[204px] w-48 bg-background border border-border rounded-lg shadow-xl z-20 py-2" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => { setSelectedProduct(product); setIsFormOpen(true); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary text-sm font-medium flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-3 text-muted-foreground" /> Edit Details
                  </button>
                  <button 
                    onClick={() => { setSelectedProduct(product); setIsImageOpen(true); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary text-sm font-medium flex items-center"
                  >
                    <ImageIcon className="w-4 h-4 mr-3 text-muted-foreground" /> Manage Images
                  </button>
                  <button 
                    onClick={() => { setSelectedProduct(product); setIsDeleteOpen(true); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#ffedea] text-sm font-medium flex items-center text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-3" /> Delete Product
                  </button>
                </div>
              )}

              {/* Details Section */}
              <div className="p-6 pt-5">
                <p className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase mb-1">SKU-{product.id.split('-')[0]}</p>
                <h4 className="font-bold text-primary mb-6 h-10 line-clamp-2 pr-8">{product.name}</h4>
                
                <div className="flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">Stock Count</p>
                    <p className="text-lg font-bold text-primary leading-none mt-1">{product.stockQuantity} <span className="text-xs text-muted-foreground">Units</span></p>
                  </div>
                  <div className="text-right bg-secondary px-3 py-1.5 rounded-lg">
                    <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-0.5">Price</p>
                    <p className="text-sm font-bold text-primary font-body tracking-tight">${Number(product.price).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProductFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        product={selectedProduct} 
        onSubmit={handleFormSubmit}
      />
      
      <ProductImageModal 
        isOpen={isImageOpen} 
        onClose={() => setIsImageOpen(false)} 
        product={selectedProduct} 
        onImageUpdate={fetchProducts}
      />

      <ConfirmDeleteModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        product={selectedProduct} 
        onDeleted={fetchProducts}
      />
    </div>
  );
};
