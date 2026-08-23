import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getToken, removeAuthToken } from "@/src/utils/storage";

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://test-us.thehorecastore.co/api/";

let countryCode = "US";
let unauthorizedHandler: (() => void) | null = null;

export const setForceCountry = (code: string) => {
  countryCode = (code || "US").toUpperCase();
};

export const getForceCountry = () => countryCode;

export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  unauthorizedHandler = fn;
};

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.params = { ...config.params, force_country: countryCode };
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const url = error.config?.url ?? "";
    const isAuthEndpoint = url.includes("/auth/") || url.includes("login");
    const isPaymentEndpoint =
      url.includes("payments") ||
      url.includes("screen-transaction") ||
      url.includes("payment-history");
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !isPaymentEndpoint
    ) {
      await removeAuthToken();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export const makeApiRequest = async <T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { method = "GET", data, params, headers: customHeaders = {} } = options;
  const response = await axiosInstance({
    url,
    method,
    params,
    ...(data !== undefined && { data }),
    headers: customHeaders,
  });
  return response.data;
};

export default axiosInstance;
