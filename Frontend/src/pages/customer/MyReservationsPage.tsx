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
  ChevronRight
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/shared/utils/cn";

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

  const handlePickUp = async (id: string) => {
    setIsActionLoading(id);
    try {
      await customerReservationService.markPickedUp(id);
      await fetchReservations();
    } catch (err) {
      console.error("Failed to mark picked up:", err);
    } finally {
      setIsActionLoading(null);
    }
  };

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

      {loading && reservations.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 size={40} className="animate-spin text-foreground opacity-20" />
          <p className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing History...</p>
        </div>
      ) : reservations.length > 0 ? (
        <div className="space-y-6 max-w-5xl">
          {reservations.map(res => (
            <div 
              key={res.id}
              className="bg-white rounded-3xl border border-border/60 shadow-sm hover:shadow-md transition-all p-6 relative group overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-secondary/30 rounded-2xl overflow-hidden shrink-0">
                    {res.product?.images?.[0]?.imageUrl ? (
                      <img src={res.product.images[0].imageUrl} alt={res.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <ShoppingBag size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        STATUS_CLASSES[res.status as keyof typeof STATUS_CLASSES] || "bg-secondary text-foreground"
                      )}>
                        {STATUS_ICONS[res.status as keyof typeof STATUS_ICONS] || <History size={16} />}
                        {res.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold tracking-widest flex items-center gap-1">
                        <ChevronRight size={10} />
                        ID: #{res.id.substring(0, 8)}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-foreground">{res.product?.name || "Unknown Product"}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Reserved from <span className="text-primary">{res.product?.organisationId ? "Local Business" : "Shop"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 py-4 md:py-0 border-y md:border-y-0 border-border/40">
                  <div className="flex flex-col md:items-end">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Details</span>
                    <p className="text-sm font-bold text-foreground">{res.quantity}x Units @ ₹{res.product?.price || 0}</p>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Total Paid</span>
                    <p className="text-2xl font-black text-primary tracking-tighter">₹{(res.quantity * (res.product?.price || 0)).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {res.status === "CONFIRMED" && (
                    <button 
                      onClick={() => handlePickUp(res.id)}
                      disabled={!!isActionLoading}
                      className="flex-1 md:flex-none px-6 py-3.5 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {isActionLoading === res.id ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                      Mark Picked Up
                    </button>
                  )}
                  {["PENDING", "CONFIRMED"].includes(res.status) && (
                    <button 
                      onClick={() => handleCancelByCustomer(res.id)}
                      disabled={!!isActionLoading}
                      className="px-6 py-3.5 border border-red-500/20 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                    >
                      {isActionLoading === res.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6 pt-6 border-t border-border/40 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="opacity-50" />
                  Reserved: {format(parseISO(res.createdAt), "dd MMM yyyy, HH:mm")}
                </div>
                {res.expiresAt && (
                  <div className="flex items-center gap-2 text-amber-600/80">
                    <Clock size={14} className="opacity-50" />
                    Expires: {format(parseISO(res.expiresAt), "dd MMM, HH:mm")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="🛍️" 
          title="No reservations yet" 
          description="You haven't made any product reservations yet. Explore the marketplace to find premium items."
          action={{ label: "Go to Marketplace", onClick: () => window.location.href = "/user/products" }}
        />
      )}
    </Layout>
  );
};
