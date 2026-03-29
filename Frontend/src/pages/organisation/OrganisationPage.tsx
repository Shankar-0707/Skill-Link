import React, { useEffect, useState, useMemo } from "react";
import { productsApi } from "@/features/products/api/productsApi";
import type { Product } from "@/features/products/types";
import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Loader2, TrendingUp, Package } from "lucide-react";

const OrganisationPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Fetch a large number to get all for the chart
        const res = await productsApi.getMyProducts({ limit: 1000 });
        setProducts(res.items || []);
      } catch (err) {
        console.error("Failed to load products for dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Process data for the cumulative growth chart
  const chartData = useMemo(() => {
    if (products.length === 0) return [];

    // 1. Sort products by creation date ascending
    const sorted = [...products].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 2. Group by date string (e.g., 'MMM dd') and count
    const dailyCounts: Record<string, number> = {};
    sorted.forEach((p) => {
      const dateStr = format(parseISO(p.createdAt), "MMM dd");
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
    });

    // 3. Create cumulative data
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

  const totalProducts = products.length;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Welcome back! Here's your overall performance.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard metrics...</p>
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Products</p>
                  <p className="text-4xl font-black text-foreground">{totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package size={24} />
                </div>
              </div>
              <div className="relative z-10 mt-6 flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 self-start px-3 py-1.5 rounded-xl border border-green-100">
                <TrendingUp size={16} />
                <span>Growing Catalog</span>
              </div>
              {/* Decorative background shape */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            </div>

            {/* Placeholder for future metrics */}
            <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between opacity-50 grayscale">
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Active Orders</p>
                <p className="text-4xl font-black text-foreground">--</p>
              </div>
              <p className="text-xs font-bold text-muted-foreground mt-6">Coming soon</p>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between opacity-50 grayscale">
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Revenue</p>
                <p className="text-4xl font-black text-foreground">₹--</p>
              </div>
              <p className="text-xs font-bold text-muted-foreground mt-6">Coming soon</p>
            </div>
          </div>

          {/* Product Growth Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Product Growth</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Cumulative products added to your catalog over time.
                </p>
              </div>
            </div>

            <div className="h-[400px] w-full pt-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        {/* Creates a 3D cylindrical lighting effect */}
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                        <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      </linearGradient>
                      
                      <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="4" dy="6" stdDeviation="5" floodColor="hsl(var(--primary))" floodOpacity="0.25" />
                      </filter>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 600 }}
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                      contentStyle={{ 
                        borderRadius: '1.5rem', 
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                        fontWeight: 'bold',
                        padding: '12px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)'
                      }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                      labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '8px' }}
                    />
                    <Bar 
                      dataKey="totalProducts" 
                      name="Total Products"
                      fill="url(#barGradient)" 
                      radius={[12, 12, 0, 0]}
                      barSize={48}
                      className="transition-all duration-300 hover:opacity-90"
                      style={{ filter: 'url(#barShadow)' }}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Package size={32} className="opacity-40" />
                  <p className="font-medium text-sm">Not enough data to show a trend yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrganisationPage;