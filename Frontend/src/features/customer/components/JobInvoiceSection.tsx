import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Receipt } from 'lucide-react';
import { jobService } from '../services/jobService';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  jobId: string;
  amount: number;
  workerPayout: number;
  platformFee: number;
  jobTitle: string;
  jobCategory: string;
  completedAt: string;
  customerName: string | null;
  workerName: string | null;
  createdAt: string;
}

interface JobInvoiceSectionProps {
  jobId: string;
  /** Whether to show the worker-payout row (hide it on customer view, show on worker view) */
  showWorkerPayout?: boolean;
}

export const JobInvoiceSection: React.FC<JobInvoiceSectionProps> = ({
  jobId,
  showWorkerPayout = false,
}) => {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const data = await jobService.getInvoiceByJobId(jobId);
        setInvoice(data);
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [jobId]);

  const handleDownload = async () => {
    if (!invoice) return;
    try {
      setDownloading(true);
      const blob = await jobService.downloadInvoice(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download invoice:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return null; // Silently hide if no invoice exists
  }

  const completedDate = new Date(invoice.completedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-foreground text-background text-sm font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 shadow-sm"
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Downloading Invoice...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download Invoice
        </>
      )}
    </button>
  );
};

