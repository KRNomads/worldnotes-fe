// src/store/projectStore.ts
import { create } from "zustand";
import { Project } from "@/types/project";
import axios, { AxiosError, AxiosResponse } from "axios"; // axios로 직접 변경

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // 또는 환경 변수 등에서 불러오는 URL

// API 요청 타입 정의
interface CreateProjectRequest {
  name: string;
  description?: string;
}

// API 응답 타입 정의
interface CreateProjectResponse {
  projectId: string;
  userId: string;
  title: string;
  description?: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  fetchUserProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  setCurrentProject: (projectId: string) => void;
  createProject: (projectData: {
    title: string;
    description?: string;
  }) => Promise<Project>;
  updateProject: (
    projectId: string,
    updateData: {
      title?: string;
      description?: string;
    }
  ) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
}

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchUserProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      // API에서 프로젝트 목록 가져오기
      const response: AxiosResponse = await api.get("/api/v1/projects");

      // API 응답 데이터를 Project[] 타입으로 변환 (id 필드 매핑)
      const fetchedProjects: Project[] = response.data.map(
        (projectData: Record<string, unknown>) => ({
          id: projectData.projectId as string,
          title: (projectData.title as string) || "제목 없음",
          lastModified:
            (projectData.lastModified as string) || new Date().toISOString(),
          description: projectData.description as string | undefined,
          userId: projectData.userId as string,
        })
      );

      // 매핑된 데이터로 상태 업데이트
      set({ projects: fetchedProjects, isLoading: false });
    } catch (err) {
      const error = err as Error | AxiosError;
      set({
        error: "프로젝트를 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  fetchProject: async (projectId) => {
    // 프로젝트 ID가 유효한지 확인
    if (!projectId || projectId === "undefined") {
      set({
        error: "유효하지 않은 프로젝트 ID입니다",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse = await api.get(
        `/api/v1/projects/${projectId}`
      );

      // API 응답 데이터를 프론트엔드 모델로 변환
      const project: Project = {
        id: response.data.projectId,
        title: response.data.title || "제목 없음", // 기본값 제공
        lastModified: new Date().toISOString(), // 현재 시간으로 초기화
      };

      set({ currentProject: project, isLoading: false });
    } catch (err) {
      set({
        error: "프로젝트 정보를 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  setCurrentProject: (projectId) => {
    const { projects } = get();
    const project = projects.find((p) => p.id === projectId) || null;
    set({ currentProject: project });
  },

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      // 백엔드 API가 요구하는 형식으로 변환
      const requestData: CreateProjectRequest = {
        name: projectData.title, // title -> name으로 변환
        description: projectData.description,
      };

      const response: AxiosResponse<CreateProjectResponse> = await api.post(
        "/api/v1/projects",
        requestData
      );

      // 응답에서 받은 데이터를 Project 타입에 맞게 변환
      const newProject: Project = {
        id: response.data.projectId,
        title: response.data.title,
        lastModified: new Date().toISOString(),
      };

      set((state) => ({
        projects: [...state.projects, newProject],
        currentProject: newProject,
        isLoading: false,
      }));

      return newProject;
    } catch (err) {
      set({
        error: "프로젝트 생성에 실패했습니다",
        isLoading: false,
      });
      throw err;
    }
  },

  updateProject: async (projectId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      // 백엔드 API가 요구하는 형식으로 변환
      const requestData = {
        name: updateData.title, // title -> name으로 변환
        description: updateData.description,
      };

      const response = await api.put(
        `/api/v1/projects/${projectId}`,
        requestData
      );

      // 응답에서 받은 데이터를 Project 타입에 맞게 변환
      const updatedProject: Project = {
        id: response.data.projectId,
        title: response.data.title,
        lastModified: new Date().toISOString(),
        description: response.data.description,
        userId: response.data.userId,
      };

      // 프로젝트 목록과 현재 프로젝트 상태 업데이트
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? updatedProject : project
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }));

      return updatedProject;
    } catch (err) {
      set({
        error: "프로젝트 업데이트에 실패했습니다",
        isLoading: false,
      });
      throw err;
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/projects/${projectId}`);

      // 삭제된 프로젝트를 상태에서 제거
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: "프로젝트 삭제에 실패했습니다",
        isLoading: false,
      });
      throw err;
    }
  },
}));
