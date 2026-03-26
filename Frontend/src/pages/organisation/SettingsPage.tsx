import { useEffect, useState } from "react";
import { ViewProfile } from "@/features/organisation/components/ViewProfile";
import { UpdateProfile } from "@/features/organisation/components/UpdateProfile";
import { organisationApi } from "@/features/organisation/api/auth";
import type { Organisation } from "@/features/organisation/types";
import { Settings, User, Edit3, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const SettingsPage = () => {
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"view" | "update">("view");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await organisationApi.getMyProfile();
      setOrganisation(data);
    } catch (err) {
      console.error("Failed to fetch organisation profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSuccess = (updated: Organisation) => {
    setOrganisation(updated);
    setActiveTab("view");
    // Could add a toast notification here
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Organisation Profile</h1>
          <p className="text-muted-foreground mt-2 font-medium max-w-xl text-lg">
            Manage your business identity and how you appear to customers and partners across the platform.
          </p>
        </div>
        
        <button 
          onClick={fetchProfile}
          className="group p-3 rounded-2xl bg-white border border-border shadow-sm hover:border-primary hover:text-primary transition-all text-muted-foreground"
          title="Refresh profile"
        >
          <RefreshCw size={20} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1.5 bg-secondary/30 rounded-3xl w-fit border border-border/50 shadow-inner">
        <button
          onClick={() => setActiveTab("view")}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-[1.25rem] text-sm font-bold transition-all duration-300",
            activeTab === "view" 
              ? "bg-white text-primary shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User size={18} />
          <span>View Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("update")}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-[1.25rem] text-sm font-bold transition-all duration-300",
            activeTab === "update" 
              ? "bg-white text-primary shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Edit3 size={18} />
          <span>Update details</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[500px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4 bg-white/50 backdrop-blur-sm rounded-[2.5rem] z-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <Loader2 size={32} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-primary animate-pulse" />
            </div>
            <p className="font-bold tracking-widest uppercase text-xs">Loading profile data...</p>
          </div>
        ) : organisation ? (
          activeTab === "view" ? (
            <ViewProfile organisation={organisation} />
          ) : (
            <UpdateProfile 
              organisation={organisation} 
              onUpdateSuccess={handleUpdateSuccess} 
            />
          )
        ) : (
          <div className="bg-white p-16 rounded-[2.5rem] border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <Settings size={40} />
            </div>
            <h3 className="text-xl font-bold">Failed to load profile</h3>
            <p className="text-muted-foreground max-w-sm">
              We couldn't retrieve your organisation details. This might be a temporary connection issue.
            </p>
            <button 
              onClick={fetchProfile}
              className="px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
