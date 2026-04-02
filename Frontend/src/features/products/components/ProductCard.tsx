import React from "react";
import { Package, Trash2, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { cn } from "@/shared/utils/cn";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const mainImage = product.images?.[0]?.imageUrl || "";

  return (
    <div className="group bg-white rounded-[2rem] border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col h-full relative">
      {/* Image Section */}
      <div className="relative h-72 w-full bg-secondary/20 overflow-hidden">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
            <Package size={40} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest font-bold">No Image</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border",
            product.isActive 
              ? "bg-green-500/10 text-green-600 border-green-500/20" 
              : "bg-red-500/10 text-red-600 border-red-500/20"
          )}>
            {product.isActive ? "Active" : "Archived"}
          </span>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          {onEdit && (
            <button 
              onClick={() => onEdit(product)}
              className="p-3 bg-white rounded-2xl text-primary hover:scale-110 active:scale-95 transition-all shadow-lg"
              title="Edit Product"
            >
              <Edit size={18} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(product)}
              className="p-3 bg-white rounded-2xl text-red-500 hover:scale-110 active:scale-95 transition-all shadow-lg"
              title="Delete Product"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-primary/60 uppercase tracking-widest">
            
            <div className="flex items-center gap-8 text-amber-500">
          <h3 className="text-xl font-extrabold text-foreground line-clamp-1 leading-tight">{product.name}</h3>
              {/* <Star size={12} fill="currentColor" />
              <span>{(product.ratingAvg ?? 0).toFixed(1)}</span> */} 
              {/* rating ke liye h ye  */}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
          {product.description || "No description provided for this premium product."}
        </p>

        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Price</span>
            <span className="text-2xl font-black text-foreground">
              ₹{product.price.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">In Stock</span>
              <span className={cn(
                "text-sm font-bold",
                product.stockQuantity < 5 ? "text-orange-500" : "text-foreground"
              )}>
                {product.stockQuantity} units
              </span>
            </div>
            
            <button
              onClick={() => navigate(`/organisation/products/${product.id}/explore`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all border border-primary/10"
            >
              <Eye size={12} />
              <span>See More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
