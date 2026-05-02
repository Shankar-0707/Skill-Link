import { api } from "../../../services/api/api";
import type { Worker } from "../types";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
}

export const workerService = {
  getAllWorkers: async (): Promise<Worker[]> => {
    const response = await api.get<ApiResponse<Worker[]>>("/workers");
    return response.data.data;
  },
  getWorkerById: async (id: string): Promise<Worker> => {
    const response = await api.get<ApiResponse<Worker>>(`/workers/${id}`);
    return response.data.data;
  },
  getMe: async (): Promise<Worker> => {
    const response = await api.get<ApiResponse<Worker>>("/workers/profile/me");
    return response.data.data;
  },
  updateMe: async (data: Record<string, unknown>): Promise<Worker> => {
    const response = await api.patch<ApiResponse<Worker>>("/workers/profile/me", data);
    return response.data.data;
  },
};
