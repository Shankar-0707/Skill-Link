import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../../features/customer/components/layout/Layout";
import { PageHeader, EmptyState } from "../../features/customer/components/ui";
import { productService } from "../../features/customer/services/productService";
import { ReserveProductModal } from "../../features/customer/components/ui/ReserveProductModal";
import type { Product, ListProductsParams } from "../../features/customer/types";
import { PRODUCT_CATEGORIES } from "../../shared/constants/productCategories";
import { Search, Filter, ShoppingBag, Loader2, Package, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<ListProductsParams>({
    search: "",
    page: 1,
    limit: 8,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async (currentParams: ListProductsParams) => {
    setLoading(true);
    try {
      const cleanParams: ListProductsParams = Object.fromEntries(
        Object.entries(currentParams).filter(([, v]) => v !== "" && v !== undefined)
      ) as ListProductsParams;
      const result = await productService.browseProducts(cleanParams);
      
      let items: Product[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = result as any;
      if (Array.isArray(res)) {
        items = res;
        setTotalPages(1);
      } else if (res && typeof res === 'object') {
        if (Array.isArray(res.items)) {
          items = res.items;
          setTotalPages(res.meta?.totalPages || 1);
        } else if (res.data && Array.isArray(res.data.items)) {
          items = res.data.items;
          setTotalPages(res.data.meta?.totalPages || 1);
        } else if (res.data && Array.isArray(res.data)) {
          items = res.data;
          setTotalPages(1);
        }
      }
      setProducts(items);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [params, fetchProducts]);

  return (
    <Layout>
      <PageHeader 
        title="Products Marketplace" 
        subtitle="Browse and reserve high-quality materials and tools from trusted local shops."
      />

      {/* Search Bar Section (Compact) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 max-w-4xl">
        <div className="relative w-full md:max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <input
            type="text"
            placeholder="Search for tools, materials, etc..."
            value={params.search}
            onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full pl-12 pr-6 py-3.5 bg-surface-container border border-border/80 rounded-2xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-outline focus:ring-4 focus:ring-foreground/5 transition-all outline-none font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group min-w-[160px]">
            <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground pointer-events-none" />
            <select
              value={params.category || ""}
              onChange={(e) => setParams(prev => ({ ...prev, category: e.target.value || undefined, page: 1 }))}
              className="w-full pl-10 pr-10 py-3.5 bg-surface-container border border-border/80 rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:border-outline focus:ring-4 focus:ring-foreground/5 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-transform group-focus-within:rotate-180" />
          </div>
          <div className="h-6 w-[1px] bg-border/50 hidden md:block mx-1" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden md:block">
            {products.length} Items Listed
          </p>
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 size={40} className="animate-spin text-foreground opacity-20" />
          <p className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Marketplace...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div 
              key={product.id}
              className="bg-white rounded-[2rem] overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group flex flex-col h-full"
            >
              <div className="aspect-video relative overflow-hidden bg-secondary/30">
                {product.images?.[0]?.imageUrl ? (
                  <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Package size={48} />
                  </div>
                )}
                {product.stockQuantity === 0 ? (
                  <span className="absolute top-4 left-4 bg-slate-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-md">Out of Stock</span>
                ) : product.stockQuantity < 10 ? (
                  <span className="absolute top-4 left-4 bg-red-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-md">Low Stock</span>
                ) : null}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5">
                    {product.category || "General"} · {product.organisation?.businessName || "Local Shop"}
                  </p>
                  <h3 className="text-lg font-bold text-foreground line-clamp-1 leading-tight">{product.name}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 font-medium mb-6 flex-1">
                  {product.description || "No product description available."}
                </p>

                <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Price</span>
                    <span className="text-2xl font-black text-foreground">₹{(product.price * 1.05).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-md shadow-foreground/10"
                  >
                    <ShoppingBag size={14} />
                    <span>Reserve</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="🔍" 
          title="No products found" 
          description="Try searching for something else or browse different categories."
          action={{ label: "Reset Search", onClick: () => setParams({ search: "", page: 1, limit: 12 }) }}
        />
      )}

      {/* ── Pagination Controls ── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12 pb-8">
          <button
            onClick={() => setParams(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
            disabled={params.page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-all mr-2 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setParams(prev => ({ ...prev, page: page }))}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all
                  ${params.page === page 
                    ? 'bg-foreground text-background shadow-md scale-110 active:scale-95' 
                    : 'bg-background text-muted-foreground border border-border hover:border-outline hover:text-foreground active:scale-95'}`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setParams(prev => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
            disabled={params.page === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-all ml-2 shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedProduct && (
        <ReserveProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onSuccess={() => fetchProducts(params)}
        />
      )}
    </Layout>
  );
};
