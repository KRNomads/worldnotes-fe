// src/store/authStore.ts
import { create } from "zustand";
import api from "@/lib/api";

interface User {
  id: string;
  name?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // 액션
  login: (provider: string) => void;
  logout: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  login: (provider) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.post("/api/v1/auth/logout", {
        withCredentials: true,
      });
      set({ user: null, isAuthenticated: false, loading: false });
      window.location.href = "/";
    } catch (error) {
      console.error("로그아웃 실패:", error);
      set({ loading: false, error: "로그아웃에 실패했습니다" });
    }
  },

  fetchUserInfo: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/api/v1/auth/me");
      set({
        user: response.data,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error("사용자 정보 가져오기 실패:", error);
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: "사용자 정보를 가져오는데 실패했습니다",
      });
    }
  },
}));
