export interface Project {
  id: string;
  title?: string;
  overview?: string;
  synopsis?: string;
  genre?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API 응답 타입 정의
export interface ProjectResponse {
  id: string;
  title?: string;
  overview?: string;
  synopsis?: string;
  genre?: string;
  createdAt: string; // "2025-06-17T12:34:56"
  updatedAt: string; // "2025-06-17T12:34:56"
}

// 프로젝트 생성 요청
export interface ProjectCreateRequest {
  title: string;
  overview?: string;
}

// 프로젝트 업데이트 요청
export interface ProjectUpdateRequest {
  title?: string;
  overview?: string;
  synopsis?: string;
  genre?: string;
}
