import React, { useState } from "react";
import { Save, AlertCircle, Loader2, Building, Type, AlignLeft } from "lucide-react";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await organisationApi.updateMyProfile(formData);
      await refreshProfile(); // Sync global auth context (sidebar)
      onUpdateSuccess(updated);
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("An error occurred while saving. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 md:p-10 animate-in slide-in-from-bottom-5 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Profile</h2>
        <p className="text-muted-foreground mt-1 font-medium">Keep your organisation information up to date.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="businessName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Business Name
            </label>
            <div className="relative group">
              <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter business name"
                className="w-full bg-secondary/30 border border-border rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="businessType" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Business Type
            </label>
            <div className="relative group">
              <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                id="businessType"
                name="businessType"
                type="text"
                required
                value={formData.businessType}
                onChange={handleChange}
                placeholder="e.g. Retail, Service, Tech"
                className="w-full bg-secondary/30 border border-border rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Description
          </label>
          <div className="relative group">
            <AlignLeft size={16} className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <textarea
              id="description"
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell customers about your organisation..."
              className="w-full bg-secondary/30 border border-border rounded-3xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground/50 resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium animate-in shake duration-500">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl px-8 py-6 h-auto font-bold shadow-lg shadow-primary/20 gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
