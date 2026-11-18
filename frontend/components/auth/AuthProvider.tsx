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
  acceptInvite,
  clearToken,
  fetchCurrentUser,
  getStoredToken,
  isStaffRole,
  isTwoFactorChallenge,
  loginAccount,
  registerAccount,
  storeToken,
  updateProfile,
  uploadAvatar,
  verifyLoginCode,
  type AuthResponse,
  type AuthUser,
  type ProfileUpdatePayload,
  type RegisterPayload,
  type TwoFactorChallenge,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  /** Resolves with a challenge when an emailed code is required, otherwise null once signed in. */
  login: (email: string, password: string) => Promise<TwoFactorChallenge | null>;
  verifyTwoFactor: (challengeId: string, code: string) => Promise<void>;
  completeInvite: (rawToken: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ requiresVerification: boolean }>;
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
        if (!isStaffRole(profile.role)) {
          clearToken();
          setToken(null);
          setUser(null);
          return;
        }
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

  const finishSignIn = useCallback((result: AuthResponse) => {
    if (!isStaffRole(result.user.role)) {
      clearToken();
      throw {
        error:
          "This portal is for LEAF-C staff. Request services from the Get Started form.",
        code: "staff_only",
      };
    }
    storeToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginAccount(email, password);
      if (isTwoFactorChallenge(result)) {
        return result;
      }
      finishSignIn(result);
      return null;
    },
    [finishSignIn],
  );

  const verifyTwoFactor = useCallback(
    async (challengeId: string, code: string) => {
      const result = await verifyLoginCode(challengeId, code);
      finishSignIn(result);
    },
    [finishSignIn],
  );

  const completeInvite = useCallback(
    async (rawToken: string, password: string) => {
      const result = await acceptInvite(rawToken, password);
      if (!isStaffRole(result.user.role)) {
        clearToken();
        throw {
          error:
            "This portal is for LEAF-C staff. Request services from the Get Started form.",
          code: "staff_only",
        };
      }
      storeToken(result.token);
      setToken(result.token);
      setUser(result.user);
    },
    [],
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await registerAccount(payload);
    if (result.requiresVerification || !result.token || !result.user) {
      return { requiresVerification: true };
    }
    storeToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return { requiresVerification: false };
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
      verifyTwoFactor,
      completeInvite,
      register,
      updateUser,
      uploadUserAvatar,
      logout,
    }),
    [
      user,
      token,
      isReady,
      login,
      verifyTwoFactor,
      completeInvite,
      register,
      updateUser,
      uploadUserAvatar,
      logout,
    ],
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
