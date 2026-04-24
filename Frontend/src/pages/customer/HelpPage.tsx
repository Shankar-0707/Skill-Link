import React, { useState } from 'react';
import { HelpCircle, MessageSquareWarning, PhoneCall, Send, ChevronDown } from 'lucide-react';
import { Layout } from '../../features/customer/components/layout/Layout';

export const HelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'faq' | 'complaint' | 'contact'>('faq');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [complaintType, setComplaintType] = useState('general');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setMessage('');
    }, 1500);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-left">
          <h1 className="font-headline font-bold text-3xl text-foreground">Help & Support</h1>
          <p className="text-muted-foreground font-body mt-1">Get help with your account, jobs, or submit a complaint.</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Nav */}
          <div className="w-64 flex-shrink-0">
            <nav className="flex flex-col gap-1">
              {[
                { id: 'faq', label: 'FAQs', icon: HelpCircle },
                { id: 'complaint', label: 'Submit Complaint', icon: MessageSquareWarning },
                { id: 'contact', label: 'Contact Us', icon: PhoneCall },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveSection(id as 'faq' | 'complaint' | 'contact');
                    setSubmitted(false);
                  }}
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
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-background border border-border rounded-2xl p-8 min-h-[500px] shadow-sm">
            
            {/* FAQ Section */}
            {activeSection === 'faq' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                <div>
                  <h2 className="text-xl font-headline font-bold text-foreground mb-1">Frequently Asked Questions</h2>
                  <p className="text-sm text-muted-foreground font-body">Find quick answers to common issues.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { q: 'How do I post a new job?', a: 'You can post a new job by clicking the "Post New Listing" button in the sidebar.' },
                    { q: 'How are payments handled?', a: 'Payments are securely processed and held in escrow until the job is completed.' },
                    { q: 'Can I cancel a reservation?', a: 'Yes, you can cancel a reservation up to 24 hours before the scheduled time with no penalty.' },
                    { q: 'How do I contact a worker?', a: 'Once a worker accepts your job, you can message them directly through the job details page.' },
                  ].map((faq, i) => (
                    <div key={i} className="p-4 border border-border rounded-xl bg-surface-container/30">
                      <h3 className="font-label font-semibold text-foreground text-sm">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground font-body mt-2">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complaint Section */}
            {activeSection === 'complaint' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                <div>
                  <h2 className="text-xl font-headline font-bold text-foreground mb-1">Submit a Complaint</h2>
                  <p className="text-sm text-muted-foreground font-body">We are sorry you experienced an issue. Let us know how we can help.</p>
                </div>

                {submitted ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <Send className="w-6 h-6" />
                    </div>
                    <h3 className="font-headline font-bold text-green-800 text-lg">Complaint Submitted</h3>
                    <p className="text-sm text-green-600 font-body">Thank you for your feedback. Our support team will review your complaint and get back to you within 24 hours.</p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-label font-medium rounded-lg hover:bg-green-700 transition"
                    >
                      Submit Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider">Complaint Type</label>
                      <div className="relative">
                        <select 
                          value={complaintType}
                          onChange={(e) => setComplaintType(e.target.value)}
                          className="w-full px-4 py-3 bg-surface-container border border-border rounded-xl text-sm font-body text-foreground focus:outline-none focus:border-outline appearance-none cursor-pointer"
                        >
                          <option value="general">General Issue</option>
                          <option value="worker">Worker Behavior / Performance</option>
                          <option value="payment">Payment / Billing</option>
                          <option value="technical">Technical Bug</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider">Job Reference (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. JOB-12345"
                        className="w-full px-4 py-3 bg-surface-container border border-border rounded-xl text-sm font-body text-foreground focus:outline-none focus:border-outline" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-label font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                      <textarea 
                        required
                        rows={5}
                        placeholder="Please describe the issue in detail..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container border border-border rounded-xl text-sm font-body text-foreground focus:outline-none focus:border-outline resize-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="px-6 py-3 bg-foreground text-background text-sm font-label font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Complaint
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                <div>
                  <h2 className="text-xl font-headline font-bold text-foreground mb-1">Contact Us</h2>
                  <p className="text-sm text-muted-foreground font-body">Direct ways to reach our support team.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 border border-border rounded-2xl bg-surface-container/50 space-y-3">
                    <div className="w-10 h-10 bg-foreground text-background rounded-lg flex items-center justify-center">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <h3 className="font-label font-semibold text-foreground">Phone Support</h3>
                    <p className="text-xs text-muted-foreground font-body">Available Mon-Fri, 9am - 6pm EST</p>
                    <p className="text-sm font-medium text-foreground tracking-wide">+1 (800) 123-4567</p>
                  </div>
                  
                  <div className="p-5 border border-border rounded-2xl bg-surface-container/50 space-y-3">
                    <div className="w-10 h-10 bg-foreground text-background rounded-lg flex items-center justify-center">
                      <MessageSquareWarning className="w-5 h-5" />
                    </div>
                    <h3 className="font-label font-semibold text-foreground">Email Support</h3>
                    <p className="text-xs text-muted-foreground font-body">We typically reply within 24 hours</p>
                    <p className="text-sm font-medium text-foreground tracking-wide">support@skill-link.com</p>
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
