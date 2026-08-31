import type { User } from "../types/aut.types";
import apiClient from "./apiClient";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name?: string;
  email: string;
  password: string;
  role?: "student" | "instructor";
};

export type OtpPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

export type VerifyOtpPayload = {
  email: string;
  otp: string;
  purpose: OtpPurpose;
};
export type AuthResponse = {
  success: boolean;
  requireOtp?: boolean;
  email?: string;
  message?: string;
  user?: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    avatar: string;
    role?: string;
    isVerified?: boolean;
  };
  accessToken?: string;
};
export type VerifyOtpResponse =
  | {
      type: "EMAIL_VERIFICATION";
      user: User;
      accessToken: string;
    }
  | {
      type: "PASSWORD_RESET";
      resetToken: string;
    };

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  resetToken: string;

  password: string;
};
export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/register",
    payload,
  );
  return response.data;
}

export async function LoginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/login",
    payload,
  );
  return response.data;
}

export const verifyOtpApi = async (
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResponse> => {
  const response = await apiClient.post<VerifyOtpResponse>(
    "/api/auth/verify-otp",
    payload,
  );
  return response.data;
};

export async function resendOtpApi(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    "/api/auth/resend-otp",
    { email },
  );
  return response.data;
}

export function formatBackendUser(backendUser: AuthResponse["user"]): User {
  if (!backendUser) {
    throw new Error("User data missing from backend response.");
  }
  return {
    id: backendUser._id || backendUser.id || "usr_" + Date.now(),
    name: backendUser.name,
    email: backendUser.email,
    avatar: backendUser.avatar,
    role: backendUser.role || "Student",
    enrolledCount: 0,
    activeCourses: 0,
    gpa: "N/A",
    authProvider: "local",
  };
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{
    success: boolean;

    message: string;
  }>("/api/auth/forgot-password", payload);

  return response.data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{
    success: boolean;

    message: string;
  }>("/api/auth/reset-password", payload);

  return response.data;
}

export async function adminLogin(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/admin/login",
    payload,
  );

  return response.data;
}
