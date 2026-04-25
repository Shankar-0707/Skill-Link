import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Info,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { reservationApi } from '@/features/organisation/api/reservation.service';
import type { Reservation } from '@/features/organisation/types/reservation.types';
import { ReservationStatus } from '@/features/organisation/types/reservation.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

export const ReservationDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;
      try {
        const data = await reservationApi.getOne(id);
        setReservation(data);
      } catch (error) {
        console.error('Failed to fetch reservation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      await reservationApi.confirm(id);
      const updated = await reservationApi.getOne(id);
      setReservation(updated);
    } catch (error) {
      console.error('Failed to confirm:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      await reservationApi.reject(id, { reason: 'Merchant unable to fulfill at this time' });
      const updated = await reservationApi.getOne(id);
      setReservation(updated);
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const [otpValue, setOtpValue] = useState('');
  
  const handleVerifyOtp = async () => {
    if (!id || !otpValue) return;
    setIsActionLoading(true);
    try {
      await reservationApi.verifyPickup(id, { otp: otpValue });
      const updated = await reservationApi.getOne(id);
      setReservation(updated);
    } catch (error: unknown) {
      console.error('Failed to verify OTP:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message || 'Failed to verify OTP'); // Or toast
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusVariant = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:   return 'warning';
      case ReservationStatus.CONFIRMED: return 'info';
      case ReservationStatus.PICKED_UP: return 'success';
      case ReservationStatus.CANCELLED: return 'error';
      case ReservationStatus.EXPIRED:   return 'secondary';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-black text-primary/60 uppercase tracking-widest">Loading Logistics...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-20">
        <XCircle className="w-16 h-16 text-rose-500/20 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-primary tracking-tighter">Reservation Not Found</h2>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/organisation/reservations/all')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to list
        </Button>
      </div>
    );
  }

  const baseAmount = reservation.product.price * reservation.quantity;
  const platformFee = reservation.platformFee ?? (baseAmount * 0.05);
  const totalAmount = reservation.totalAmount ?? (baseAmount + platformFee);
  const productImages = reservation.product.images ?? [];

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Mini Breadcrumb/Nav */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group"
      >
        <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">Back to Fleet</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-border/60 rounded-[2rem] overflow-hidden shadow-sm">
            {/* Visual Header */}
            <div className="relative h-64 bg-secondary/20">
              {productImages.length > 0 ? (
                <img 
                  src={productImages[0].imageUrl} 
                  alt={reservation.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-muted-foreground/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getStatusVariant(reservation.status)} className="px-4 py-1 text-[10px] font-black uppercase tracking-wider shadow-lg">
                    {reservation.status}
                  </Badge>
                  {reservation.escrow?.status === 'HELD' && (
                    <Badge className="bg-blue-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Funds Secured
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter leading-tight">
                  {reservation.product.name}
                </h1>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Product Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Base Price</p>
                  <p className="text-xl font-black text-primary">₹{reservation.product.price.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Reserved Qty</p>
                  <p className="text-xl font-black text-primary">{reservation.quantity} Units</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Earnings (Payout)</p>
                  <p className="text-xl font-black text-emerald-600">₹{baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border/40">
                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Product Specifications
                </h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                  {reservation.product.description || "No description provided for this catalog item."}
                </p>
              </div>

              {/* Status Timeline Placeholder (Visual only for now) */}
              <div className="pt-6 border-t border-border/40">
                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Voucher Timeline
                </h3>
                <div className="flex flex-col gap-6 relative">
                   {/* Timeline path */}
                   <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/40" />
                   
                   <div className="flex gap-4 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-white shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-primary uppercase">Reservation Initiated</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{new Date(reservation.createdAt).toLocaleString()}</p>
                      </div>
                   </div>

                   {reservation.status !== ReservationStatus.PENDING && (
                     <div className="flex gap-4 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-white shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-primary uppercase">Logistics Confirmed</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{new Date(reservation.updatedAt).toLocaleString()}</p>
                        </div>
                     </div>
                   )}

                   {reservation.status === ReservationStatus.PENDING && (
                     <div className="flex gap-4 relative z-10 opacity-50">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center ring-4 ring-white">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Awaiting Merchant Approval</p>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Customer & Actions */}
        <div className="space-y-6">
          {/* Action Card */}
          {reservation.status === ReservationStatus.PENDING && (
            <section className="bg-primary text-white rounded-[2rem] p-8 shadow-xl shadow-primary/20 space-y-6 animate-pulse">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Approval Required</h3>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                A customer has requested these units. Confirming will hold the inventory for collection.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={handleConfirm}
                  disabled={isActionLoading}
                  className="bg-white text-primary hover:bg-white/90 font-black text-xs h-12 rounded-xl group"
                >
                  Confirm & Lock Inventory
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  onClick={handleReject}
                  disabled={isActionLoading}
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest"
                >
                  Reject Request
                </Button>
              </div>
            </section>
          )}

          {/* OTP Verification Action Card (only if CONFIRMED) */}
          {reservation.status === ReservationStatus.CONFIRMED && (
            <section className="bg-emerald-600 text-white rounded-[2rem] p-8 shadow-xl shadow-emerald-600/20 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Verify Pickup</h3>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                To release the funds from the escrow to your wallet, ask the customer for the 4-digit pickup verification code on their screen and enter it here.
              </p>
              <div className="space-y-4">
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="• • • •" 
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[1em] font-black text-2xl h-16 rounded-xl text-gray-900 bg-white/90 focus:bg-white focus:outline-none"
                />
                <Button 
                  onClick={handleVerifyOtp}
                  disabled={isActionLoading || otpValue.length !== 4}
                  className="w-full bg-white text-emerald-700 hover:bg-white/90 font-black text-xs h-12 rounded-xl group"
                >
                  Verify & Release Funds
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </section>
          )}

          {/* Customer Metadata Card */}
          <section className="bg-white border border-border/60 rounded-[2rem] p-8 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-border/40 pb-4">
              Authorized Customer
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center text-primary font-black text-xl border border-border/40 shadow-inner">
                {reservation.customer?.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-base font-black text-primary tracking-tight">{reservation.customer?.user?.name || 'Unknown Customer'}</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Verified Account</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl border border-border/20 group hover:border-primary/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Electronic Mail</p>
                  <p className="text-xs font-bold text-primary truncate">{reservation.customer.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl border border-border/20 group hover:border-primary/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Direct Contact</p>
                  <p className="text-xs font-bold text-primary">{reservation.customer.user.phone || "No phone listed"}</p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-10 rounded-xl group">
              Contact Customer
              <ExternalLink className="w-3 h-3 ml-2 group-hover:scale-110 transition-transform" />
            </Button>
          </section>

          {/* Logistics Summary Card */}
          <section className="bg-secondary/10 border border-border/40 rounded-[2rem] p-8 space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Logistics Reference</h3>
            <div className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-border/20">
              <span className="text-[10px] font-black uppercase text-muted-foreground">Voucher ID</span>
              <span className="text-[10px] font-black text-primary">{reservation.id.split('-')[0]}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-medium leading-relaxed italic">
              Please use the Voucher ID when verifying collections with the customer on-site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
