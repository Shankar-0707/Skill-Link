import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Calendar, Tag, AlignLeft, Type, Loader2, AlertCircle, Plus } from 'lucide-react';
import { CATEGORIES } from '../../shared/constants/categories';
import { jobService } from '../../features/customer/services/jobService';
import { Layout } from '../../features/customer/components/layout/Layout';
import { useRazorpay } from '../../shared/hooks/useRazorpay';
import { paymentsApi } from '../../services/api/payments';

interface CreateJobPageProps {
  // onNavigate removed to use useNavigate hook
}

interface FormState {
  title: string;
  description: string;
  category: string;
  customCategory: string;
  budget: string;
  scheduledAt: string;
}

const FORM_INITIAL: FormState = {
  title: '',
  description: '',
  category: '',
  customCategory: '',
  budget: '',
  scheduledAt: '',
};

export const CreateJobPage: React.FC<CreateJobPageProps> = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(FORM_INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { openRazorpay } = useRazorpay();

  const update = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setApiError(null);
  };

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.title.trim())       e.title       = 'Job title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category)           e.category    = 'Please select a category';
    if (form.category === 'Others' && !form.customCategory.trim()) {
      e.customCategory = 'Please specify your custom category';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setApiError(null);
      
      const job = await jobService.createJob({
        title: form.title,
        description: form.description,
        category: form.category === 'Others' ? form.customCategory : form.category,
        budget: form.budget ? Number(form.budget) : undefined,
        scheduledAt: form.scheduledAt || undefined,
      });

      if (job.checkoutUrl && form.budget) {
        setSubmitted(true);
        const amountInPaise = Math.round(Number(form.budget) * 100);
        
        await openRazorpay({
          amount: amountInPaise,
          currency: "INR",
          name: "Skill-Link",
          description: `Job Escrow: ${form.title}`,
          handler: async (rzpRes: any) => {
            console.log("Job Razorpay success:", rzpRes);
            try {
              if (!job.providerPaymentId) {
                throw new Error("Missing Payment ID from server");
              }
              const confirmRes = await paymentsApi.confirmPayment(job.providerPaymentId);
              if (confirmRes.redirectUrl) {
                navigate(confirmRes.redirectUrl);
              } else {
                navigate('/user/my-jobs');
              }
            } catch (confirmErr: any) {
              console.error("Backend confirmation failed:", confirmErr);
              setApiError("Payment successful but failed to update status. Please check My Jobs later.");
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            }
          }
        } as any);
      } else {
        setSubmitted(true);
        setTimeout(() => {
          navigate('/user/my-jobs');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to post job:', err);
      setApiError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-24 text-center">
        <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-green-600">✓</span>
        </div>
        <h2 className="font-headline font-bold text-xl text-foreground mb-2">Job Posted!</h2>
        <p className="text-muted-foreground font-body text-sm">Redirecting you to the next step...</p>
      </div>
    );
  }

  return (
    <Layout>

    
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Back nav */}
      <button
        onClick={() => navigate('/user/home')}
        className="flex items-center gap-2 text-sm font-label text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="font-headline font-bold text-2xl text-foreground">Post a New Job</h1>
        <p className="text-muted-foreground font-body mt-1 text-sm">
          Describe what you need done and connect with a verified local expert.
        </p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Title */}
        <div>
          <label className="block text-sm font-label font-medium text-foreground mb-1.5">
            <span className="flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Job Title</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            disabled={loading}
            placeholder="e.g. Fix electrical wiring in kitchen"
            className={`w-full px-4 py-3 bg-surface-container border rounded-xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition
              ${errors.title ? 'border-destructive' : 'border-border focus:border-outline'}`}
          />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-label font-medium text-foreground mb-1.5">
            <span className="flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" /> Description</span>
          </label>
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            disabled={loading}
            placeholder="Describe the job in detail — materials needed, access requirements, urgency..."
            rows={4}
            className={`w-full px-4 py-3 bg-surface-container border rounded-xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none transition
              ${errors.description ? 'border-destructive' : 'border-border focus:border-outline'}`}
          />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-label font-medium text-foreground mb-2">
            <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Category</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                type="button"
                key={cat.label}
                disabled={loading}
                onClick={() => update('category', cat.label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-label font-medium border transition-all
                  ${form.category === cat.label
                    ? 'bg-foreground text-background border-foreground shadow-sm'
                    : 'bg-background border-border text-foreground hover:border-outline hover:bg-surface-container'
                  }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
            
            <button
              type="button"
              disabled={loading}
              onClick={() => update('category', 'Others')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-label font-medium border transition-all
                ${form.category === 'Others'
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-background border-border text-foreground hover:border-outline hover:bg-surface-container'
                }`}
            >
              <span><Plus className="w-3.5 h-3.5" /></span>
              Others
            </button>
          </div>
          {errors.category && <p className="text-xs text-destructive mt-2">{errors.category}</p>}
          
          {/* Custom Category Input */}
          {form.category === 'Others' && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-label font-medium text-foreground mb-1.5 italic text-muted-foreground">
                Please specify your category:
              </label>
              <input
                type="text"
                value={form.customCategory}
                onChange={e => update('customCategory', e.target.value)}
                disabled={loading}
                placeholder="e.g. Pet Grooming, Deep Cleaning, etc."
                className={`w-full px-4 py-2.5 bg-background border rounded-xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition
                  ${errors.customCategory ? 'border-destructive' : 'border-border focus:border-outline'}`}
              />
              {errors.customCategory && <p className="text-xs text-destructive mt-1">{errors.customCategory}</p>}
            </div>
          )}
        </div>

        {/* Budget + Scheduled Date — two columns */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-label font-medium text-foreground mb-1.5">
              <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Budget</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-body">₹</span>
              <input
                type="number"
                value={form.budget}
                onChange={e => update('budget', e.target.value)}
                disabled={loading}
                placeholder="0.00"
                min="0"
                className="w-full pl-7 pr-4 py-3 bg-surface-container border border-border rounded-xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-outline focus:ring-2 focus:ring-foreground/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-label font-medium text-foreground mb-1.5">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Schedule</span>
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={e => update('scheduledAt', e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-surface-container border border-border rounded-xl text-sm font-body text-foreground focus:outline-none focus:border-outline focus:ring-2 focus:ring-foreground/20 transition"
            />
          </div>
        </div>

        {/* Preview card */}
        {(form.title || form.category) && (
          <div className="p-4 bg-surface-container border border-border border-dashed rounded-xl">
            <p className="text-[10px] font-label text-muted-foreground uppercase tracking-wider mb-2">Live Preview</p>
            <p className="font-headline font-semibold text-sm text-foreground">{form.title || 'Your job title'}</p>
            {form.category && (
              <span className="inline-block mt-1.5 text-[10px] font-label text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-full">
                {form.category === 'Others' ? (form.customCategory || 'Custom Category') : form.category}
              </span>
            )}
            {form.budget && (
              <p className="text-xs font-body text-muted-foreground mt-2 font-medium">Est. Budget: ₹{Number(form.budget).toLocaleString()}</p>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate('/user/home')}
            className="flex-1 px-5 py-3 border border-border text-sm font-label font-semibold rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-5 py-3 bg-foreground text-background text-sm font-label font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Job Now'
            )}
          </button>
        </div>

      </form>
    </div>
    </Layout>
  );
};