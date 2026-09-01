import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
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

// All localStorage keys owned by TOTC
const LS_LOGGED_IN = "totc_is_logged_in";
const LS_USER = "totc_user";
const LS_TOKEN = "totc_token";

type AuthContextType = {
  isLoggedIn: boolean;
  /** True while auth state is being restored from localStorage on first load. */
  isInitializing: boolean;
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
  // isInitializing: prevents route guards from redirecting before localStorage is read
  const [isInitializing, setIsInitializing] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Hydrate auth state from localStorage once on mount
  useEffect(() => {
    try {
      const savedLoggedIn = localStorage.getItem(LS_LOGGED_IN);
      const savedUser = localStorage.getItem(LS_USER);
      const savedToken = localStorage.getItem(LS_TOKEN);

      if (savedLoggedIn === "true" && savedUser && savedToken) {
        setIsLoggedIn(true);
        setUser(JSON.parse(savedUser));
        setAccessToken(savedToken);
      }
    } catch {
      // Corrupted storage — treat as logged out
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Persist auth state to localStorage whenever it changes
  useEffect(() => {
    if (isInitializing) return;
    localStorage.setItem(LS_LOGGED_IN, JSON.stringify(isLoggedIn));
  }, [isLoggedIn, isInitializing]);

  useEffect(() => {
    if (isInitializing) return;
    if (user) {
      localStorage.setItem(LS_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_USER);
    }
  }, [user, isInitializing]);

  useEffect(() => {
    if (isInitializing) return;
    if (accessToken) {
      localStorage.setItem(LS_TOKEN, accessToken);
    } else {
      localStorage.removeItem(LS_TOKEN);
    }
  }, [accessToken, isInitializing]);

  const login = useCallback(async (credentials: LoginPayload): Promise<AuthResponse> => {
    const response = await LoginUser(credentials);
    if (response.user && response.accessToken) {
      const formattedUser = formatBackendUser(response.user);
      setUser(formattedUser);
      setAccessToken(response.accessToken);
      setIsLoggedIn(true);
    }
    return response;
  }, []);

  const adminLogin = useCallback(async (
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
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthResponse> => {
    return await registerUser(payload);
  }, []);

  const verifyOtp = useCallback(async (
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
  }, []);

  const resendOtp = useCallback(async (email: string): Promise<void> => {
    await resendOtpApi(email);
  }, []);

  const logout = useCallback(() => {
    // Clear all TOTC-specific keys from localStorage
    localStorage.removeItem(LS_LOGGED_IN);
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_TOKEN);

    setUser(null);
    setAccessToken(null);
    setIsLoggedIn(false);
  }, []);

  // Memoize context value to prevent unnecessary re-renders in all consumers
  const value = useMemo<AuthContextType>(
    () => ({
      isLoggedIn,
      isInitializing,
      user,
      setUser,
      accessToken,
      login,
      adminLogin,
      register,
      verifyOtp,
      resendOtp,
      logout,
    }),
    [isLoggedIn, isInitializing, user, accessToken, login, adminLogin, register, verifyOtp, resendOtp, logout],
  );

  return (
    <AuthContext.Provider value={value}>
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
