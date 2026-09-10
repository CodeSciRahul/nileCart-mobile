import axios, { type AxiosError } from "axios";
import { getStoredToken, setStoredToken } from "@/api/tokenStorage";
import type { ApiErrorShape } from "@/types/models";

const trimSlash = (value: string) => value.replace(/\/$/, "");

export const getApiBaseUrl = () => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  return trimSlash(fromEnv || "http://localhost:5000/api");
};

export class ApiError extends Error implements ApiErrorShape {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<{ message?: string }>) => {
    const data = error.response?.data ?? {};
    const status = error.response?.status;

    let message = data.message;

    if (!message) {
      if (!status && error.message === "Network Error") {
        message = "Unable to connect. Check your internet connection.";
      } else if (status === 401) {
        message = "Session expired. Please sign in again.";
      } else if (status === 403) {
        message = "You don't have permission to perform this action.";
      } else if (status === 404) {
        message = "Resource not found.";
      } else if (status && status >= 500) {
        message = "Server error. Please try again later.";
      } else {
        message = `Request failed (${status || "network"})`;
      }
    }

    if (status === 401) {
      await setStoredToken(null);
    }

    return Promise.reject(new ApiError(message, status, data));
  }
);
