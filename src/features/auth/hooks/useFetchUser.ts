// src/features/auth/hooks/useFetchUser.ts

import { useCallback } from "react";
import { authApi } from "../api/authApi";
import { useUserStore } from "@/entities/user/store/userStore";
import { UserInfo } from "@/entities/user/types/userInfo";
/**
 * 유저 정보를 서버에서 가져와서 zustand 상태를 동기화
 */
export function useFetchUser() {
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const clearUserInfo = useUserStore((state) => state.clearUserInfo);

  const fetchUser = useCallback(async () => {
    try {
      const userInfo: UserInfo = await authApi.getMe();
      setUserInfo(userInfo);
      return userInfo;
    } catch (error) {
      console.error("유저 정보 불러오기 실패", error);
      clearUserInfo();
      throw error;
    }
  }, [setUserInfo, clearUserInfo]);

  return { fetchUser };
}
