// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 인증 상태 확인
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/auth/status`, {
        withCredentials: true, // 중요: 쿠키를 요청과 함께 전송
      });

      if (response.data && response.data.userId) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("인증 상태 확인 실패:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/auth/logout`, {
        withCredentials: true,
      });
      setUser(null);
      setIsAuthenticated(false);
      router.push("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    logout,
    checkAuthStatus,
  };
}
