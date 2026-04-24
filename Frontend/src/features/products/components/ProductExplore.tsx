import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsApi } from "../api/productsApi";
import type { Product } from "../types";
import { 
  Loader2, 
  ChevronLeft, 
  Package, 
  Box, 
  Tag, 
  Calendar,
  Building2,
  AlertCircle,
  ArrowRight,
  Clock
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

export const ProductExplore: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        const data = await productsApi.findOne(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0].imageUrl);
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error?.response?.data?.message || "Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Fetching product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-sm">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{error || "Product Not Found"}</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            We couldn't find the product you're looking for. It might have been removed or is currently unavailable.
          </p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline" className="rounded-xl px-8">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 sm:px-6">
      {/* Header / Back Navigation */}
      <header className="flex items-center justify-between mb-8 pt-6">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
            <ChevronLeft size={16} />
          </div>
          <span>Back to Inventory</span>
        </button>
        <div className="flex items-center gap-3">
            <span className={cn(
               "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
               product.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
            )}>
              {product.isActive ? "Live" : "Inactive"}
            </span>
            <span className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10 shadow-sm">
              PID: {product.id.slice(0, 8)}
            </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Focused Gallery System (Column 5/12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-border/50 shadow-xl group">
            {activeImage ? (
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20 gap-4">
                <Package size={80} strokeWidth={1} />
                <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={cn(
                    "relative shrink-0 w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300",
                    activeImage === img.imageUrl 
                      ? "border-primary shadow-lg scale-105" 
                      : "border-transparent opacity-60 hover:opacity-100 hover:scale-105 bg-secondary/20"
                  )}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Structured Data (Column 7/12) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Identity Section */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-foreground tracking-tight leading-none uppercase">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-primary">₹{product.price.toLocaleString()}</span>
              <div className="h-6 w-px bg-border/50" />
              <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-lg">
                <Box size={14} className="text-primary" />
                <span className="text-xs font-bold text-foreground">{product.stockQuantity} in Stock</span>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="p-6 bg-secondary/10 rounded-2xl border border-border/40 space-y-3">
             <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/20 pb-2">Product Narrative</h3>
             <p className="text-muted-foreground leading-relaxed font-medium text-sm">
                {product.description || "No detailed description available for this catalog item."}
             </p>
          </div>

          {/* Structured Specification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-white border border-border rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Tag size={12} /> Catalog Group
                </span>
                <p className="font-bold text-sm text-foreground">{product.category || "General Products"}</p>
             </div>
             <div className="p-4 bg-white border border-border rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={12} /> Created Record
                </span>
                <p className="font-bold text-sm text-foreground">
                   {new Date(product.createdAt).toLocaleDateString()}
                </p>
             </div>
             <div className="p-4 bg-white border border-border rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={12} /> Last Modified
                </span>
                <p className="font-bold text-sm text-foreground">
                   {new Date(product.updatedAt).toLocaleDateString()}
                </p>
             </div>
             <div className="p-4 bg-white border border-border rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle size={12} /> Availability Rating
                </span>
                <p className="font-bold text-sm text-foreground">
                   {product.stockQuantity > 0 ? "High Priority Support" : "Awaiting Restock"}
                </p>
             </div>
          </div>

          {/* Provider Card */}
          {product.organisation && (
            <div className="p-5 border border-border/80 rounded-2xl flex items-center justify-between bg-white shadow-sm hover:border-primary/40 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-foreground leading-tight">{product.organisation.businessName}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.organisation.businessType}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-muted-foreground/20 group-hover:text-primary transition-all" />
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex gap-4">
            <Button className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all uppercase text-[10px] tracking-widest">
              Initiate Logistics Process
            </Button>
            <Button variant="outline" className="h-12 aspect-square rounded-xl border-border/80 hover:bg-secondary transition-all">
              <Package size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
