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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-[2.5rem] border border-border/50 p-6 h-96 animate-pulse space-y-6">
            <div className="h-48 bg-secondary/40 rounded-3xl" />
            <div className="space-y-3">
              <div className="h-6 bg-secondary/40 rounded-full w-3/4" />
              <div className="h-4 bg-secondary/40 rounded-full w-1/2" />
            </div>
            <div className="pt-4 border-t border-border/50 flex justify-between">
              <div className="h-8 bg-secondary/40 rounded-xl w-1/3" />
              <div className="h-8 bg-secondary/40 rounded-xl w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white p-20 rounded-[3rem] border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center transform rotate-12">
          <PackageOpen size={48} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-foreground">No Products Found</h3>
          <p className="text-muted-foreground max-w-sm font-medium">
            You haven't listed any products yet. Start your business journey by adding your first item to the catalog.
          </p>
        </div>
        <button className="px-8 py-4 bg-primary text-white rounded-[1.25rem] font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          Add First Product
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
