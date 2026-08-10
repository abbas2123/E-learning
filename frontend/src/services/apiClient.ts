import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Authorization header if access token exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("totc_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error messages and preserve custom backend flags (e.g. requireOtp)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected network error occurred.";

    const customError: any = new Error(customMessage);
    if (error.response?.data) {
      Object.assign(customError, error.response.data);
    }
    customError.response = error.response;

    return Promise.reject(customError);
  }
);

export default apiClient;
