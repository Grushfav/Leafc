"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearToken,
  fetchCurrentUser,
  getStoredToken,
  loginAccount,
  registerAccount,
  storeToken,
  updateProfile,
  uploadAvatar,
  type AuthUser,
  type ProfileUpdatePayload,
  type RegisterPayload,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateUser: (payload: ProfileUpdatePayload) => Promise<void>;
  uploadUserAvatar: (file: File) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setIsReady(true);
      return;
    }

    fetchCurrentUser(stored)
      .then((profile) => {
        setToken(stored);
        setUser(profile);
      })
      .catch(() => {
        clearToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginAccount(email, password);
    storeToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await registerAccount(payload);
    storeToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const updateUser = useCallback(async (payload: ProfileUpdatePayload) => {
    const stored = token ?? getStoredToken();
    if (!stored) {
      throw { error: "Sign in required." };
    }
    const next = await updateProfile(stored, payload);
    setUser(next);
  }, [token]);

  const uploadUserAvatar = useCallback(async (file: File) => {
    const stored = token ?? getStoredToken();
    if (!stored) {
      throw { error: "Sign in required." };
    }
    const next = await uploadAvatar(stored, file);
    setUser(next);
  }, [token]);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      login,
      register,
      updateUser,
      uploadUserAvatar,
      logout,
    }),
    [user, token, isReady, login, register, updateUser, uploadUserAvatar, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
