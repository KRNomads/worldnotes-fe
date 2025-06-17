// src/features/auth/api/authApi.ts

import { UserInfo } from "@/entities/user/types/userInfo";
import api from "@/shared/lib/api";

export const authApi = {
  getMe: async (): Promise<UserInfo> => {
    const res = await api.get(`/api/v1/auth/me`, {
      withCredentials: true,
    });
    return res.data;
  },

  logout: async () => {
    return api.post(
      `/api/v1/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  },
};
