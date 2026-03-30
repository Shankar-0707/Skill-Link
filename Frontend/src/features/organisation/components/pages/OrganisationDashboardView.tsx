import  { useEffect, useState, useMemo } from "react";
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
import { Loader2, Package, PlusSquare, CalendarDays, DollarSign, ChevronRight, User, AlertCircle } from "lucide-react";


export const OrganisationDashboardView = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [productsRes, authRes] = await Promise.all([
          productsApi.getMyProducts({ limit: 1000 }),
          reservationApi.getIncoming({ status: ReservationStatus.PENDING })
        ]);
        
        // Handle products
        let items: Product[] = [];
        const res = productsRes as any;
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

        // Handle reservations
        setReservations(authRes.items || []);

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

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 px-4 sm:px-6 animate-in fade-in duration-700">
      
      {/* Hero Header */}
      <section className="pt-8 mb-12">
        <p className="text-primary/70 font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">Management Console</p>
        <h1 className="text-5xl font-black text-primary tracking-tighter leading-tight mb-4">Operations Overview</h1>
        <div className="w-24 h-1.5 bg-primary rounded-full"></div>
      </section>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard metrics...</p>
        </div>
      ) : (
        <>
          {/* Top Grid: Analytics & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart Area */}
            <div className="col-span-1 lg:col-span-8 bg-white rounded-3xl p-8 shadow-sm border border-border/40">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-primary tracking-tight">Catalogs Analytics</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-1">Growth of products in your inventory</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-secondary/30 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 hidden sm:inline-block">Total Products: {totalProducts}</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">Growth View</span>
                </div>
              </div>

              <div className="h-64 pt-4">
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
                          borderRadius: '1rem', 
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          fontWeight: 'bold',
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                      />
                      <Bar 
                        dataKey="totalProducts" 
                        fill="url(#barGradient)" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                     <p className="text-sm text-muted-foreground font-medium">Not enough data to display growth chart.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Stock Value */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
              
              <div className="bg-primary text-white p-6 rounded-3xl flex-1 flex flex-col justify-between shadow-lg shadow-primary/20 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">Quick Actions</h3>
                  <p className="text-sm text-white/70 font-medium">Manage your shop operations efficiently</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
                  <button onClick={() => navigate('/organisation/products/create')} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <PlusSquare size={24} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Add Product</span>
                  </button>
                  <button onClick={() => navigate('/organisation/reservations')} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <CalendarDays size={24} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Reservations</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-border/50 p-6 rounded-3xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Stock Value</p>
                  <h2 className="text-3xl font-black text-primary tracking-tighter">₹{totalValue.toLocaleString()}</h2>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <DollarSign size={28} />
                </div>
              </div>

            </div>
          </div>

          {/* Middle Row: Reservations & Staff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            
            {/* Reservations Queue */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Pending Reservations</h2>
                <button onClick={() => navigate('/organisation/reservations/pending')} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                  View All <ChevronRight size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {reservations.length > 0 ? (
                  reservations.slice(0, 3).map((res) => (
                    <div key={res.id} className="bg-white p-5 rounded-2xl border-l-[6px] border-primary shadow-sm hover:translate-y-[-2px] transition-all flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{res.customer?.id ? `Customer #${res.customer.id.substring(0,6)}` : "Anonymous"}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{res.product?.name || "Product"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-amber-600 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">Pending</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-6 rounded-2xl border border-border border-dashed flex flex-col items-center justify-center text-center text-muted-foreground py-12 h-44">
                    <AlertCircle size={32} className="mb-2 opacity-40" />
                    <p className="text-sm font-bold">No pending reservations</p>
                    <p className="text-xs font-medium mt-1">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Overview (Mock) */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Staff Overview</h2>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-green-200">2 Active Now</span>
              </div>
              <div className="bg-white border border-border/50 rounded-3xl overflow-hidden shadow-sm h-[264px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-secondary/20">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider border-b border-border/50">Worker Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider border-b border-border/50">Role</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider text-right border-b border-border/50">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">DC</div>
                          <span className="text-sm font-bold text-foreground">David Chen</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Manager</span></td>
                      <td className="px-6 py-4 text-right"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span></td>
                    </tr>
                    <tr className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">AL</div>
                          <span className="text-sm font-bold text-foreground">Anna Lee</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Sales</span></td>
                      <td className="px-6 py-4 text-right"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span></td>
                    </tr>
                    <tr className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground font-bold text-xs flex items-center justify-center">MK</div>
                          <span className="text-sm font-bold text-foreground">Mark Kim</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Support</span></td>
                      <td className="px-6 py-4 text-right"><span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300"></span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Product Inventory Preview */}
          <section className="mt-14 space-y-6">
            <div className="flex justify-between items-end px-1">
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Recent Inventory</h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">Latest products updated in your catalog</p>
              </div>
              <button onClick={() => navigate('/organisation/products')} className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/20 flex items-center gap-2">
                Manage All <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((p) => {
                const isLowStock = p.stockQuantity < 10;
                return (
                  <div key={p.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-border group transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:translate-y-[-4px] cursor-pointer" onClick={() => navigate(`/organisation/products/edit/${p.id}`)}>
                    <div className="h-44 overflow-hidden relative bg-secondary/20">
                      {p.imageUrl? (
                        <img 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          src={p?.imageUrl} 
                          alt={p.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/20">
                          <Package size={48} />
                        </div>
                      )}
                      
                      <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-sm backdrop-blur-md ${isLowStock ? 'bg-orange-500/90 text-white' : 'bg-green-500/90 text-white'}`}>
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                      </div>

                    </div>
                    <div className="p-6 space-y-3">
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{p.category?.name || "Product"}</p>
                      <h4 className="text-base font-bold text-foreground line-clamp-1">{p.name}</h4>
                      <div className="flex justify-between items-end pt-5 border-t border-secondary/50 mt-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mb-1">Quantity</p>
                          <p className={`text-xl font-black tracking-tighter ${isLowStock ? 'text-orange-500' : 'text-foreground'}`}>
                            {p.stockQuantity} <span className="text-xs font-medium text-muted-foreground tracking-normal">Units</span>
                          </p>
                        </div>
                        <span className="text-primary font-black text-lg">₹{p.price}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {products.length === 0 && (
                [1,2,3,4].map(idx => (
                  <div key={idx} className="bg-secondary/10 rounded-[2rem] h-[320px] animate-pulse border border-border flex items-center justify-center text-muted-foreground/30">
                     <Package size={40} />
                  </div>
                ))
              )}
            </div>
          </section>

        </>
      )}
    </div>
  );
};
