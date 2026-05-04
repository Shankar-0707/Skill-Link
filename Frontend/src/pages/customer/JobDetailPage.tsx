import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Calendar, Shield, Loader2, MessageSquare, FileText, AlertCircle } from 'lucide-react';
import type { ChatRoom, Job, JobOffer } from '../../features/customer/types';
import { StatusBadge, SectionHeader, EmptyState } from '../../features/customer/components/ui';
import { Layout } from '../../features/customer/components/layout/Layout';
import { jobService } from '../../features/customer/services/jobService';
import { JobChatPanel } from '../../features/customer/components/JobChatPanel';
import { JobContractDocument } from '../../features/customer/components/JobContractDocument';
import { useAuth } from '../../app/context/useAuth';
import { useRazorpay } from '../../shared/hooks/useRazorpay';
import { paymentsApi } from '../../services/api/payments';

export const JobDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { openRazorpay } = useRazorpay();
  
  const [job, setJob] = useState<Job | null>(location.state as Job || null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [contractWorker, setContractWorker] = useState<JobOffer | null>(null);
  const [contractForm, setContractForm] = useState({
    cost: '',
    timing: '',
    scheduledAt: '',
    scope: '',
    notes: '',
  });
  const [loading, setLoading] = useState(!job);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);

  const fetchJob = async (id: string) => {
    try {
      setRefreshing(true);
      const data = await jobService.getJobById(id);
      setJob(data);
      setOffers(data.offers || []);
    } catch (err) {
      console.error('Failed to refresh job:', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchNegotiationData = async (jobId: string) => {
    try {
      const [nextOffers, nextChatRooms] = await Promise.all([
        jobService.getJobOffers(jobId),
        jobService.getChatRooms(jobId),
      ]);
      setOffers(nextOffers);
      setChatRooms(nextChatRooms);
      if (!selectedChatRoomId && nextChatRooms[0]) {
        setSelectedChatRoomId(nextChatRooms[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch negotiation data:', err);
    }
  };

  useEffect(() => {
    const jobId = job?.id || id;
    if (jobId) {
      fetchJob(jobId);
    } else {
      setError('Job ID is missing.');
      setLoading(false);
    }
  }, [id, job?.id]);

  useEffect(() => {
    const jobId = job?.id || id;
    if (jobId && !loading) {
      fetchNegotiationData(jobId);
    }
  }, [job?.id, id, loading]);

  const handleConfirm = async () => {
    if (!job) return;
    try {
      setRefreshing(true);
      await jobService.confirmJob(job.id);
      await fetchJob(job.id);
    } catch (err) {
      console.error('Failed to confirm job:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePayment = async () => {
    if (!job) return;
    try {
      setRefreshing(true);
      const paymentData = await jobService.createJobPayment(job.id);
      
      await openRazorpay({
        amount: paymentData.amount * 100, // to paise
        currency: "INR",
        name: "Skill-Link",
        description: `Payment for: ${job.title}`,
        handler: async (rzpRes: any) => {
          console.log("Job payment success:", rzpRes);
          try {
            await paymentsApi.confirmPayment(paymentData.providerPaymentId);
            await fetchJob(job.id);
          } catch (confirmErr) {
            console.error("Failed to confirm payment on backend:", confirmErr);
            alert("Payment successful but verification failed. Please refresh.");
          }
        },
        modal: {
          ondismiss: () => {
            setRefreshing(false);
          }
        }
      } as any);
    } catch (err: any) {
      console.error('Failed to initiate payment:', err);
      alert(err.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancel = async () => {
    if (!job) return;
    if (!window.confirm('Are you sure you want to cancel this job?')) return;
    try {
      setRefreshing(true);
      await jobService.cancelJob(job.id);
      navigate('/user/my-jobs');
    } catch (err) {
      console.error('Failed to cancel job:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const openContractForm = (offer: JobOffer) => {
    setContractWorker(offer);
    setContractError(null);
    setContractForm({
      cost: job?.budget ? String(job.budget) : '',
      timing: '',
      scheduledAt: job?.scheduledAt ? job.scheduledAt.slice(0, 16) : '',
      scope: job?.description || '',
      notes: '',
    });
  };

  const handleCreateContract = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!job || !contractWorker?.worker?.id) return;
    try {
      setRefreshing(true);
      setContractError(null);
      await jobService.createContract(job.id, contractWorker.worker.id, {
        cost: Number(contractForm.cost),
        timing: contractForm.timing,
        scheduledAt: contractForm.scheduledAt,
        scope: contractForm.scope,
        notes: contractForm.notes || undefined,
      });
      setContractWorker(null);
      await fetchJob(job.id);
      await fetchNegotiationData(job.id);
    } catch (err: any) {
      console.error('Failed to create contract:', err);
      setContractError(err.response?.data?.message || 'Failed to create contract. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm font-body text-muted-foreground">Loading job details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <EmptyState
          icon="🔍"
          title="Job Not Found"
          description={error || "We couldn't find the job you're looking for."}
          action={{ label: 'Back to My Jobs', onClick: () => navigate('/user/my-jobs') }}
        />
      </Layout>
    );
  }

  const assignedWorker = job.worker;
  const acceptedOffers = offers.filter(offer => offer.status === 'ACCEPTED');
  const selectedChatRoom = chatRooms.find(room => room.id === selectedChatRoomId);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/user/my-jobs')}
          className="flex items-center gap-2 text-sm font-label text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Jobs
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-label font-bold text-muted-foreground uppercase tracking-wider">
                {job.category}
              </span>
              <StatusBadge status={job.status} />
              {refreshing && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            <h1 className="font-headline font-bold text-2xl text-foreground leading-snug">{job.title}</h1>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {job.budget && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-border rounded-xl">
              <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-label font-semibold text-foreground">₹{job.budget.toLocaleString()}</span>
            </div>
          )}
          {job.scheduledAt && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-border rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-label text-foreground">
                {new Date(job.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border border-border rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-label text-muted-foreground">
              Posted {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="p-5 bg-surface-container border border-border rounded-xl mb-6">
          <h2 className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</h2>
          <p className="text-sm font-body text-foreground leading-relaxed">{job.description}</p>
        </div>

        {/* Escrow */}
        {job.escrow && (
          <div className={`p-4 border rounded-xl mb-6 flex items-center justify-between
            ${job.escrow.status === 'RELEASED'
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
            }`}>
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${job.escrow.status === 'RELEASED' ? 'text-green-600' : 'text-amber-600'}`} />
              <div className="flex-1">
                <p className={`text-xs font-label font-bold ${job.escrow.status === 'RELEASED' ? 'text-green-700' : 'text-amber-700'}`}>
                  Escrow {job.escrow.status === 'RELEASED' ? 'Released' : 'Held'}
                </p>
                <p className="text-xs font-body text-muted-foreground max-w-md">
                  {job.escrow.status === 'HELD'
                    ? 'Funds are secured. Released when you confirm completion.'
                    : 'Payment has been released to the worker.'}
                </p>
              </div>
            </div>
            <span className={`font-headline font-bold text-sm ${job.escrow.status === 'RELEASED' ? 'text-green-700' : 'text-amber-700'}`}>
              ₹{job.escrow.amount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Payment Alert for Completed Unpaid Jobs */}
        {job.status === 'COMPLETED' && !job.escrow && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-label font-bold text-amber-700">Payment Pending</p>
              <p className="text-xs font-body text-amber-600">
                The worker has marked the job as completed. Please pay to finalize the request.
              </p>
            </div>
            <button
              onClick={handlePayment}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-label font-bold hover:bg-amber-700 transition-colors"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* Assigned Worker */}
        {assignedWorker && (
          <div className="mb-6">
            <SectionHeader title="Assigned Worker" />
            <div className="p-5 bg-background border border-border rounded-xl flex items-center gap-4">
              <div className="relative">
                <img
                  src={assignedWorker.user.profileImage ?? `https://i.pravatar.cc/56?u=${assignedWorker.id}`}
                  alt={assignedWorker.user?.name || 'Worker'}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-label font-semibold text-foreground">{assignedWorker.user?.name || 'Assigned Worker'}</h3>
                </div>
                <p className="text-xs font-body text-muted-foreground">Successfully assigned to your request.</p>
                <p className="text-xs font-label text-green-600 mt-0.5">KYC Verified</p>
              </div>
              {!job.escrow ? (
                <button
                  onClick={handlePayment}
                  disabled={refreshing}
                  className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-label font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {refreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Pay Now
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 border border-border rounded-lg text-xs font-label font-medium opacity-50 cursor-not-allowed"
                >
                  {job.status === 'COMPLETED' ? 'Work Done' : 'In Progress'}
                </button>
              )}
            </div>
          </div>
        )}

        {job.status === 'POSTED' && (
          <div className="mb-6">
            <SectionHeader title="Worker Responses" />
            {acceptedOffers.length === 0 ? (
              <div className="p-5 bg-surface-container border border-border rounded-xl text-center">
                <p className="text-sm font-label font-semibold text-foreground">Waiting for workers to accept</p>
                <p className="text-xs font-body text-muted-foreground mt-1">
                  Eligible workers have been notified. Accepted workers will appear here with chat and contract options.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {acceptedOffers.map((offer) => {
                  const worker = offer.worker;
                  const chatRoomId = offer.chatRoom?.id || chatRooms.find(room => room.workerId === worker?.id)?.id;
                  const contract = job.contracts?.find(item => item.workerId === worker?.id);

                  return (
                    <div key={offer.id} className="p-4 bg-background border border-border rounded-xl flex items-center gap-4">
                      <img
                        src={worker?.user.profileImage ?? `https://i.pravatar.cc/48?u=${worker?.id}`}
                        alt={worker?.user.name || 'Worker'}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-label font-semibold text-foreground">{worker?.user.name || 'Worker'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {worker?.skills?.join(' / ') || 'Accepted your job request'}
                        </p>
                        {contract && (
                          <p className="text-[11px] text-green-600 mt-1">Contract: {contract.status}</p>
                        )}
                      </div>
                      {chatRoomId && (
                        <button
                          type="button"
                          onClick={() => setSelectedChatRoomId(chatRoomId)}
                          className="px-3 py-2 border border-border rounded-lg text-xs font-label font-semibold flex items-center gap-1.5 hover:bg-surface-container"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openContractForm(offer)}
                        className="px-3 py-2 bg-foreground text-background rounded-lg text-xs font-label font-semibold flex items-center gap-1.5 hover:opacity-90"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {contract ? 'Update Contract' : 'Create Contract'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedChatRoom && (
          <div className="mb-6">
            <JobChatPanel
              chatRoomId={selectedChatRoom.id}
              title={`Chat with ${selectedChatRoom.worker?.user.name || 'worker'}`}
            />
          </div>
        )}

        {contractWorker && (
          <div className="mb-6 p-5 bg-background border border-border rounded-xl">
            <SectionHeader
              title={`Contract for ${contractWorker.worker?.user.name || 'worker'}`}
              action={{ label: 'Close', onClick: () => setContractWorker(null) }}
            />
            <div className="flex flex-col gap-8">
              <JobContractDocument
                compact
                contract={{
                  cost: Number(contractForm.cost || 0),
                  timing: contractForm.timing,
                  scheduledAt: contractForm.scheduledAt,
                  scope: contractForm.scope,
                  notes: contractForm.notes || null,
                  status: 'SENT',
                }}
                jobTitle={job.title}
                customerName={user?.name || 'Customer'}
                workerName={contractWorker.worker?.user.name || 'Worker'}
              />

              <form onSubmit={handleCreateContract} className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-label font-semibold text-muted-foreground mb-1">Cost</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={contractForm.cost}
                    onChange={(event) => setContractForm(prev => ({ ...prev, cost: event.target.value }))}
                    className="w-full px-3 py-2 bg-surface-container border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label font-semibold text-muted-foreground mb-1">Date and time</label>
                  <input
                    type="datetime-local"
                    required
                    value={contractForm.scheduledAt}
                    onChange={(event) => setContractForm(prev => ({ ...prev, scheduledAt: event.target.value }))}
                    className="w-full px-3 py-2 bg-surface-container border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label font-semibold text-muted-foreground mb-1">Timing details</label>
                  <input
                    required
                    value={contractForm.timing}
                    onChange={(event) => setContractForm(prev => ({ ...prev, timing: event.target.value }))}
                    placeholder="e.g. 10 AM to 1 PM, same-day visit"
                    className="w-full px-3 py-2 bg-surface-container border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label font-semibold text-muted-foreground mb-1">Scope</label>
                  <textarea
                    required
                    rows={5}
                    value={contractForm.scope}
                    onChange={(event) => setContractForm(prev => ({ ...prev, scope: event.target.value }))}
                    className="w-full px-3 py-2 bg-surface-container border border-border rounded-lg text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label font-semibold text-muted-foreground mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={contractForm.notes}
                    onChange={(event) => setContractForm(prev => ({ ...prev, notes: event.target.value }))}
                    className="w-full px-3 py-2 bg-surface-container border border-border rounded-lg text-sm resize-none"
                  />
                </div>
                {contractError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium mb-2">
                    {contractError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={refreshing}
                    className="flex-1 px-5 py-3 bg-foreground text-background text-sm font-label font-semibold rounded-xl hover:opacity-90 disabled:opacity-60"
                  >
                    Send Contract
                  </button>
                  <button
                    type="button"
                    onClick={() => setContractWorker(null)}
                    className="px-5 py-3 border border-border text-sm font-label font-semibold rounded-xl hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {job.status === 'POSTED' && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/user/create-job', { state: job })}
              className="flex-1 px-5 py-2.5 border border-border text-sm font-label font-semibold rounded-xl hover:bg-surface-container transition-colors"
            >
              Edit Job
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 border border-destructive text-destructive text-sm font-label font-semibold rounded-xl hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {job.status === 'COMPLETED' && (
          <button
            onClick={handleConfirm}
            className="w-full px-5 py-3 bg-green-600 text-white text-sm font-label font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            Confirm Completion & Release Payment
          </button>
        )}
      </div>
    </Layout>
  );
};
