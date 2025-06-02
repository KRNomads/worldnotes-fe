export interface Project {
  id: string;
  title: string;
  lastModified: string;
  description?: string;
  genre?: string;
  userId?: string;
}

// API 응답 타입 정의
export interface ProjectResponse {
  projectId: string;
  title: string;
  description?: string;
  lastModified?: string;
  userId: string;
}

// API 요청 타입 정의
export interface CreateProjectRequest {
  name: string;
  description?: string;
}

// API 응답 타입 정의 ?
export interface CreateProjectResponse {
  projectId: string;
  userId: string;
  title: string;
  description?: string;
}
