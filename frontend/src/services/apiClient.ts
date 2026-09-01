import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const USER_BLOCKED_MESSAGE =
  "Your account has been blocked by the administrator.";
let blockedNoticeShown = false;

window.addEventListener("totc:auth-restored", () => {
  blockedNoticeShown = false;
});

function clearStoredAuth() {
  localStorage.removeItem("totc_token");
  localStorage.removeItem("totc_user");
  localStorage.removeItem("totc_is_logged_in");
}

function handleBlockedAccount() {
  clearStoredAuth();
  window.dispatchEvent(new Event("totc:auth-blocked"));

  if (!blockedNoticeShown) {
    blockedNoticeShown = true;
    toast.error(USER_BLOCKED_MESSAGE);
  }

  const path = window.location.pathname;
  if (
    path !== "/login" &&
    path !== "/instructor/login" &&
    path !== "/admin/login"
  ) {
    const loginPath = path.startsWith("/instructor")
      ? "/instructor/login"
      : path.startsWith("/admin")
        ? "/admin/login"
        : "/login";
    window.location.assign(loginPath);
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach access token & X-Request-ID
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("totc_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers && !config.headers["X-Request-ID"]) {
      config.headers["X-Request-ID"] =
        `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle expired access token & refresh rotation
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const status = error.response?.status;

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const requestUrl = originalRequest?.url || "";

    const isAuthRequest =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/register") ||
      requestUrl.includes("/api/auth/verify-otp") ||
      requestUrl.includes("/api/auth/resend-otp") ||
      requestUrl.includes("/api/auth/forgot-password") ||
      requestUrl.includes("/api/auth/reset-password") ||
      requestUrl.includes("/api/auth/refresh");

    const responseData = error.response?.data;
    const responseCode =
      responseData && typeof responseData === "object" && "code" in responseData
        ? String((responseData as { code: unknown }).code)
        : undefined;

    if (responseCode === "USER_BLOCKED") {
      handleBlockedAccount();
    }

    /*
     * Access token expired -> try refreshing automatically once
     */
    const accessToken = localStorage.getItem("totc_token");

    if (
      status === 401 &&
      accessToken &&
      !isAuthRequest &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );
        const newAccessToken = refreshResponse.data.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token returned.");
        }

        // Save new access token
        localStorage.setItem("totc_token", newAccessToken);

        // Attach new token to original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry original request
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("totc_token");
        localStorage.removeItem("totc_user");
        localStorage.removeItem("totc_is_logged_in");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    /*
     * Normal error handling
     */
    const customMessage =
      error.response?.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
        ? String((error.response.data as any).message)
        : error.message || "An unexpected network error occurred.";

    const customError: any = new Error(customMessage);

    if (error.response?.data) {
      Object.assign(customError, error.response.data);
    }

    customError.response = error.response;

    return Promise.reject(customError);
  },
);

export default apiClient;
