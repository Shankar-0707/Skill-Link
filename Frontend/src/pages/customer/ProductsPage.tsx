import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../../features/customer/components/layout/Layout";
import { PageHeader, EmptyState } from "../../features/customer/components/ui";
import { productService } from "../../features/customer/services/productService";
import { ReserveProductModal } from "../../features/customer/components/ui/ReserveProductModal";
import type { Product, ListProductsParams } from "../../features/customer/types";
import { Search, Filter, ShoppingBag, Loader2, Package } from "lucide-react";

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<ListProductsParams>({
    search: "",
    page: 1,
    limit: 50,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async (currentParams: ListProductsParams) => {
    setLoading(true);
    try {
      const cleanParams: ListProductsParams = Object.fromEntries(
        Object.entries(currentParams).filter(([, v]) => v !== "" && v !== undefined)
      ) as ListProductsParams;
      const result = await productService.browseProducts(cleanParams);
      
      let items: Product[] = [];
      const res = result as any;
      if (Array.isArray(res)) {
        items = res;
      } else if (res && typeof res === 'object') {
        if (Array.isArray(res.items)) items = res.items;
        else if (res.data && Array.isArray(res.data.items)) items = res.data.items;
        else if (res.data && Array.isArray(res.data)) items = res.data;
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

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10 bg-white p-4 rounded-[2.5rem] border border-border/50 shadow-sm">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" size={20} />
          <input
            type="text"
            placeholder="Search for tools, materials, etc..."
            value={params.search}
            onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-14 pr-6 py-4 bg-secondary/20 rounded-[1.5rem] border-transparent focus:border-foreground/20 focus:bg-white transition-all outline-none font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-6 py-4 rounded-[1.5rem] bg-secondary/30 text-foreground font-bold hover:bg-secondary/50 transition-all border border-transparent shrink-0">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <div className="h-10 w-[1px] bg-border/50 hidden md:block mx-2" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:block">
            {products.length} Products Found
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
                {product.stockQuantity < 10 && (
                  <span className="absolute top-4 left-4 bg-red-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-md">Low Stock</span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5">{product.organisation?.businessName || "Local Shop"}</p>
                  <h3 className="text-lg font-bold text-foreground line-clamp-1 leading-tight">{product.name}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 font-medium mb-6 flex-1">
                  {product.description || "No product description available."}
                </p>

                <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Price</span>
                    <span className="text-2xl font-black text-foreground">₹{product.price.toLocaleString()}</span>
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
          action={{ label: "Reset Search", onClick: () => setParams({ search: "", page: 1, limit: 50 }) }}
        />
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
