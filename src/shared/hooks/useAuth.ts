// src/hooks/useAuth.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 로그아웃
  const logout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/logout`, {
        withCredentials: true,
      });
      // 로그아웃 후 홈페이지로 리다이렉트
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
