import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "../types/aut.types";
import {
  registerUser,
  LoginUser,
  verifyOtpApi,
  resendOtpApi,
  formatBackendUser,
  adminLogin as adminLoginApi,
  type RegisterPayload,
  type LoginPayload,
  type VerifyOtpPayload,
  type AuthResponse,
  type VerifyOtpResponse,
} from "../services/authService";

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  accessToken: string | null;

  login: (credentials: LoginPayload) => Promise<AuthResponse>;

  adminLogin: (credentials: LoginPayload) => Promise<AuthResponse>;

  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<VerifyOtpResponse>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("totc_is_logged_in");
    return saved ? JSON.parse(saved) : false;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("totc_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem("totc_token") || null;
  });

  useEffect(() => {
    localStorage.setItem("totc_is_logged_in", JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("totc_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("totc_user");
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("totc_token", accessToken);
    } else {
      localStorage.removeItem("totc_token");
    }
  }, [accessToken]);

  const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
    const response = await LoginUser(credentials);
    if (response.user && response.accessToken) {
      const formattedUser = formatBackendUser(response.user);
      setUser(formattedUser);
      setAccessToken(response.accessToken);
      setIsLoggedIn(true);
    }
    return response;
  };
  const adminLogin = async (
    credentials: LoginPayload,
  ): Promise<AuthResponse> => {
    const response = await adminLoginApi(credentials);

    if (!response.user || !response.accessToken) {
      throw new Error("Invalid admin login response from server.");
    }

    if (response.user.role !== "admin") {
      throw new Error("You are not authorized as an administrator.");
    }

    const formattedUser = formatBackendUser(response.user);

    setUser(formattedUser);
    setAccessToken(response.accessToken);
    setIsLoggedIn(true);

    return response;
  };
  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await registerUser(payload);
    return response;
  };

  const verifyOtp = async (
    payload: VerifyOtpPayload,
  ): Promise<VerifyOtpResponse> => {
    const response = await verifyOtpApi(payload);

    // Password reset flow
    if (response.type === "PASSWORD_RESET") {
      return response;
    }

    // Email verification flow
    if (!response.user || !response.accessToken) {
      throw new Error("Invalid verification response from server.");
    }

    const formattedUser = formatBackendUser(response.user);

    setUser(formattedUser);
    setAccessToken(response.accessToken);
    setIsLoggedIn(true);

    return {
      ...response,
      user: formattedUser,
    };
  };

  const resendOtp = async (email: string): Promise<void> => {
    await resendOtpApi(email);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        setUser,
        accessToken,
        login,
        adminLogin,
        register,
        verifyOtp,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
