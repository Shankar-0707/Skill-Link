import React from 'react';
import type { JobContract, JobContractStatus } from '../types';

type ContractDocumentData = Pick<
  JobContract,
  'cost' | 'timing' | 'scheduledAt' | 'scope' | 'notes' | 'status'
> & {
  id?: string;
};

interface JobContractDocumentProps {
  contract: ContractDocumentData;
  jobTitle: string;
  customerName?: string | null;
  workerName?: string | null;
  issuedAt?: string;
  compact?: boolean;
}

const statusStyles: Record<JobContractStatus, string> = {
  SENT: 'bg-blue-50 text-blue-700 border-blue-100',
  ACCEPTED: 'bg-green-50 text-green-700 border-green-100',
  REJECTED: 'bg-red-50 text-red-700 border-red-100',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
};

function formatDate(value?: string) {
  if (!value) {
    return 'To be confirmed';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'To be confirmed';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(value?: string) {
  if (!value) {
    return 'To be confirmed';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'To be confirmed';
  }

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-900">
      {children}
    </span>
  );
}

export const JobContractDocument: React.FC<JobContractDocumentProps> = ({
  contract,
  jobTitle,
  customerName,
  workerName,
  issuedAt,
  compact = false,
}) => {
  const displayCustomerName = customerName || 'Customer';
  const displayWorkerName = workerName || 'Worker';
  const status = contract.status || 'SENT';
  const displayCost = `Rs ${Number(contract.cost || 0).toLocaleString('en-IN')}`;
  const displayDate = formatDate(contract.scheduledAt);
  const displayTime = formatTime(contract.scheduledAt);
  const displayIssuedAt = issuedAt
    ? formatDate(issuedAt)
    : formatDate(new Date().toISOString());

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-[#172f7a] px-6 py-6 text-white">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
              Skill-Link
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal">
              Job Contract
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-50">
              Formal agreement for service work between customer and worker.
            </p>
          </div>

          <div className="text-left md:text-right">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[status]}`}
            >
              {status}
            </span>
            <p className="mt-3 text-xs text-blue-100">Issued</p>
            <p className="text-sm font-semibold">
              {displayIssuedAt}
            </p>
          </div>
        </div>
      </div>

      <div className={`${compact ? 'p-5' : 'p-6 md:p-8'}`}>
        <div className="border-b border-gray-200 pb-5">
          <p className="text-sm leading-7 text-gray-700">
            Date: <Highlight>{displayIssuedAt}</Highlight>
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-700">
            This Job Contract is entered into between <Highlight>{displayCustomerName}</Highlight>, the
            customer, and <Highlight>{displayWorkerName}</Highlight>, the service worker, for the service
            request titled <Highlight>{jobTitle}</Highlight>.
          </p>
        </div>

        <div className="space-y-6 py-6 text-sm leading-7 text-gray-700">
          <p>
            The customer agrees to engage the worker for the work described in this contract.
            The worker agrees to review the terms carefully and may begin the job only after
            accepting this contract through Skill-Link.
          </p>

          <p>
            The agreed service cost for this job is <Highlight>{displayCost}</Highlight>. This amount is
            associated with the agreed scope of work and may be used for payment or escrow
            handling according to Skill-Link's job process.
          </p>

          <p>
            The job is scheduled for <Highlight>{displayDate}</Highlight> at <Highlight>{displayTime}</Highlight>.
            The timing arrangement is: <Highlight>{contract.timing || 'To be confirmed'}</Highlight>.
          </p>

          <section>
            <p className="font-semibold text-gray-950">Scope of work</p>
            <p className="mt-2 whitespace-pre-wrap">
              <Highlight>
                {contract.scope || 'Scope will be finalized before the job starts.'}
              </Highlight>
            </p>
          </section>

          {contract.notes && (
            <section>
              <p className="font-semibold text-gray-950">Additional notes</p>
              <p className="mt-2 whitespace-pre-wrap">
                <Highlight>{contract.notes}</Highlight>
              </p>
            </section>
          )}

          <p>
            By accepting this contract, the worker confirms that the listed details are clear
            and agreed upon. The customer confirms that this contract represents the final
            job details discussed with the worker.
          </p>
        </div>

        <div className="mt-8 grid gap-5 border-t border-gray-200 pt-6 md:grid-cols-2">
          <div>
            <p className="text-xs text-gray-400">Customer confirmation</p>
            <div className="mt-8 border-t border-gray-300 pt-2 text-sm font-semibold text-gray-700">
              <Highlight>{displayCustomerName}</Highlight>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400">Worker acceptance</p>
            <div className="mt-8 border-t border-gray-300 pt-2 text-sm font-semibold text-gray-700">
              <Highlight>
                {status === 'ACCEPTED' ? displayWorkerName : 'Pending worker acceptance'}
              </Highlight>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs leading-6 text-gray-400">
          This contract becomes active only after the worker accepts it in Skill-Link.
        </p>
      </div>
    </article>
  );
};
