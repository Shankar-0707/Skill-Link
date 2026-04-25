import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../../features/customer/components/layout/Layout";
import { PageHeader, EmptyState } from "../../features/customer/components/ui";
import { customerReservationService } from "../../features/customer/services/customerReservationService";
import type { Reservation } from "../../features/customer/types";
import { 
  Calendar, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Package, 
  History,
  AlertCircle,
  Loader2,
  Trash2,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { format, parseISO, subDays, isAfter, startOfDay } from "date-fns";
import { cn } from "@/shared/utils/cn";
import { PRODUCT_CATEGORIES } from "../../shared/constants/productCategories";

const STATUS_ICONS = {
  PENDING: <Clock size={16} />,
  CONFIRMED: <CheckCircle2 size={16} />,
  PICKED_UP: <Package size={16} />,
  CANCELLED: <XCircle size={16} />,
  EXPIRED: <AlertCircle size={16} />,
};

const STATUS_CLASSES = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  PICKED_UP: "bg-blue-50 text-blue-600 border-blue-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  EXPIRED: "bg-slate-50 text-slate-600 border-slate-200",
};

export const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: "all",
    category: "all",
    organisation: "all"
  });

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await customerReservationService.getMyReservations();
      setReservations(result.items || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);
  
  const filteredReservations = reservations.filter(res => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      res.product?.name?.toLowerCase()?.includes(query) ||
      res.id.toLowerCase().includes(query);

    // 2. Category Filter
    const matchesCategory = filters.category === "all" || res.product?.category === filters.category;

    // 3. Organisation Filter
    const matchesOrg = filters.organisation === "all" || res.product?.organisation?.businessName === filters.organisation;

    // 4. Date Filter
    const resDate = parseISO(res.createdAt);
    let matchesDate = true;
    if (filters.dateRange === "today") {
      matchesDate = isAfter(resDate, startOfDay(new Date()));
    } else if (filters.dateRange === "last7") {
      matchesDate = isAfter(resDate, subDays(new Date(), 7));
    } else if (filters.dateRange === "last30") {
      matchesDate = isAfter(resDate, subDays(new Date(), 30));
    }

    return matchesSearch && matchesCategory && matchesOrg && matchesDate;
  });

  // Extract unique organisations for filter options
  const organisations = Array.from(new Set(reservations.map(r => r.product?.organisation?.businessName))).filter(Boolean) as string[];
  const activeFiltersCount = (filters.dateRange !== "all" ? 1 : 0) + (filters.category !== "all" ? 1 : 0) + (filters.organisation !== "all" ? 1 : 0);


  const handleCancelByCustomer = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    setIsActionLoading(id);
    try {
      await customerReservationService.cancelReservation(id, { reason: "Cancelled by customer" });
      await fetchReservations();
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="My Reservations" 
        subtitle="Manage your current and past history of product reservations from local shops."
      />

      {/* Search & Filter Bar Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-20">
        <div className="relative group flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <input
            type="text"
            placeholder="Search products or IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container border border-border/80 rounded-2xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-outline focus:ring-4 focus:ring-foreground/5 transition-all"
          />
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border transition-all font-bold text-sm h-full whitespace-nowrap",
              isFilterOpen || activeFiltersCount > 0
                ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10"
                : "bg-surface-container border-border/80 text-foreground hover:bg-secondary/10"
            )}
          >
            <Filter size={16} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black ml-1">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown size={14} className={cn("transition-transform duration-300 ml-1 opacity-60", isFilterOpen && "rotate-180")} />
          </button>

          {/* Filter Dropdown Overlay */}
          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute top-[120%] right-0 md:left-0 w-[280px] md:w-[320px] bg-white border border-border rounded-3xl shadow-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                  <h4 className="font-headline font-bold text-sm text-foreground">Refine History</h4>
                  {activeFiltersCount > 0 && (
                    <button 
                      onClick={() => setFilters({ dateRange: "all", category: "all", organisation: "all" })}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Date Filter */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Reservation Date</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "All Time", value: "all" },
                        { label: "Today", value: "today" },
                        { label: "Last 7 Days", value: "last7" },
                        { label: "Last 30 Days", value: "last30" }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setFilters(prev => ({ ...prev, dateRange: opt.value }))}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold transition-all border text-center",
                            filters.dateRange === opt.value
                              ? "bg-foreground text-background border-foreground shadow-sm"
                              : "bg-surface-container border-border/50 text-muted-foreground hover:bg-secondary/10 hover:text-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Product Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-surface-container border border-border/50 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-outline appearance-none cursor-pointer"
                    >
                      <option value="all">Any Category</option>
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Organisation Filter */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Shop / Local Store</label>
                    <select
                      value={filters.organisation}
                      onChange={(e) => setFilters(prev => ({ ...prev, organisation: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-surface-container border border-border/50 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-outline appearance-none cursor-pointer"
                    >
                      <option value="all">Any Shop</option>
                      {organisations.map(org => (
                        <option key={org} value={org}>{org}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full mt-8 py-3 bg-secondary/10 text-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-secondary/20 transition-all border border-border/50"
                >
                  Show {filteredReservations.length} Results
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && reservations.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 size={40} className="animate-spin text-foreground opacity-20" />
          <p className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing History...</p>
        </div>
      ) : filteredReservations.length > 0 ? (
        <div className="flex flex-col gap-4 max-w-5xl">
          {filteredReservations.map(res => (
            <div 
              key={res.id}
              className="bg-background border border-border rounded-2xl p-4 hover:shadow-md hover:border-outline transition-all duration-200 group flex flex-col md:flex-row md:items-center gap-6"
            >
              {/* Left Section: Image and Core Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 bg-surface-container rounded-xl overflow-hidden shrink-0 border border-border/40">
                  {res.product?.images?.[0]?.imageUrl ? (
                    <img src={res.product.images[0].imageUrl} alt={res.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border",
                      STATUS_CLASSES[res.status as keyof typeof STATUS_CLASSES] || "bg-secondary text-foreground"
                    )}>
                      {STATUS_ICONS[res.status as keyof typeof STATUS_ICONS] || <History size={10} />}
                      {res.status.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-bold tracking-tight bg-surface-container px-1.5 py-0.5 rounded-lg">
                      #{res.id.substring(0, 6)}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-sm text-foreground truncate max-w-xs">
                    {res.product?.name || "Unknown Product"}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="opacity-50" />
                      {format(parseISO(res.createdAt), "dd MMM, HH:mm")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section: Quantity & Price */}
              <div className="flex items-center gap-8 px-6 border-x border-border/40 border-dashed hidden md:flex">
                <div>
                  <p className="text-[9px] font-label text-muted-foreground uppercase tracking-widest mb-0.5">Quantity</p>
                  <p className="text-sm font-black text-foreground">{res.quantity} units</p>
                </div>
                <div>
                  <p className="text-[9px] font-label text-muted-foreground uppercase tracking-widest mb-0.5">Price / Unit</p>
                  <p className="text-sm font-black text-foreground">₹{(res.product?.price || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Right Section: Total & Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 transition-all">
                <div className="text-left md:text-right">
                  <p className="text-[9px] font-label text-muted-foreground uppercase tracking-widest mb-0.5">Total Paid</p>
                  <p className="text-xl font-black text-primary tracking-tight">
                    ₹{(
                      res.escrow?.amount ||
                      res.payment?.amount ||
                      (res.quantity * (res.product?.price || 0) * 1.05)
                    ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[8px] text-violet-500 font-bold mt-0.5">incl. 5% service fee</p>
                </div>

                <div className="flex items-center gap-2">
                  {res.status === "CONFIRMED" && res.pickupOtp && (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-center shadow-inner border border-emerald-100">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">Pickup Code</p>
                      <p className="text-xl font-black tracking-widest">{res.pickupOtp}</p>
                    </div>
                  )}
                  {["PENDING", "CONFIRMED"].includes(res.status) && (
                    <button 
                      onClick={() => handleCancelByCustomer(res.id)}
                      disabled={!!isActionLoading}
                      className="px-5 py-2.5 border border-red-500/10 text-red-500 bg-red-50/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                    >
                      {isActionLoading === res.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={searchQuery || activeFiltersCount > 0 ? "🔍" : "🛍️"} 
          title={searchQuery || activeFiltersCount > 0 ? "No matching results" : "No reservations yet"} 
          description={searchQuery || activeFiltersCount > 0 ? "No reservations found for these filters." : "You haven't made any product reservations yet."}
          action={searchQuery || activeFiltersCount > 0 ? { label: "Clear Filters", onClick: () => { setSearchQuery(""); setFilters({ dateRange: "all", category: "all", organisation: "all" }); } } : { label: "Go to Marketplace", onClick: () => window.location.href = "/user/products" }}
        />
      )}
    </Layout>
  );
};
