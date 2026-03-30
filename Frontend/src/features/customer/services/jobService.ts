import { api } from "../../../services/api/api";
import type { Job } from "../types";

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
};
