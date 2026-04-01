import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Lock, Shield, Loader2, Camera, 
  MapPin, Briefcase, CheckCircle2, AlertCircle, LogOut, X 
} from 'lucide-react';
import { useAuth } from "../../app/context/useAuth";
import { workerService } from '../../features/customer/services/workerService';
import { WorkerLayout } from '../../features/worker/components/layout/Layout';
import type { Worker } from '../../features/customer/types';
import { Toast } from '../../features/worker/components/ui';

type Section = 'profile' | 'service' | 'kyc' | 'security';

export const WorkerSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [toast, setToast] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    experience: 0,
    serviceRadius: 10,
    isAvailable: true,
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await workerService.getMe();
        setProfile(data);
        setFormData({
          name: data.user.name || '',
          bio: data.bio || '',
          experience: data.experience || 0,
          serviceRadius: data.serviceRadius || 10,
          isAvailable: data.isAvailable,
          skills: data.skills || [],
        });
      } catch (err) {
        console.error('Failed to fetch worker profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    }
    setSkillInput('');
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      showToast('Logout failed. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await workerService.updateMe(formData);
      setProfile(updated);
      showToast('Settings updated successfully!');
    } catch (err) {
      showToast('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <WorkerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <div className="max-w-4xl mx-auto">
        {toast && <Toast message={toast} />}

        <div className="mb-8">
          <h1 className="font-bold text-3xl text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage your professional profile and preferences.</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Nav */}
          <div className="w-64 flex-shrink-0">
            <nav className="flex flex-col gap-1">
              {[
                { id: 'profile',  label: 'Public Profile', icon: User },
                { id: 'service',  label: 'Work Preferences', icon: MapPin },
                { id: 'kyc',      label: 'ID Verification', icon: Shield },
                { id: 'security', label: 'Security',       icon: Lock },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as Section)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                    ${activeSection === id
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 min-h-[500px] shadow-sm">
            
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="relative">
                    <img
                      src={user.profileImage ?? `https://i.pravatar.cc/100?u=${user.id}`}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-50"
                      alt={user.name}
                    />
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{profile?.skills.join(' • ') || 'No skills listed'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                        {profile?.kycStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience (Years)</label>
                    <input 
                      type="number" 
                      value={formData.experience}
                      onChange={e => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email (Read Only)</label>
                    <input type="text" value={user.email} disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-400 cursor-not-allowed" />
                  </div>
                  
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skills</label>
                    <div className="flex border border-gray-200 bg-gray-50 rounded-xl overflow-hidden focus-within:border-gray-400 transition-colors shadow-sm">
                      <input 
                        type="text" 
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="e.g. Plumbing, Electrical (Press Enter to add)"
                        className="flex-1 px-4 py-2.5 bg-transparent text-sm focus:outline-none" 
                      />
                      <button 
                        type="button" 
                        onClick={(e) => {
                           e.preventDefault();
                           addSkill();
                        }}
                        className="px-5 bg-gray-900 text-white hover:bg-gray-800 font-semibold text-sm transition-colors border-l border-gray-900"
                      >
                        Add
                      </button>
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {formData.skills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-1.5 bg-gray-100 text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm animate-in fade-in zoom-in-95 duration-200">
                            <span>{skill}</span>
                            <button 
                              type="button" 
                              onClick={() => removeSkill(index)}
                              className="focus:outline-none hover:text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professional Bio</label>
                    <textarea 
                      rows={4}
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell customers about your expertise..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 resize-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Service Section */}
            {activeSection === 'service' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900 uppercase tracking-wider">Availability Status</p>
                    <p className="text-xs text-amber-700/70">When active, you'll receive new job alerts in your area.</p>
                  </div>
                  <div 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
                      ${formData.isAvailable ? 'bg-gray-900' : 'bg-gray-200'}`}
                    onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Radius</p>
                    <span className="text-sm font-bold text-gray-900">{formData.serviceRadius} km</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="50"
                    value={formData.serviceRadius}
                    onChange={e => setFormData({ ...formData, serviceRadius: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-900" 
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>Local (1km)</span>
                    <span>City Wide (50km)</span>
                  </div>
                </div>
              </div>
            )}

            {/* KYC Section */}
            {activeSection === 'kyc' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`p-6 border rounded-2xl flex flex-col items-center text-center
                  ${profile?.kycStatus === 'VERIFIED' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'}`}>
                  
                  {profile?.kycStatus === 'VERIFIED' ? (
                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-200">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-4">
                      <Shield className="w-8 h-8" />
                    </div>
                  )}

                  <h3 className="font-bold text-gray-900 text-lg">
                    {profile?.kycStatus === 'VERIFIED' ? 'Account Verified' : 'Identity Verification'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    {profile?.kycStatus === 'VERIFIED' 
                      ? 'Your professional credentials have been successfully vetted. You are now a trusted partner.'
                      : 'To unlock high-budget jobs and secure premium status, please complete your identification.'}
                  </p>

                  {profile?.kycStatus !== 'VERIFIED' && (
                    <button className="mt-6 px-8 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-lg">
                      Start Verification
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Verification Requirements</p>
                  {[
                    { label: 'Government ID (Aadhar/PAN)', done: profile?.kycStatus === 'VERIFIED' },
                    { label: 'Professional Certificate (Optional)', done: false },
                    { label: 'Background Check', done: profile?.kycStatus === 'VERIFIED' },
                  ].map(req => (
                    <div key={req.label} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border
                        ${req.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200'}`}>
                        {req.done && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className={`text-sm ${req.done ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
                    <div className="flex items-center gap-3 text-left">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Change Password</p>
                        <p className="text-xs text-gray-400">Keep your account secure with a strong password.</p>
                      </div>
                    </div>
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-red-50/30 border border-red-100 rounded-xl hover:border-red-200 transition-all group">
                    <div className="flex items-center gap-3 text-left">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="text-sm font-bold text-red-600">Delete Professional Account</p>
                        <p className="text-xs text-red-400">Permanently remove your worker profile and data.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            {activeSection !== 'kyc' && activeSection !== 'security' && (
              <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkerLayout>
  );
};
