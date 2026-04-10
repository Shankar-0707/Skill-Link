import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Palette, Trash2, Camera, Shield, Mail, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Layout } from '../../features/customer/components/layout/Layout';
import { useAuth } from "../../app/context/useAuth";
import { authApi } from "../../features/auth/api/auth";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, deleteAccount } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  if (!user) return null;

  // console.log('SettingsPage: Current User Context:', user);

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     navigate('/login');
  //   } catch (err) {
  //     console.error('Logout failed:', err);
  //   }
  // };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        navigate('/login');
      } catch (err) {
        console.error('Delete account failed:', err);
      }
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      alert("Account email not found in your profile. Please try logging out and back in, or contact support.");
      return;
    }
    
    try {
      setIsResettingPassword(true);
      setResetError(null);
      await authApi.forgotPassword(user.email);
      setPasswordResetSent(true);
    } catch (err: any) {
      console.error('Failed to send password reset:', err);
      setResetError('Failed to send reset link. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleCompletePasswordReset = async () => {
    if (!resetToken || !newPassword || !confirmPassword) {
      setResetError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }

    try {
      setIsResettingPassword(true);
      setResetError(null);
      await authApi.resetPassword(resetToken, newPassword);
      setPasswordResetSent(false);
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully!');
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      setResetError(err?.response?.data?.message || 'Failed to reset password. Please check your token.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline font-bold text-3xl text-foreground">Settings</h1>
          <p className="text-muted-foreground font-body mt-1">Manage your account preferences and security.</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Nav */}
          <div className="w-64 flex-shrink-0">
            <nav className="flex flex-col gap-1">
              {[
                { id: 'profile', label: 'My Profile', icon: User },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'appearance', label: 'Appearance', icon: Palette },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-label font-medium transition-all
                    ${activeSection === id
                      ? 'bg-foreground text-background shadow-md'
                      : 'text-muted-foreground hover:bg-surface-container hover:text-foreground'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-border">
              {/* <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-label font-medium text-muted-foreground hover:bg-red-50 hover:text-destructive transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button> */}
              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-label font-medium text-muted-foreground hover:bg-red-50 hover:text-destructive transition-all mt-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-background border border-border rounded-2xl p-8 min-h-[500px] shadow-sm">
            
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-headline font-bold text-foreground mb-1">Profile Details</h2>
                  <p className="text-sm text-muted-foreground font-body">Update your photo and personal info.</p>
                </div>

                <div className="flex items-center gap-6 pb-8 border-b border-border">
                  <div className="relative group">
                    <img
                      src={user.profileImage ?? `https://i.pravatar.cc/100?u=${user.id}`}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-surface-container group-hover:opacity-75 transition-opacity"
                      alt={user.name}
                    />
                    <button className="absolute bottom-[-8px] right-[-8px] w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center border-4 border-background shadow-lg hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-label font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground font-body">{user.role} Account</p>
                    <button className="text-xs font-label font-bold text-foreground hover:underline mt-2">Replace photo</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="text" defaultValue={user.name} className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-border rounded-xl text-sm font-body text-foreground focus:outline-none focus:border-outline" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="email" defaultValue={user.email} disabled className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-border rounded-xl text-sm font-body text-muted-foreground cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    className="px-6 py-2.5 bg-foreground text-background text-sm font-label font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-headline font-bold text-foreground mb-1 text-left">Password & Security</h2>
                  <p className="text-sm text-muted-foreground font-body text-left">Ensuring your account remains protected.</p>
                </div>

                <div className="p-4 bg-surface-container border border-border rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-label font-semibold text-foreground text-left">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground font-body text-left">Currently disabled. Enable for maximum security.</p>
                  </div>
                  <button className="ml-auto text-xs font-label font-bold text-foreground hover:underline">Enable</button>
                </div>

                <div className="space-y-4">
                  {!passwordResetSent ? (
                    <button 
                      type="button"
                      onClick={handleChangePassword}
                      disabled={isResettingPassword}
                      className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-surface-container transition-all group disabled:opacity-70 disabled:cursor-not-allowed select-none"
                    > 
                      <div className="flex items-center gap-4"> 
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-label font-medium text-foreground">
                          {isResettingPassword ? 'Sending link...' : 'Change Password'}
                        </span>
                      </div>
                      {!isResettingPassword && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" /> 
                      )}
                    </button>
                  ) : (
                    <div className="p-6 border border-border rounded-xl bg-surface-container/30 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">Reset token sent to your email!</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider">Reset Token</label>
                          <input 
                            type="text" 
                            value={resetToken}
                            onChange={(e) => setResetToken(e.target.value)}
                            placeholder="Enter the token from your email"
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-body text-foreground focus:outline-none focus:border-outline" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
                            <input 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Min 8 characters"
                              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-body text-foreground focus:outline-none focus:border-outline" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                            <input 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repeat password"
                              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-body text-foreground focus:outline-none focus:border-outline" 
                            />
                          </div>
                        </div>

                        {resetError && (
                          <p className="text-xs text-destructive font-medium bg-red-50 p-2 rounded-lg">{resetError}</p>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => setPasswordResetSent(false)}
                            className="flex-1 px-4 py-2.5 border border-border text-foreground text-sm font-label font-semibold rounded-xl hover:bg-surface-container transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCompletePasswordReset}
                            disabled={isResettingPassword}
                            className="flex-[2] px-4 py-2.5 bg-foreground text-background text-sm font-label font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            {isResettingPassword ? (
                              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                            ) : 'Update Password'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* <button className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-surface-container transition-all group">
                    <div className="flex items-center gap-4">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-label font-medium text-foreground">Login Activity</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button> */}
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                <div>
                  <h2 className="text-xl font-headline font-bold text-foreground mb-1 text-left">Notification Preferences</h2>
                  <p className="text-sm text-muted-foreground font-body text-left">Decide how and when we reach you.</p>
                </div>

                <div className="space-y-6">
                  {[
                    { title: 'Job Updates', desc: 'Get notified when experts are assigned or jobs are completed.' },
                    { title: 'Marketplace Trends', desc: 'Alerts for popular services and new supply arrivals.' },
                    { title: 'Transaction Receipts', desc: 'Emailed directly to you after every payment release.' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start justify-between py-2 border-b border-border/50">
                      <div className="text-left">
                        <p className="text-sm font-label font-semibold text-foreground text-left">{item.title}</p>
                        <p className="text-xs text-muted-foreground font-body text-left">{item.desc}</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-10 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div>
                  <h2 className="text-xl font-headline font-bold text-foreground mb-1 text-left">Interface & Style</h2>
                  <p className="text-sm text-muted-foreground font-body text-left">Personalize your Skill-Link dashboard experience.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-foreground rounded-2xl bg-background cursor-pointer text-left">
                    <div className="w-full h-24 bg-surface-container rounded-lg mb-3 flex flex-col gap-2 p-3">
                      <div className="h-2 w-1/2 bg-foreground/20 rounded-full" />
                      <div className="h-2 w-full bg-foreground/10 rounded-full" />
                    </div>
                    <p className="text-sm font-label font-semibold text-foreground text-left">Light Mode</p>
                    <p className="text-xs text-muted-foreground font-body text-left">Best for bright environments.</p>
                  </div>
                  <div className="p-4 border border-border rounded-2xl bg-surface-container cursor-pointer text-left opacity-60 grayscale">
                    <div className="w-full h-24 bg-background rounded-lg mb-3 flex flex-col gap-2 p-3">
                      <div className="h-2 w-1/2 bg-foreground/10 rounded-full" />
                      <div className="h-2 w-full bg-foreground/5 rounded-full" />
                    </div>
                    <p className="text-sm font-label font-semibold text-foreground text-left">Dark Mode</p>
                    <p className="text-xs text-muted-foreground font-body text-left">Easy on the eyes in the dark.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};
