import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Lock, Shield, Loader2, Camera, 
  MapPin, Briefcase, CheckCircle2, AlertCircle, LogOut, X,
  Upload, FileText, RotateCcw, Send, Clock, Image, BadgeCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from "../../app/context/useAuth";
import { workerService } from '../../features/customer/services/workerService';
import { WorkerLayout } from '../../features/worker/components/layout/Layout';
import type { Worker } from '../../features/customer/types';
import { Toast } from '../../features/worker/components/ui';
import { kycService } from '../../features/worker/api/kycService';
import type { KycStatusResponse, DocumentType, KycDraftDocument } from '../../features/worker/api/kycService';

type Section = 'profile' | 'service' | 'kyc' | 'security';

// ── Document card config ───────────────────────────────────────────────────────
interface DocConfig {
  type: DocumentType;
  label: string;
  description: string;
  required: boolean;
  icon: typeof FileText;
}

const DOC_CONFIG: DocConfig[] = [
  { type: 'AADHAAR',          label: 'Aadhaar Card',           description: 'Government-issued 12-digit identity card',       required: true,  icon: FileText },
  { type: 'PAN',              label: 'PAN Card',               description: '10-character alphanumeric tax identity card',    required: true,  icon: FileText },
  { type: 'PROFILE_PHOTO',    label: 'Profile Photo',          description: 'Clear, recent passport-style photograph',        required: true,  icon: Image },
  { type: 'DRIVING_LICENSE',  label: 'Driving License',        description: 'Valid driving license (optional)',               required: false, icon: FileText },
  { type: 'PASSPORT',         label: 'Passport',               description: 'Valid passport (optional)',                      required: false, icon: FileText },
  { type: 'SKILL_CERTIFICATE',label: 'Skill Certificate',     description: 'Professional certification (optional)',          required: false, icon: FileText },
];

// ── KYC Section Component ─────────────────────────────────────────────────────
const KycSection: React.FC<{ workerKycStatus: Worker['kycStatus'] }> = ({ workerKycStatus }) => {
  const [kycData, setKycData]           = useState<KycStatusResponse | null>(null);
  const [loading, setLoading]           = useState(true);
  const [uploading, setUploading]       = useState<DocumentType | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await kycService.getStatus();
      setKycData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load KYC status. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const getDraftForType = (type: DocumentType): KycDraftDocument | undefined =>
    kycData?.draftDocuments.find(d => d.documentType === type);

  const handleFileUpload = async (docType: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(docType);
    setError(null);
    try {
      await kycService.uploadDocument(file, docType);
      await fetchStatus();
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to upload ${docType}. Please try again.`);
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await kycService.submitKyc();
      setSubmitSuccess(true);
      await fetchStatus();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit KYC. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300 mb-3" />
        <p className="text-sm text-gray-400">Loading verification status...</p>
      </div>
    );
  }

  const status = kycData?.kycStatus ?? workerKycStatus;

  // ── VERIFIED state ─────────────────────────────────────────────────────────
  if (status === 'VERIFIED') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-8 bg-green-50 border border-green-100 rounded-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-5 shadow-lg shadow-green-200">
            <BadgeCheck className="w-10 h-10" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">Identity Verified ✓</h3>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Your professional credentials have been verified. You are now a trusted partner on the platform.
          </p>
          {kycData?.lastRequest?.verifiedAt && (
            <p className="text-xs text-green-600 font-semibold mt-4">
              Verified on {new Date(kycData.lastRequest.verifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── PENDING state ──────────────────────────────────────────────────────────
  if (status === 'PENDING') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-8 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-amber-400 text-white rounded-full flex items-center justify-center mb-5 shadow-lg shadow-amber-200">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">Under Review</h3>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Your documents have been submitted and are being reviewed by our team. This typically takes 1–2 business days.
          </p>
          {kycData?.pendingRequest?.submittedAt && (
            <p className="text-xs text-amber-700 font-semibold mt-4 bg-amber-100 px-3 py-1.5 rounded-lg">
              Submitted on {new Date(kycData.pendingRequest.submittedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── NOT_STARTED / REJECTED — show upload form ──────────────────────────────
  const lastRejection = status === 'REJECTED' ? kycData?.lastRequest?.rejectionReason : null;
  const requiredTypes = kycData?.requiredDocumentTypes ?? ['AADHAAR', 'PAN', 'PROFILE_PHOTO'];
  const allRequiredUploaded = requiredTypes.every(t => !!getDraftForType(t as DocumentType));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Status banner */}
      {status === 'REJECTED' && (
        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0 mt-0.5">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-red-800 mb-1">Verification Rejected</h4>
            <p className="text-sm text-red-600 leading-relaxed">
              {lastRejection || 'Your previous submission was rejected. Please re-upload the required documents and try again.'}
            </p>
          </div>
        </div>
      )}

      {status === 'NOT_STARTED' && (
        <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Complete ID Verification</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Upload the required documents below to get verified and unlock high-value job opportunities.
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Document upload cards */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
          Document Uploads
        </p>

        {DOC_CONFIG.map(({ type, label, description, required, icon: Icon }) => {
          const draft = getDraftForType(type);
          const isUploading = uploading === type;
          const isImage = type === 'PROFILE_PHOTO';

          return (
            <div
              key={type}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                draft 
                  ? 'bg-green-50/50 border-green-200' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Thumbnail or icon */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                {draft && (isImage || draft.documentUrl.match(/\.(jpg|jpeg|png|webp)/i)) ? (
                  <img src={draft.documentUrl} alt={label} className="w-full h-full object-cover" />
                ) : draft ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-[8px] text-green-600 font-bold mt-0.5">UPLOADED</span>
                  </div>
                ) : (
                  <Icon className="w-6 h-6 text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm text-gray-900">{label}</p>
                  {required && (
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-wider bg-red-50 px-1.5 py-0.5 rounded">Required</span>
                  )}
                  {!required && (
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{description}</p>
                {draft && (
                  <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Uploaded {new Date(draft.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Upload button */}
              <label className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                isUploading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : draft 
                    ? 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900' 
                    : 'bg-gray-900 text-white hover:opacity-90'
              }`}>
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : draft ? (
                  <RotateCcw className="w-3.5 h-3.5" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {isUploading ? 'Uploading...' : draft ? 'Replace' : 'Upload'}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  disabled={isUploading}
                  onChange={(e) => handleFileUpload(type, e)}
                />
              </label>
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      <div className="pt-4 border-t border-gray-100">
        {submitSuccess ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">Submitted for review!</p>
              <p className="text-xs">Our team will verify your documents within 1-2 business days.</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-4 ${allRequiredUploaded ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${allRequiredUploaded ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                {allRequiredUploaded ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[9px] font-bold text-gray-400">{kycData?.draftDocuments.filter(d => requiredTypes.includes(d.documentType as any)).length}/{requiredTypes.length}</span>}
              </div>
              <p className={`text-sm font-medium ${allRequiredUploaded ? 'text-green-700' : 'text-gray-500'}`}>
                {allRequiredUploaded 
                  ? 'All required documents uploaded! Ready to submit.' 
                  : `Upload all ${requiredTypes.length} required documents to enable submission.`}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allRequiredUploaded || submitting}
              className="w-full py-4 bg-gray-900 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-4 h-4" /> Submit for Verification</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main Settings Page ────────────────────────────────────────────────────────
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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    }
    setSkillInput('');
  };
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } };
  const removeSkill = (i: number) => setFormData({ ...formData, skills: formData.skills.filter((_, idx) => idx !== i) });
  const handleLogout = async () => { try { await logout(); navigate('/login'); } catch { showToast('Logout failed. Please try again.'); } };
  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await workerService.updateMe(formData);
      setProfile(updated);
      showToast('Settings updated successfully!');
    } catch { showToast('Failed to save settings. Please try again.'); } finally { setSaving(false); }
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
          <h1 className="font-bold text-3xl text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>Settings</h1>
          <p className="text-gray-500 mt-1">Manage your professional profile and preferences.</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Nav */}
          <div className="w-64 flex-shrink-0">
            <nav className="flex flex-col gap-1">
              {[
                { id: 'profile',  label: 'Public Profile',    icon: User },
                { id: 'service',  label: 'Work Preferences',  icon: MapPin },
                { id: 'kyc',      label: 'ID Verification',   icon: Shield },
                { id: 'security', label: 'Security',          icon: Lock },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as Section)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                    ${activeSection === id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {id === 'kyc' && profile?.kycStatus !== 'VERIFIED' && (
                    <span className={`ml-auto w-2 h-2 rounded-full animate-pulse ${profile?.kycStatus === 'PENDING' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  )}
                </button>
              ))}
            </nav>
            <div className="mt-8 pt-8 border-t border-gray-100">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-8 min-h-[500px] shadow-sm">

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="relative">
                    <img src={user.profileImage ?? `https://i.pravatar.cc/100?u=${user.id}`} className="w-24 h-24 rounded-2xl object-cover border-4 border-gray-50" alt={user.name} />
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{profile?.skills.join(' • ') || 'No skills listed'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{profile?.kycStatus}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience (Years)</label>
                    <input type="number" value={formData.experience} onChange={e => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email (Read Only)</label>
                    <input type="text" value={user.email} disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-400 cursor-not-allowed" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skills</label>
                    <div className="flex border border-gray-200 bg-gray-50 rounded-xl overflow-hidden focus-within:border-gray-400 transition-colors shadow-sm">
                      <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="e.g. Plumbing, Electrical (Press Enter)" className="flex-1 px-4 py-2.5 bg-transparent text-sm focus:outline-none" />
                      <button type="button" onClick={addSkill} className="px-5 bg-gray-900 text-white hover:bg-gray-800 font-semibold text-sm transition-colors border-l border-gray-900">Add</button>
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {formData.skills.map((skill, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-gray-100 text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-semibold">
                            <span>{skill}</span>
                            <button type="button" onClick={() => removeSkill(i)} className="hover:text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Professional Bio</label>
                    <textarea rows={4} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell customers about your expertise..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Service Section */}
            {activeSection === 'service' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center"><Briefcase className="w-5 h-5 text-amber-600" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900 uppercase tracking-wider">Availability Status</p>
                    <p className="text-xs text-amber-700/70">When active, you'll receive new job alerts in your area.</p>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${formData.isAvailable ? 'bg-gray-900' : 'bg-gray-200'}`} onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Radius</p>
                    <span className="text-sm font-bold text-gray-900">{formData.serviceRadius} km</span>
                  </div>
                  <input type="range" min="1" max="50" value={formData.serviceRadius} onChange={e => setFormData({ ...formData, serviceRadius: parseInt(e.target.value) })} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-900" />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold"><span>Local (1km)</span><span>City Wide (50km)</span></div>
                </div>
              </div>
            )}

            {/* KYC Section — fully functional */}
            {activeSection === 'kyc' && (
              <KycSection workerKycStatus={profile?.kycStatus ?? 'NOT_STARTED'} />
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
                    <ChevronRight className="w-4 h-4 text-gray-300" />
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

            {/* Save button */}
            {(activeSection === 'profile' || activeSection === 'service') && (
              <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
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
