import React from "react";
import { Building2, FileText, Tag, Calendar } from "lucide-react";
import type { Organisation } from "../types";

interface ViewProfileProps {
  organisation: Organisation;
}

export const ViewProfile: React.FC<ViewProfileProps> = ({ organisation }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string | null }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-secondary/50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
        <Icon size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{label}</span>
        <span className="text-foreground font-medium mt-0.5">{value || "Not provided"}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 md:p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">General Information</h2>
          <p className="text-muted-foreground mt-1 font-medium">Detailed overview of your organisation profile.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-full border border-border">
          <Calendar size={14} className="text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Joined {formatDate(organisation.createdAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem 
          icon={Building2} 
          label="Business Name" 
          value={organisation.businessName} 
        />
        <InfoItem 
          icon={Tag} 
          label="Business Type" 
          value={organisation.businessType} 
        />
        <InfoItem 
          icon={Calendar} 
          label="Last Updated" 
          value={formatDate(organisation.updatedAt)} 
        />
      </div>

      <div className="border-t border-border pt-8 mt-2">
        <div className="flex items-start gap-4 p-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <FileText size={20} />
          </div>
          <div className="flex flex-col w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">Description</span>
            <div className="bg-secondary/20 p-6 rounded-2xl border border-border italic text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {organisation.description || "No description provided yet. Click update to add one."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
