import axios from "axios";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "../../features/auth/utils/tokenStorage";
import { setAuthNotice } from "../../features/auth/utils/authNotice";

function normalizeApiUrl(rawUrl?: string) {
  const fallbackUrl = "http://localhost:3000/api/v1";
  const baseUrl = (rawUrl || fallbackUrl).trim().replace(/\/+$/, "");

  if (baseUrl.endsWith("/api/v1")) {
    return baseUrl;
  }

  return `${baseUrl}/api/v1`;
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

type RetriableRequestConfig = Parameters<typeof api.request>[0] & {
  _retry?: boolean;
};

function handleSuspendedSession(message?: string) {
  clearAuthTokens();
  setAuthNotice({
    type: 'suspended',
    message:
      message ||
      'Account has been suspended. Please contact linkskillofficial@gmail.com for support.',
  });
  window.dispatchEvent(new CustomEvent('auth:suspended'));
}

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
    const errorCode = error.response?.data?.code;
    const errorMessage = error.response?.data?.message;

    if (errorCode === 'ACCOUNT_SUSPENDED') {
      handleSuspendedSession(
        Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
      );
      throw error;
    }

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
      
      // Backend wraps response in { success, statusCode, data }
      const responseData = refreshResponse.data.data || refreshResponse.data;
      const { accessToken, refreshToken: nextRefreshToken } = responseData as {
        accessToken: string;
        refreshToken: string;
      };

      setAuthTokens(accessToken, nextRefreshToken);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      const refreshErrorCode = axios.isAxiosError(refreshError)
        ? refreshError.response?.data?.code
        : undefined;
      const refreshErrorMessage = axios.isAxiosError(refreshError)
        ? refreshError.response?.data?.message
        : undefined;

      if (refreshErrorCode === 'ACCOUNT_SUSPENDED') {
        handleSuspendedSession(
          Array.isArray(refreshErrorMessage)
            ? refreshErrorMessage[0]
            : refreshErrorMessage,
        );
      } else {
        clearAuthTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      throw refreshError;
    }
  },
);

