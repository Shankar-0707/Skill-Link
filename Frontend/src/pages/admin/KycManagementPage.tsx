import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Loader2, CheckCircle2, XCircle, Clock, 
  AlertCircle, Mail, Phone, FileText,
  Search, ChevronRight, ExternalLink, RefreshCcw,
  BadgeCheck, X
} from 'lucide-react';
import { adminKycService } from '@/features/admin/api/adminKycService';
import type { KycRequest } from '@/features/admin/api/adminKycService';

// ── Types & Config ────────────────────────────────────────────────────────────
type FilterStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ALL';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:  { label: 'Pending',  color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  icon: Clock },
  VERIFIED: { label: 'Verified', color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  icon: BadgeCheck },
  REJECTED: { label: 'Rejected', color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      icon: XCircle },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  AADHAAR:           'Aadhaar Card',
  PAN:               'PAN Card',
  PROFILE_PHOTO:     'Profile Photo',
  DRIVING_LICENSE:   'Driving License',
  PASSPORT:          'Passport',
  SKILL_CERTIFICATE: 'Skill Certificate',
};

// ── Detail Side Panel ─────────────────────────────────────────────────────────
const KycDetailPanel: React.FC<{
  request: KycRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  loading: boolean;
}> = ({ request, onClose, onApprove, onReject, loading }) => {
  const [rejectMode, setRejectMode]     = useState(false);
  const [reason, setReason]             = useState('');
  const [selectedImg, setSelectedImg]   = useState<string | null>(null);

  const status = STATUS_LABELS[request.status] ?? STATUS_LABELS.PENDING;
  const StatusIcon = status.icon;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-lg text-[#001F3F]">KYC Request Detail</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{request.id}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Status badge */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${status.bg}`}>
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            <div>
              <p className={`font-bold text-sm ${status.color}`}>{status.label}</p>
              <p className="text-xs text-gray-500">
                Submitted: {new Date(request.submittedAt).toLocaleString()}
              </p>
              {request.reviewedAt && (
                <p className="text-xs text-gray-400">Reviewed: {new Date(request.reviewedAt).toLocaleString()}</p>
              )}
              {request.rejectionReason && (
                <p className="text-xs text-red-500 mt-1 font-semibold">Reason: {request.rejectionReason}</p>
              )}
            </div>
          </div>

          {/* Worker info */}
          <section>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Worker Information</h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {request.worker.user.profileImage ? (
                <img src={request.worker.user.profileImage} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#001F3F]/10 flex items-center justify-center">
                  <span className="text-[#001F3F] font-black text-xl">{request.worker.user.name.charAt(0)}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <p className="font-bold text-gray-900">{request.worker.user.name}</p>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail className="w-3.5 h-3.5" />
                  {request.worker.user.email}
                </div>
                {request.worker.user.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    {request.worker.user.phone}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className={`font-bold uppercase px-2 py-0.5 rounded-md ${
                    request.worker.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                    request.worker.kycStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {request.worker.kycStatus}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Submitted Documents ({request.documents.length})
            </h3>
            <div className="space-y-3">
              {request.documents.map(doc => {
                const isImage = doc.documentUrl.match(/\.(jpg|jpeg|png|webp)/i);
                const label   = DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType;

                return (
                  <div key={doc.id} className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 rounded-xl group">
                    {/* Thumbnail */}
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 hover:ring-[#001F3F]/30 transition-all"
                      onClick={() => setSelectedImg(doc.documentUrl)}
                    >
                      {isImage ? (
                        <img src={doc.documentUrl} alt={label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <FileText className="w-6 h-6 text-gray-400" />
                          <span className="text-[8px] text-gray-400 font-bold">PDF</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Open button */}
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#001F3F] hover:border-[#001F3F]/30 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Image full-screen viewer */}
          {selectedImg && (
            <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-8" onClick={() => setSelectedImg(null)}>
              <img src={selectedImg} alt="Document" className="max-w-full max-h-full rounded-xl shadow-2xl object-contain" />
              <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Action footer */}
        {request.status === 'PENDING' && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-3">
            {rejectMode ? (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rejection Reason *</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Explain why you are rejecting this KYC request..."
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={() => { setRejectMode(false); setReason(''); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    disabled={!reason.trim() || loading}
                    onClick={() => onReject(request.id, reason)}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Confirm Reject</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setRejectMode(true)} className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  disabled={loading}
                  onClick={() => onApprove(request.id)}
                  className="flex-1 py-3 bg-[#001F3F] text-white rounded-xl text-sm font-bold hover:bg-[#001F3F]/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#001F3F]/20"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Approve</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ── Main KYC Management Page ──────────────────────────────────────────────────
export const KycManagementPage: React.FC = () => {
  const [requests, setRequests]           = useState<KycRequest[]>([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus]   = useState<FilterStatus>('PENDING');
  const [search, setSearch]               = useState('');
  const [selected, setSelected]           = useState<KycRequest | null>(null);
  const [toast, setToast]                 = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: any =
        filterStatus === 'ALL'
          ? { all: true }
          : { status: filterStatus };
      const data = await adminKycService.listRequests(params);
      const items = (data as any).items ?? data;
      setRequests(Array.isArray(items) ? items : []);
    } catch {
      showToast('Failed to load KYC requests.', false);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await adminKycService.approve(id);
      showToast('KYC request approved successfully!');
      setSelected(null);
      await fetchRequests();
    } catch {
      showToast('Failed to approve. Please try again.', false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setActionLoading(true);
    try {
      await adminKycService.reject(id, reason);
      showToast('KYC request rejected.');
      setSelected(null);
      await fetchRequests();
    } catch {
      showToast('Failed to reject. Please try again.', false);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    return !q || r.worker.user.name.toLowerCase().includes(q) || r.worker.user.email.toLowerCase().includes(q);
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="p-8 pb-16 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all animate-in slide-in-from-top duration-300 ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#001F3F] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#001F3F] tracking-tight">KYC Requests</h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-200 animate-pulse">
                {pendingCount} pending
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Review worker identity documents and manage verification status.</p>
        </div>
        <button onClick={fetchRequests} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs + search */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {(['PENDING', 'VERIFIED', 'REJECTED', 'ALL'] as FilterStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                filterStatus === s ? 'bg-white text-[#001F3F] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#001F3F]/40 w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Loading KYC requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Shield className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="font-bold text-gray-400">No KYC requests found</h3>
            <p className="text-sm text-gray-300 mt-1">
              {filterStatus === 'PENDING' ? 'No pending verifications at the moment.' : `No ${filterStatus.toLowerCase()} requests found.`}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Worker</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Documents</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(req => {
                const s = STATUS_LABELS[req.status] ?? STATUS_LABELS.PENDING;
                const SIcon = s.icon;
                return (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setSelected(req)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {req.worker.user.profileImage ? (
                          <img src={req.worker.user.profileImage} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#001F3F]/10 flex items-center justify-center font-black text-[#001F3F]">
                            {req.worker.user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-gray-900 group-hover:text-[#001F3F] transition-colors">{req.worker.user.name}</p>
                          <p className="text-xs text-gray-400">{req.worker.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-600">{new Date(req.submittedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                        <FileText className="w-3 h-3" />
                        {req.documents.length} file{req.documents.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${s.bg} ${s.color}`}>
                        <SIcon className="w-3.5 h-3.5" />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'PENDING' && (
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Action Required</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#001F3F] transition-colors" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Side panel */}
      {selected && (
        <KycDetailPanel
          request={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
