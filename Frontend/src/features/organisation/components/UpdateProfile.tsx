import React, { useState } from "react";
import { Save, AlertCircle, Loader2, Building, Type, AlignLeft, CheckCircle2 } from "lucide-react";
import type { Organisation, UpdateOrganisationPayload } from "../types";
import { organisationApi } from "../api/auth";
import { useAuth } from "../../../app/context/useAuth";
import { Button } from "../../../shared/components/ui/button";

interface UpdateProfileProps {
  organisation: Organisation;
  onUpdateSuccess: (updated: Organisation) => void;
}

export const UpdateProfile: React.FC<UpdateProfileProps> = ({ organisation, onUpdateSuccess }) => {
  const { refreshProfile } = useAuth();
  const [formData, setFormData] = useState<UpdateOrganisationPayload>({
    businessName: organisation.businessName,
    businessType: organisation.businessType,
    description: organisation.description || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

    try {
      const updated = await organisationApi.updateMyProfile(formData);
      await refreshProfile(); // Sync global auth context (sidebar)
      setShowSuccess(true);
      setTimeout(() => {
        onUpdateSuccess(updated);
      }, 1500);
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("An error occurred while saving. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 md:p-10 animate-in slide-in-from-bottom-5 duration-500 min-h-[500px]">
      <div className="mb-10 pb-6 border-b border-border/30">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Account Details</h2>
        <p className="text-muted-foreground mt-1 font-medium">Keep your organisation information accurate and detailed.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2.5">
            <label htmlFor="businessName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
              Business Legal Name
            </label>
            <div className="relative group">
              <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter business name"
                className="w-full bg-secondary/10 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-bold text-foreground placeholder:font-medium placeholder:text-muted-foreground/40 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label htmlFor="businessType" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
              Industry Sector
            </label>
            <div className="relative group">
              <Type size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
              <input
                id="businessType"
                name="businessType"
                type="text"
                required
                value={formData.businessType}
                onChange={handleChange}
                placeholder="e.g. Retail, Service, Tech"
                className="w-full bg-secondary/10 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-bold text-foreground placeholder:font-medium placeholder:text-muted-foreground/40 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
            Organisation Biography
          </label>
          <div className="relative group">
            <AlignLeft size={18} className="absolute left-4 top-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell customers and partners what makes your organisation unique..."
              className="w-full bg-secondary/10 border border-border/50 rounded-[2rem] py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium text-foreground placeholder:text-muted-foreground/40 shadow-sm resize-none leading-relaxed"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-in shake duration-500">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {showSuccess && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-bold animate-in slide-in-from-top-2 duration-500">
               <CheckCircle2 size={20} className="text-green-600" />
               <span>Settings updated successfully! Redirecting...</span>
            </div>
        )}

        <div className="pt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || showSuccess}
            className="rounded-2xl px-10 py-7 h-auto font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 gap-3 transition-all enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Syncing Data...</span>
              </>
            ) : showSuccess ? (
                <>
                    <CheckCircle2 size={18} />
                    <span>Saved!</span>
                </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
