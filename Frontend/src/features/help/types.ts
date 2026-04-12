export type HelpTicketStatus = 'OPEN' | 'RESOLVED' | 'REJECTED';

export interface HelpTicketUserSummary {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: string;
}

export interface HelpTicketReviewerSummary {
  id: string;
  name?: string | null;
  email: string;
}

export interface HelpTicketReservationSummary {
  id: string;
  status: string;
  quantity?: number;
  product: {
    id: string;
    name: string;
    organisationId: string;
    organisation?: {
      id: string;
      businessName: string;
    };
  };
  customer?: {
    id: string;
    user: {
      id: string;
      name?: string | null;
      email: string;
    };
  };
}

export interface HelpTicketJobSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  budget?: number | null;
  customer: {
    id: string;
    user: {
      id: string;
      name?: string | null;
      email: string;
      phone?: string | null;
    };
  };
  worker?: {
    id: string;
    user: {
      id: string;
      name?: string | null;
      email: string;
      phone?: string | null;
    };
  } | null;
}

export interface HelpTicketWorkerSummary {
  id: string;
  userId: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
    phone?: string | null;
  };
}

export interface HelpTicketOrganisationSummary {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  user: {
    id: string;
    email: string;
    phone?: string | null;
  };
}

export interface HelpTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  status: HelpTicketStatus;
  jobId?: string | null;
  reservationId?: string | null;
  workerId?: string | null;
  organisationId?: string | null;
  createdByUserId: string;
  resolutionNote?: string | null;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUser: HelpTicketUserSummary;
  reviewedByUser?: HelpTicketReviewerSummary | null;
  job?: HelpTicketJobSummary | null;
  reservation?: HelpTicketReservationSummary | null;
  worker?: HelpTicketWorkerSummary | null;
  organisation?: HelpTicketOrganisationSummary | null;
}

export interface CreateHelpTicketPayload {
  subject: string;
  message: string;
  jobId?: string;
  reservationId?: string;
  workerId?: string;
  organisationId?: string;
}

export interface AdminHelpTicketListParams {
  status?: HelpTicketStatus;
  all?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedHelpTickets {
  items: HelpTicket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
