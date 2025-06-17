import { create } from "zustand";
import { UserInfo } from "../types/userInfo";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserStore {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;
  clearUserInfo: () => void;
  initializeUserInfo: (info: UserInfo | null) => void;
}

// zustand persist 스토어 생성
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userInfo: null,

      // 유저 정보 저장
      setUserInfo: (info) => set({ userInfo: info }),

      // 유저 정보 초기화 (로그아웃 등)
      clearUserInfo: () => set({ userInfo: null }),

      // 유저 정보 서버에서 받아서 초기화 (앱 시작시 사용 가능)
      initializeUserInfo: (info) => set({ userInfo: info }),
    }),
    {
      name: "user-info",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
