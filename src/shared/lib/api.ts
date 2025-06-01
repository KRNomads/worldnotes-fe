// src/lib/api.ts
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }, // 모든 요청에 쿠키 포함
});

// 응답 인터셉터 (인증 실패 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 인증 실패 시 홈으로 리다이렉트
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
