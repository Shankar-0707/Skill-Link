import { api } from "../../../services/api/api";
import type { ChatMessage, ChatRoom, Job, JobContract, JobOffer } from "../types";

export interface CreateJobDto {
  title: string;
  description: string;
  category: string;
  budget?: number;
  scheduledAt?: string;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  category?: string;
  budget?: number;
  scheduledAt?: string;
}

export interface CreateJobContractDto {
  cost: number;
  timing: string;
  scheduledAt: string;
  scope: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
}

export const jobService = {
  createJob: async (dto: CreateJobDto): Promise<Job> => {
    const response = await api.post<ApiResponse<Job>>("/jobs", dto);
    return response.data.data;
  },

  getMyJobs: async (): Promise<Job[]> => {
    const response = await api.get<ApiResponse<Job[]>>("/jobs/my");
    return response.data.data || [];
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data.data;
  },

  updateJob: async (id: string, dto: UpdateJobDto): Promise<Job> => {
    const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}`, dto);
    return response.data.data;
  },

  cancelJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  assignWorker: async (jobId: string, workerId: string): Promise<Job> => {
    const response = await api.patch<ApiResponse<Job>>(`/jobs/${jobId}/assign/${workerId}`);
    return response.data.data;
  },

  confirmJob: async (id: string): Promise<Job> => {
    const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}/confirm`);
    return response.data.data;
  },

  getAvailableJobs: async (): Promise<Job[]> => {
    const response = await api.get<ApiResponse<Job[]>>("/jobs/available");
    return response.data.data || [];
  },

  getMyAssignments: async (): Promise<Job[]> => {
    const response = await api.get<ApiResponse<Job[]>>("/jobs/my-assignments");
    return response.data.data || [];
  },

  getMyJobOffers: async (): Promise<JobOffer[]> => {
    const response = await api.get<ApiResponse<JobOffer[]>>("/jobs/offers/my");
    return response.data.data || [];
  },

  getJobOffers: async (jobId: string): Promise<JobOffer[]> => {
    const response = await api.get<ApiResponse<JobOffer[]>>(`/jobs/${jobId}/offers`);
    return response.data.data || [];
  },

  acceptJobOffer: async (jobId: string): Promise<JobOffer> => {
    const response = await api.patch<ApiResponse<JobOffer>>(`/jobs/${jobId}/offers/accept`);
    return response.data.data;
  },

  rejectJobOffer: async (jobId: string): Promise<JobOffer> => {
    const response = await api.patch<ApiResponse<JobOffer>>(`/jobs/${jobId}/offers/reject`);
    return response.data.data;
  },

  getChatRooms: async (jobId: string): Promise<ChatRoom[]> => {
    const response = await api.get<ApiResponse<ChatRoom[]>>(`/jobs/${jobId}/chat-rooms`);
    return response.data.data || [];
  },

  getChatMessages: async (chatRoomId: string): Promise<ChatMessage[]> => {
    const response = await api.get<ApiResponse<ChatMessage[]>>(`/jobs/chat-rooms/${chatRoomId}/messages`);
    return response.data.data || [];
  },

  createContract: async (
    jobId: string,
    workerId: string,
    dto: CreateJobContractDto,
  ): Promise<JobContract> => {
    const response = await api.post<ApiResponse<JobContract>>(`/jobs/${jobId}/contracts/${workerId}`, dto);
    return response.data.data;
  },

  acceptContract: async (contractId: string): Promise<{ contract: JobContract; job: Job }> => {
    const response = await api.patch<ApiResponse<{ contract: JobContract; job: Job }>>(`/jobs/contracts/${contractId}/accept`);
    return response.data.data;
  },

  rejectContract: async (contractId: string): Promise<JobContract> => {
    const response = await api.patch<ApiResponse<JobContract>>(`/jobs/contracts/${contractId}/reject`);
    return response.data.data;
  },

  startJob: async (id: string): Promise<Job> => {
    const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}/start`);
    return response.data.data;
  },

  completeJob: async (id: string): Promise<Job> => {
    const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}/complete`);
    return response.data.data;
  },

  createJobPayment: async (id: string): Promise<{ checkoutUrl: string; providerPaymentId: string; amount: number }> => {
    const response = await api.post<ApiResponse<{ checkoutUrl: string; providerPaymentId: string; amount: number }>>(`/jobs/${id}/pay`);
    return response.data.data;
  },
};
