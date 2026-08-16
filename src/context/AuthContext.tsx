"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { User, Profile } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<{ message: string }>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res: any = await api.get("/api/profile");
      if (res.status === "success" && res.data) {
        setUser(res.data);
      }
    } catch {
      setUser(null);
      api.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const res: any = await api.post("/api/auth/login", { email, password });
    if (res.status === "success" && res.accessToken) {
      api.setTokens(res.accessToken, res.refreshToken);
      await fetchProfile();
    }
  };

  const registerUser = async (firstName: string, lastName: string, email: string, password: string) => {
    const res: any = await api.post("/api/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });
    return { message: res.message };
  };

  const verifyEmail = async (email: string, otp: string) => {
    await api.post("/api/auth/verify-email", { email, otp });
  };

  const resendOtp = async (email: string) => {
    await api.post("/api/auth/resend-otp", { email });
  };

  const forgotPassword = async (email: string) => {
    await api.post("/api/auth/forgot-password", { email });
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await api.post("/api/auth/reset-password", { email, otp, newPassword });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post("/api/auth/change-password", { currentPassword, newPassword });
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken") || undefined,
      });
    } catch {
      // Proceed with local logout regardless of network state
    } finally {
      api.clearTokens();
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const res: any = await api.patch("/api/profile", data);
    if (res.status === "success") {
      await fetchProfile();
    }
  };

  const updateAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("picture", file);
    await api.patch("/api/profile/picture", formData);
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register: registerUser,
        verifyEmail,
        resendOtp,
        forgotPassword,
        resetPassword,
        changePassword,
        logout,
        updateProfile,
        updateAvatar,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
