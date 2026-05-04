import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "@/features/products/api/productsApi";
import { reservationApi } from "@/features/organisation/api/reservation.service";
import type { Product } from "@/features/products/types";
import type { Reservation } from "@/features/organisation/types/reservation.types";
import { ReservationStatus } from "@/features/organisation/types/reservation.types";
import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Loader2, Package, PlusSquare, CalendarDays, DollarSign, ChevronRight, User, AlertCircle, Search } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export const OrganisationDashboardView = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [totalReservationsCount, setTotalReservationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const PRODUCTS_PER_PAGE = 4;
  const MAX_PAGES = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageMostBought, setCurrentPageMostBought] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [productsRes, pendingRes, allReservationsRes] = await Promise.all([
          productsApi.getMyProducts({ limit: 1000 }),
          reservationApi.getIncoming({ status: ReservationStatus.PENDING }),
          reservationApi.getIncoming({ limit: 1 })
        ]);
        
        // Handle products
        let items: Product[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = productsRes as any;
        if (Array.isArray(res)) {
          items = res;
        } else if (res && typeof res === "object") {
          if (Array.isArray(res.items)) items = res.items;
          else if (res.data && Array.isArray(res.data.items)) items = res.data.items;
          else if (res.data && Array.isArray(res.data)) items = res.data;
        }
        setProducts(items);

        // Handle reservations
        setReservations(pendingRes.items || []);
        setTotalReservationsCount(allReservationsRes.meta?.total || 0);

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Process data for the cumulative growth chart
  const chartData = useMemo(() => {
    if (products.length === 0) return [];

    const sorted = [...products].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const dailyCounts: Record<string, number> = {};
    sorted.forEach((p) => {
      const dateStr = format(parseISO(p.createdAt), "MMM dd");
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
    });

    let total = 0;
    const data = Object.entries(dailyCounts).map(([date, count]) => {
      total += count;
      return {
        date,
        totalProducts: total,
        newToday: count,
      };
    });

    return data;
  }, [products]);

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
  const totalProducts = products.length;

  // Search and Filtering Logic
  const filteredProductsBase = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const filteredReservationsList = useMemo(() => {
    if (!searchQuery.trim()) return reservations;
    const query = searchQuery.toLowerCase();
    return reservations.filter(res => 
      res.customer?.user?.name?.toLowerCase().includes(query) ||
      res.product?.name?.toLowerCase().includes(query)
    );
  }, [reservations, searchQuery]);

  // Pagination Logic - Recent
  const totalDisplayableProducts = Math.min(filteredProductsBase.length, PRODUCTS_PER_PAGE * MAX_PAGES);
  const totalPages = Math.ceil(totalDisplayableProducts / PRODUCTS_PER_PAGE);
  const displayedProducts = filteredProductsBase.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  // Pagination Logic - Most Bought
  const mostBoughtProducts = useMemo(() => {
    const sorted = [...filteredProductsBase].sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    return sorted;
  }, [filteredProductsBase]);

  const totalDisplayMostBought = Math.min(mostBoughtProducts.length, PRODUCTS_PER_PAGE * MAX_PAGES);
  const totalPagesMostBought = Math.ceil(totalDisplayMostBought / PRODUCTS_PER_PAGE);
  const displayedMostBought = mostBoughtProducts.slice((currentPageMostBought - 1) * PRODUCTS_PER_PAGE, currentPageMostBought * PRODUCTS_PER_PAGE);

  // Helper Pagination Component
  const PaginationControls = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
    if (total <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-1.5 mt-6 py-2">
            <button 
                onClick={() => onPageChange(Math.max(1, current - 1))}
                disabled={current === 1}
                className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground hover:text-primary hover:border-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted-foreground transition-all duration-300"
            >
                <ChevronRight size={16} className="rotate-180" />
            </button>
            
            <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: total }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            "w-8 h-8 rounded-lg text-[11px] font-black transition-all duration-300 border",
                            current === page 
                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105 z-10" 
                                : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                        )}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button 
                onClick={() => onPageChange(Math.min(total, current + 1))}
                disabled={current === total}
                className="p-1.5 rounded-lg border border-border bg-white text-muted-foreground hover:text-primary hover:border-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted-foreground transition-all duration-300"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
  };

  const ProductCard = ({ p }: { p: Product }) => {
    const isLowStock = p.stockQuantity < 10;
    return (
        <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border group transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:translate-y-[-2px] cursor-pointer animate-in fade-in slide-in-from-bottom-3 duration-500" onClick={() => navigate(`/organisation/products/edit/${p.id}`)}>
            <div className="h-32 overflow-hidden relative bg-secondary/20">
            {p.images?.[0]?.imageUrl ? (
                <img 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                src={p.images[0].imageUrl} 
                alt={p.name}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/20">
                <Package size={32} />
                </div>
            )}
            
            <div className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg shadow-sm backdrop-blur-md ${isLowStock ? 'bg-orange-500/90 text-white' : 'bg-green-500/90 text-white'}`}>
                {isLowStock ? 'Low Stock' : 'In Stock'}
            </div>

            </div>
            <div className="p-4 space-y-2">
            <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">{p.category || "Product"}</p>
            <h4 className="text-sm font-bold text-foreground line-clamp-1">{p.name}</h4>
            <div className="flex justify-between items-end pt-3 border-t border-secondary/50 mt-3">
                <div>
                <p className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase mb-0.5">Quantity</p>
                <p className={`text-base font-black tracking-tighter ${isLowStock ? 'text-orange-500' : 'text-foreground'}`}>
                    {p.stockQuantity} <span className="text-[10px] font-medium text-muted-foreground tracking-normal">Units</span>
                </p>
                </div>
                <span className="text-primary font-black text-base">₹{p.price}</span>
            </div>
            </div>
        </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 px-4 sm:px-6 animate-in fade-in duration-700">
      
      {/* Hero Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6 mb-8">
        <section>
          <p className="text-primary/70 font-semibold tracking-[0.2em] uppercase text-[9px] mb-1">Management Console</p>
          <h1 className="text-3xl font-black text-primary tracking-tighter leading-tight mb-3">Operations Overview</h1>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
        </section>

        <div className="relative w-full max-w-sm group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search products, customers..."
            className="block w-full pl-10 pr-4 py-2 bg-white border border-border/60 rounded-xl text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
              setCurrentPageMostBought(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading dashboard metrics...</p>
        </div>
      ) : (
        <>
          {/* Top Grid: Analytics & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Chart Area */}
            <div className="col-span-1 lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-border/40">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-primary tracking-tight">Catalog Analytics</h2>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">Growth of products in your inventory</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-secondary/30 rounded-full text-[9px] font-bold uppercase tracking-wider text-slate-500 hidden sm:inline-block">Total Products: {totalProducts}</span>
                  <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-bold uppercase tracking-wider">Growth View</span>
                </div>
              </div>

              <div className="h-52 pt-2">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <RechartsTooltip 
                        cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.2 }}
                        contentStyle={{ 
                          borderRadius: '0.75rem', 
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                      />
                      <Bar 
                        dataKey="totalProducts" 
                        fill="url(#barGradient)" 
                        radius={[3, 3, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                     <p className="text-xs text-muted-foreground font-medium">Not enough data to display growth chart.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Stock Value */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-5">
              
              <div className="bg-primary text-white p-5 rounded-2xl flex-1 flex flex-col justify-between shadow-lg shadow-primary/20 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-0.5">Quick Actions</h3>
                  <p className="text-[11px] text-white/70 font-medium">Manage your shop operations efficiently</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
                  <button onClick={() => navigate('/organisation/products/create')} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all">
                    <PlusSquare size={20} className="mb-0.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-center">Add Product</span>
                  </button>
                  <button onClick={() => navigate('/organisation/reservations/pending')} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all">
                    <CalendarDays size={20} className="mb-0.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-center">Reservations</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Middle Row: Reservations & Staff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            {/* Reservations Queue */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-lg font-bold tracking-tight text-foreground">Pending Reservations</h2>
                <button onClick={() => navigate('/organisation/reservations/pending')} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  View All <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {filteredReservationsList.length > 0 ? (
                  filteredReservationsList.slice(0, 3).map((res) => (
                    <div key={res.id} className="bg-white p-4 rounded-xl border-l-[4px] border-primary shadow-sm hover:translate-y-[-1px] transition-all flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{res.customer?.user?.name || `Customer #${res.id.substring(0,6)}`}</p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{res.product?.name || "Product"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-amber-600 px-2.5 py-0.5 bg-amber-50 rounded-full border border-amber-100">Pending</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-5 rounded-xl border border-border border-dashed flex flex-col items-center justify-center text-center text-muted-foreground py-8 h-36">
                    <AlertCircle size={24} className="mb-1.5 opacity-40" />
                    <p className="text-xs font-bold">No pending reservations</p>
                    <p className="text-[10px] font-medium mt-0.5">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-center gap-6">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Estimated Revenue</p>
                    <p className="text-2xl font-black text-foreground tracking-tighter">₹{totalValue.toLocaleString()}</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-secondary/20 rounded-xl border border-border/40">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Inventory Status</p>
                    <p className="text-base font-bold text-foreground">{totalProducts} SKUs</p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-xl border border-border/40">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Orders</p>
                    <p className="text-base font-bold text-foreground">{totalReservationsCount} Requests</p>
                  </div>
               </div>
            </div>

          </div>

          {/* Section 1: Recent Products */}
          <section className="mt-10 space-y-6">
            <div className="flex justify-between items-end px-1">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Products</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Latest items updated in your catalog</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hidden sm:block">
                  Showing {Math.min(displayedProducts.length, PRODUCTS_PER_PAGE)} of {totalDisplayableProducts}
                </p>
                <button onClick={() => navigate('/organisation/products/see_all')} className="bg-primary text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/20 flex items-center gap-2">
                  Manage All <ChevronRight size={12} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[300px]">
              {displayedProducts.length > 0 ? displayedProducts.map((p) => (
                <ProductCard key={p.id} p={p} />
              )) : products.length === 0 && !isLoading ? (
                <div className="col-span-full bg-secondary/10 rounded-2xl border border-border border-dashed p-10 flex flex-col items-center justify-center text-center">
                    <Package size={40} className="text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-bold text-foreground">No products found</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Start by adding your first product.</p>
                </div>
              ) : (
                [1,2,3,4].map(idx => (
                  <div key={idx} className="bg-secondary/10 rounded-2xl h-[280px] animate-pulse border border-border flex items-center justify-center text-muted-foreground/30">
                     <Package size={32} />
                  </div>
                ))
              )}
            </div>

            <PaginationControls 
                current={currentPage} 
                total={totalPages} 
                onPageChange={setCurrentPage} 
            />
          </section>

          {/* Section 2: Best Selling Products */}
          <section className="mt-14 space-y-6">
            <div className="flex justify-between items-end px-1">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Best Selling Products</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Products with high customer engagement</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hidden sm:block">
                  Showing {Math.min(displayedMostBought.length, PRODUCTS_PER_PAGE)} of {totalDisplayMostBought}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[300px]">
              {displayedMostBought.length > 0 ? displayedMostBought.map((p) => (
                <ProductCard key={p.id} p={p} />
              )) : products.length === 0 && !isLoading ? (
                <div className="col-span-full bg-secondary/10 rounded-2xl border border-border border-dashed p-10 flex flex-col items-center justify-center text-center">
                    <Package size={40} className="text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-bold text-foreground">No popular products yet</p>
                </div>
              ) : (
                [1,2,3,4].map(idx => (
                  <div key={idx} className="bg-secondary/10 rounded-2xl h-[280px] animate-pulse border border-border flex items-center justify-center text-muted-foreground/30">
                     <Package size={32} />
                  </div>
                ))
              )}
            </div>

            <PaginationControls 
                current={currentPageMostBought} 
                total={totalPagesMostBought} 
                onPageChange={setCurrentPageMostBought} 
            />
          </section>

        </>
      )}
    </div>
  );
};
