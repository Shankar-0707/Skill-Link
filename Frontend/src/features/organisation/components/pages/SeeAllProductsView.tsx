import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProductList } from "@/features/products/components/ProductList";
import { productsApi } from "@/features/products/api/productsApi";
import type { Product, ListProductsParams } from "@/features/products/types";
import { Search, Plus, Filter, Trash2, AlertTriangle, X, Clock, DollarSign, Package as PackageIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type SortKey = "latest" | "price" | "stock";

const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  { key: "latest", label: "Latest", icon: <Clock size={15} /> },
  { key: "price",  label: "Price",  icon: <DollarSign size={15} /> },
  { key: "stock",  label: "Stock",  icon: <PackageIcon size={15} /> },
];

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const arr = [...products];
  switch (sort) {
    case "latest":
      return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "price":
      return arr.sort((a, b) => a.price - b.price);
    case "stock":
      return arr.sort((a, b) => a.stockQuantity - b.stockQuantity);
    default:
      return arr;
  }
}

export const SeeAllProductsView = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<SortKey>("latest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [params, setParams] = useState<ListProductsParams>({
    search: "",
    page: 1,
    limit: 50,
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSortOpen && !(event.target as Element).closest(".sort-dropdown-container")) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortOpen]);

  const fetchProducts = useCallback(async (currentParams: ListProductsParams) => {
    setIsLoading(true);
    try {
      const cleanParams: ListProductsParams = Object.fromEntries(
        Object.entries(currentParams).filter(([, v]) => v !== "" && v !== undefined)
      ) as ListProductsParams;
      const result = await productsApi.getMyProducts(cleanParams);

      let items: Product[] = [];
      const res = result as any;
      if (Array.isArray(res)) {
        items = res;
      } else if (res && typeof res === "object") {
        if (Array.isArray(res.items)) {
          items = res.items;
        } else if (res.data && Array.isArray(res.data.items)) {
          items = res.data.items;
        } else if (res.data && Array.isArray(res.data)) {
          items = res.data;
        }
      }

      setProducts(items);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [params, fetchProducts]);

  const sortedProducts = useMemo(
    () => sortProducts(products, activeSort),
    [products, activeSort]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await productsApi.remove(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(
        err?.response?.data?.message || "Failed to delete product. Try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const activeSortLabel = SORT_OPTIONS.find(opt => opt.key === activeSort)?.label || "Sort";

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">My Products</h1>
          <p className="text-muted-foreground font-medium max-w-xl text-lg leading-relaxed">
            Manage your entire product catalog, monitor stock levels, and optimize your business performance.
          </p>
        </div>
        <Link
          to="/organisation/products/create"
          className="flex items-center gap-2.5 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group shrink-0"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>Create New Product</span>
        </Link>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2.5rem] border border-border/50 shadow-sm">
        {/* Search */}
        <div className="relative w-full lg:max-w-md group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
            size={20}
          />
          <input
            type="text"
            placeholder="Search products by name..."
            value={params.search}
            onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-14 pr-6 py-4 bg-secondary/20 rounded-[1.5rem] border-transparent focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative sort-dropdown-container w-full lg:w-auto">
          <button 
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] bg-secondary/30 text-foreground font-bold hover:bg-secondary/50 transition-all border border-transparent w-full lg:w-48 shadow-sm group"
          >
            <Filter size={18} className="text-primary group-hover:rotate-180 transition-transform duration-500" />
            <span className="flex-1 text-left">{activeSort === "latest" ? "Filter" : activeSortLabel}</span>
            <Clock size={14} className={cn("text-muted-foreground/40 transition-transform duration-300", isSortOpen && "rotate-180")} />
          </button>

          {isSortOpen && (
            <div className="absolute top-full right-0 mt-3 w-full lg:w-64 bg-white rounded-[1.5rem] border border-border/50 shadow-2xl z-40 p-2 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden backdrop-blur-xl">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Choose Filter</div>
              {SORT_OPTIONS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveSort(key);
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                    activeSort === key
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    activeSort === key ? "bg-primary text-white" : "bg-secondary/50 text-muted-foreground"
                  )}>
                    {icon}
                  </div>
                  {label}
                  {activeSort === key && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn("transition-opacity duration-300", isLoading ? "opacity-60 pointer-events-none" : "opacity-100")}>
        <ProductList
          products={sortedProducts}
          isLoading={isLoading && products.length === 0}
          onEdit={(product) => navigate(`/organisation/products/edit/${product.id}`)}
          onDelete={(product) => { setDeleteError(null); setDeleteTarget(product); }}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all disabled:opacity-40"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center space-y-5">
              <div className="w-16 h-16 bg-red-50 rounded-[1.5rem] flex items-center justify-center">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-foreground">Delete Product?</h2>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-foreground">"{deleteTarget.name}"</span>?
                  {" "}This action cannot be undone.
                </p>
              </div>

              {deleteError && (
                <div className="w-full flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 rounded-[1.25rem] bg-secondary/40 text-foreground font-bold hover:bg-secondary/60 transition-all disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 rounded-[1.25rem] bg-red-500 text-white font-bold hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
