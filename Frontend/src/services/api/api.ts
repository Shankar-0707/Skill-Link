import axios from "axios";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "../../features/auth/utils/tokenStorage";

function normalizeApiUrl(rawUrl?: string) {
  const fallbackUrl = "http://localhost:3000/api/v1";
  const baseUrl = (rawUrl || fallbackUrl).trim().replace(/\/+$/, "");

  if (baseUrl.endsWith("/api/v1")) {
    return baseUrl;
  }

  return `${baseUrl}/api/v1`;
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // "x-mock-role": "WOKRER",
    // "x-mock-userid": "xhuigdwdjkwedhuwdh"
  },
});

type RetriableRequestConfig = Parameters<typeof api.request>[0] & {
  _retry?: boolean;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const refreshToken = getRefreshToken();

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !refreshToken ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      throw error;
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });
      const { accessToken, refreshToken: nextRefreshToken } =
        refreshResponse.data as {
          accessToken: string;
          refreshToken: string;
        };

      setAuthTokens(accessToken, nextRefreshToken);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      throw refreshError;
    }
  },
);
