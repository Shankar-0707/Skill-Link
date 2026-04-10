import React from "react";
import { Package, Trash2, Edit, Eye, Plus } from "lucide-react";
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

  const handleExplore = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/organisation/products/${product.id}/explore`);
  };

  return (
    <div 
      onClick={() => navigate(`/organisation/products/${product.id}/explore`)}
      className="group bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col h-full relative cursor-pointer"
    >
      {/* Image Section - Maintained Square Aspect */}
      <div className="relative aspect-square w-full bg-secondary/10 overflow-hidden">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-1.5 bg-secondary/5 border-b border-border/40">
            <Package size={32} strokeWidth={1} />
            <span className="text-[8px] uppercase tracking-widest font-black">No Media</span>
          </div>
        )}
        
        {/* Minimal Status Badge */}
        <div className="absolute top-2 left-2">
          <div className={cn(
            "w-2 h-2 rounded-full border border-white shadow-sm transition-transform duration-300 group-hover:scale-125",
            product.isActive ? "bg-emerald-500" : "bg-rose-500"
          )} />
        </div>

        {/* Pure Hover Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-end gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-[2px]">
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(product); }}
              className="p-2 bg-white text-primary rounded-lg hover:scale-110 active:scale-95 transition-all shadow-md group/btn"
              title="Quick Edit"
            >
              <Edit size={14} className="group-hover/btn:rotate-12 transition-transform" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(product); }}
              className="p-2 bg-white text-rose-500 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-md group/btn"
              title="Archive Item"
            >
              <Trash2 size={14} className="group-hover/btn:-rotate-12 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Content Section - Compact Typography */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="space-y-0.5">
          <h3 className="text-xs font-black text-primary tracking-tight line-clamp-1 group-hover:text-primary/80 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-foreground/90">₹{product.price.toLocaleString()}</span>
            <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">•</span>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-tighter",
              product.stockQuantity < 5 ? "text-amber-600" : "text-emerald-600"
            )}>
              {product.stockQuantity} STK
            </span>
          </div>
        </div>

        {/* Explore Button - Subtle */}
        <div className="mt-auto pt-2 border-t border-border/40 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <span className="text-[7px] font-bold text-muted-foreground uppercase flex items-center gap-1">
             <Eye size={8} />
             View Logistics
           </span>
           <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform duration-300">
              <Plus size={10} />
           </div>
        </div>
      </div>
    </div>
  );
};
