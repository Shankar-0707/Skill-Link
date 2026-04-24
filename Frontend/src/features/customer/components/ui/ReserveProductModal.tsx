import React, { useState } from "react";
import { X, ShoppingBag, AlertCircle, CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import type { Product } from "../../types";
import { customerReservationService } from "../../services/customerReservationService";
import { useRazorpay } from "../../../../shared/hooks/useRazorpay";
import { paymentsApi } from "../../../../services/api/payments";
import { useNavigate } from "react-router-dom";

interface ReserveProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReserveProductModal: React.FC<ReserveProductModalProps> = ({ 
  product, 
  onClose,
  onSuccess 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { openRazorpay } = useRazorpay();
  const navigate = useNavigate();

  const handleIncrement = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await customerReservationService.createReservation({
        productId: product.id,
        quantity
      });

      // Instead of manual success state and redirect, we open Razorpay
      const amountInPaise = Math.round(product.price * quantity * 100);

      await openRazorpay({
        amount: amountInPaise,
        currency: "INR",
        name: "Skill-Link",
        description: `Reservation: ${quantity}x ${product.name}`,
        prefill: {
          name: "Verified Customer", // This could be fetched from auth context
        },
        handler: async (rzpRes: any) => {
          console.log("Razorpay success:", rzpRes);
          try {
            // Confirm with backend
            if (!response.providerPaymentId) {
              throw new Error("Missing Payment ID from server");
            }
            const confirmRes = await paymentsApi.confirmPayment(response.providerPaymentId);
            setIsSuccess(true);
            setTimeout(() => {
              onSuccess?.();
              if (confirmRes.redirectUrl) {
                navigate(confirmRes.redirectUrl);
              } else {
                onClose();
              }
            }, 1500);
          } catch (confirmErr: any) {
            console.error("Backend confirmation failed:", confirmErr);
            setError("Payment recorded but server update failed. Please contact support.");
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          }
        }
      } as any);

    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create reservation. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center text-center max-w-sm w-full gap-6 shadow-2xl scale-in-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Order Initiated!</h2>
            <p className="text-muted-foreground font-medium">
              Redirecting you to secure checkout for <span className="text-foreground font-bold">{quantity}x {product.name}</span>...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="absolute inset-0" 
        onClick={() => !isSubmitting && onClose()} 
      />
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground leading-tight">Reserve Product</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Secure your items</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2.5 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-all disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Product Summary */}
          <div className="flex gap-6 p-4 bg-secondary/20 rounded-3xl border border-border/40">
            <div className="w-24 h-24 rounded-2xl bg-white overflow-hidden border border-border/50 shrink-0">
              {product.images?.[0]?.imageUrl ? (
                <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <ShoppingBag size={32} />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{product.organisation?.businessName || "Local Shop"}</p>
              <h3 className="text-lg font-bold text-foreground line-clamp-1">{product.name}</h3>
              <p className="text-xl font-black text-foreground mt-2">₹{product.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-foreground">Select Quantity</label>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {product.stockQuantity} units available
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center bg-secondary/30 rounded-2xl p-1 shrink-0">
                <button 
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isSubmitting}
                  className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white transition-all disabled:opacity-20 text-foreground"
                >
                  <Minus size={20} />
                </button>
                <span className="w-12 text-center text-xl font-black text-foreground">{quantity}</span>
                <button 
                  onClick={handleIncrement}
                  disabled={quantity >= product.stockQuantity || isSubmitting}
                  className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white transition-all disabled:opacity-20 text-foreground"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex-1 text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-3xl font-black text-primary tracking-tighter">₹{(product.price * quantity).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
            <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed">
              Reservations are held for 24 hours. The shop will need to confirm your request before you can pick it up. Your money will be held in escrow until pickup.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || product.stockQuantity <= 0}
            className="w-full py-5 bg-foreground text-background rounded-3xl font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-3 shadow-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ShoppingBag size={24} />
                <span>Confirm Reservation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
