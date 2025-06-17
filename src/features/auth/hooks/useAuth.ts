// src/features/auth/hooks/useAuth.ts

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../api/authApi";
import { useUserStore } from "@/entities/user/store/userStore";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const clearUserInfo = useUserStore((state) => state.clearUserInfo);

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();

      // zustand 유저 상태 초기화
      clearUserInfo();

      // 로그아웃 후 홈페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    isLoading,
  };
}
