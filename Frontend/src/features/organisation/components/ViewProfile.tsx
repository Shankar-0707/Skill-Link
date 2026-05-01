import React from "react";
import { Building2, FileText, Tag, Calendar, BadgeCheck, Clock } from "lucide-react";
import type { Organisation } from "../types";

interface ViewProfileProps {
  organisation: Organisation;
}

const InfoItem = ({ icon: Icon, label, value, badge }: { icon: React.ElementType, label: string, value?: string | null, badge?: string }) => (
  <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/10 border border-transparent hover:border-border transition-all">
    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-border/50 shrink-0 mt-0.5">
      <Icon size={22} />
    </div>
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
          {badge && (
              <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tighter">
                  {badge}
              </span>
          )}
      </div>
      <span className="text-foreground font-bold text-lg mt-0.5 leading-tight">{value || "Not provided"}</span>
    </div>
  </div>
);

export const ViewProfile: React.FC<ViewProfileProps> = ({ organisation }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 md:p-10 space-y-10 animate-in fade-in duration-500 min-h-[500px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/30">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">General Information</h2>
          <p className="text-muted-foreground mt-1 font-medium">Detailed overview of your organisation profile.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 shadow-sm shadow-green-100/20">
          <BadgeCheck size={14} className="animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">Active Partner</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem 
          icon={Building2} 
          label="Business Name" 
          value={organisation.businessName} 
          badge="Verified"
        />
        <InfoItem 
          icon={Tag} 
          label="Business Type" 
          value={organisation.businessType} 
        />
        <InfoItem 
          icon={Calendar} 
          label="Registered On" 
          value={formatDate(organisation.createdAt)} 
        />
        <InfoItem 
          icon={Clock} 
          label="Last Interaction" 
          value={formatDate(organisation.updatedAt)} 
        />
      </div>

      <div className="pt-6">
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
                <FileText size={14} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">About the Organisation</span>
            </div>
            <div className="bg-secondary/10 p-8 rounded-3xl border border-border/50 text-foreground leading-relaxed font-medium relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl pointer-events-none select-none">“</div>
                <p className={organisation.description ? "" : "italic text-muted-foreground"}>
                    {organisation.description || "No description provided yet. Update your profile to help customers understand your services better."}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary/5 to-transparent" />
            </div>
        </div>
      </div>
    </div>
  );
};
