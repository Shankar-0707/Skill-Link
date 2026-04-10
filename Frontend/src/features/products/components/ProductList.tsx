import React from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "../types";
import { PackageOpen } from "lucide-react";

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  isLoading, 
  onEdit, 
  onDelete 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-border/50 p-2 h-64 animate-pulse space-y-3">
            <div className="aspect-square bg-secondary/40 rounded-xl" />
            <div className="space-y-2 px-1">
              <div className="h-3 bg-secondary/40 rounded-full w-3/4" />
              <div className="h-3 bg-secondary/40 rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white p-20 rounded-[2.5rem] border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transform rotate-12">
          <PackageOpen size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-foreground tracking-tight">No Products Found</h3>
          <p className="text-muted-foreground max-w-sm font-medium text-sm">
            Begin your business journey by adding your first item to the catalog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
