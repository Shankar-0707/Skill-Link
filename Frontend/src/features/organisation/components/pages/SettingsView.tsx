import { useEffect, useState } from "react";
import { ViewProfile } from "@/features/organisation/components/ViewProfile";
import { UpdateProfile } from "@/features/organisation/components/UpdateProfile";
import { organisationApi } from "@/features/organisation/api/auth";
import type { Organisation } from "@/features/organisation/types";
import { 
  Settings, 
  User, 
  Edit3, 
  Loader2, 
  RefreshCw, 
  Lock, 
  Shield, 
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useAuth } from "@/app/context/useAuth";
import { useNavigate } from "react-router-dom";

type Section = "profile" | "update" | "security";

export const SettingsView = () => {
  const {  } = useAuth();
  const navigate = useNavigate();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("profile");

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
    setActiveSection("profile");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Manage your business account, profile details, and security preferences.
          </p>
        </div>
        
        <button 
          onClick={fetchProfile}
          className="group p-2.5 rounded-xl bg-white border border-border shadow-sm hover:border-primary hover:text-primary transition-all text-muted-foreground"
          title="Refresh profile"
        >
          <RefreshCw size={18} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-1.5 p-1 bg-secondary/10 rounded-2xl border border-border/50">
            {[
              { id: "profile", label: "Public Profile", icon: User },
              { id: "update", label: "Edit Account", icon: Edit3 },
              { id: "security", label: "Security", icon: Lock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as Section)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  activeSection === id 
                    ? "bg-foreground text-background shadow-md border border-foreground" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                )}
              >
                <Icon size={18} />
                <span>{label}</span>
                {activeSection === id && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </button>
            ))}
          </nav>

        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-border shadow-sm">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                <Loader2 size={24} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-primary animate-pulse" />
              </div>
              <p className="font-bold tracking-widest uppercase text-[10px]">Updating Profile View...</p>
            </div>
          ) : organisation ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeSection === "profile" && <ViewProfile organisation={organisation} />}
              {activeSection === "update" && (
                <UpdateProfile 
                  organisation={organisation} 
                  onUpdateSuccess={handleUpdateSuccess} 
                />
              )}
              {activeSection === "security" && (
                <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 md:p-10 space-y-8 min-h-[500px]">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Password & Security</h2>
                    <p className="text-muted-foreground mt-1 font-medium">Manage your access credentials and protect your business data.</p>
                  </div>

                  <div className="p-5 bg-green-50/50 border border-green-100 rounded-2xl flex items-center gap-4 transition-all hover:bg-green-50">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-green-100 flex items-center justify-center text-green-600">
                      <Shield size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">Multi-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground font-medium">Standard security is active. Consider adding 2FA for extra safety.</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-green-200 text-green-700 text-xs font-bold rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm">Enable</button>
                  </div>

                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-5 bg-secondary/20 border border-border/50 rounded-2xl hover:border-primary/50 hover:bg-secondary/40 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors border border-border/50">
                          <Lock size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-foreground">Change Password</p>
                          <p className="text-xs text-muted-foreground font-medium">Update your account password periodically.</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="w-full flex items-center justify-between p-5 bg-red-50/20 border border-red-50 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-red-400 border border-red-100">
                          <AlertCircle size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-red-600">Delete Organisation Account</p>
                          <p className="text-xs text-red-400 font-medium">Permanently remove all business data and access.</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-red-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </div>
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
    </div>
  );
};
