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
  ArrowRight
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
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product details.");
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
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Back Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
          <ChevronLeft size={18} />
        </div>
        <span>Back to Catalog</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Premium Gallery System */}
        <div className="space-y-6">
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-secondary/20 border border-border/50 shadow-inner group">
            {activeImage ? (
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-1000"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-4">
                <Package size={80} strokeWidth={1} />
                <span className="text-xs font-bold uppercase tracking-widest">No Image Available</span>
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 to-transparent" />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={cn(
                    "relative shrink-0 w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300",
                    activeImage === img.imageUrl 
                      ? "border-primary shadow-lg shadow-primary/10 scale-105" 
                      : "border-transparent opacity-60 hover:opacity-100 hover:scale-105 bg-secondary/30"
                  )}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="space-y-8 lg:pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
                Premium Product
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                product.isActive ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
              )}>
                {product.isActive ? "In Stock" : "Unavailable"}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-muted-foreground">Price</span>
              <span className="text-4xl font-black text-primary">₹{product.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-8 bg-white border border-border/60 rounded-[2rem] shadow-sm space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Box size={16} className="text-primary" />
                Product Overview
              </h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {product.description || "Every detail matters. This product has been designed to provide the best possible experience, balancing performance with elegance. Our premium materials and craftsmanship ensure longevity."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Tag size={12} />
                  Category
                </span>
                <p className="font-bold text-foreground">Products</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} />
                  Added on
                </span>
                <p className="font-bold text-foreground">
                  {new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Org Info */}
          {product.organisation && (
            <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                  <Building2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{product.organisation.businessName}</h4>
                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Official Provider</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-primary/40" />
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <Button className="flex-1 h-14 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              Reservations Coming Soon
            </Button>
            <Button variant="outline" className="h-14 aspect-square rounded-2xl border-border/80">
              <Package size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
