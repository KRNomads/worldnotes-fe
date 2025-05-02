// src/store/projectStore.ts
import { create } from "zustand";
import { Project } from "@/types/project";
import api from "@/lib/api";

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

  // 액션
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

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchUserProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      // API에서 프로젝트 목록 가져오기
      const response = await api.get("/api/v1/projects");

      // API 응답 데이터를 Project[] 타입으로 변환 (id 필드 매핑)
      const fetchedProjects: Project[] = response.data.map(
        (projectData: any) => ({
          id: projectData.projectId, // 백엔드의 projectId를 프론트엔드의 id로 매핑합니다.
          title: projectData.title || "제목 없음",
          // 백엔드 응답의 lastModified 필드명을 확인하고 맞춰주세요. 없다면 기본값 사용.
          lastModified: projectData.lastModified || new Date().toISOString(),
          // 백엔드 응답에 다른 필드(description, genre 등)가 있다면 여기에 추가합니다.
          description: projectData.description,
          userId: projectData.userId,
        })
      );

      // 매핑된 데이터로 상태 업데이트
      set({ projects: fetchedProjects, isLoading: false });
    } catch (error) {
      console.error("프로젝트 목록을 가져오는데 실패했습니다:", error);
      set({
        error: "프로젝트를 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  fetchProject: async (projectId) => {
    // 프로젝트 ID가 유효한지 확인
    if (!projectId || projectId === "undefined") {
      console.error("유효하지 않은 프로젝트 ID:", projectId);
      set({
        error: "유효하지 않은 프로젝트 ID입니다",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      console.log(`프로젝트 조회 요청: /api/v1/projects/${projectId}`);

      // API 요청
      const response = await api.get(`/api/v1/projects/${projectId}`);
      console.log("프로젝트 상세 정보:", response.data);

      // API 응답 데이터를 프론트엔드 모델로 변환
      const project: Project = {
        id: response.data.projectId,
        title: response.data.title || "제목 없음", // 기본값 제공
        lastModified: new Date().toISOString(), // 현재 시간으로 초기화
      };

      set({ currentProject: project, isLoading: false });
    } catch (error) {
      console.error(`프로젝트 ID ${projectId} 조회 실패:`, error);
      // 상세 에러 정보 확인
      if (error.response) {
        console.error("에러 응답 데이터:", error.response.data);
        console.error("에러 상태 코드:", error.response.status);
      }
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

      console.log("프로젝트 생성 요청 데이터:", requestData);

      const response = await api.post<CreateProjectResponse>(
        "/api/v1/projects",
        requestData
      );
      console.log("프로젝트 생성 응답:", response.data);

      // 응답에서 받은 데이터를 Project 타입에 맞게 변환
      // projectId를 id로 매핑
      const newProject: Project = {
        id: response.data.projectId, // 여기가 중요! projectId를 id로 사용
        title: response.data.title,
        lastModified: new Date().toISOString(), // 현재 시간으로 초기화
      };

      set((state) => ({
        projects: [...state.projects, newProject],
        currentProject: newProject,
        isLoading: false,
      }));

      return newProject;
    } catch (error) {
      console.error("프로젝트 생성에 실패했습니다:", error);
      // 에러 응답 내용 확인
      if (error.response) {
        console.error("에러 응답 데이터:", error.response.data);
      }
      set({
        error: "프로젝트 생성에 실패했습니다",
        isLoading: false,
      });
      throw error;
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

      console.log(`프로젝트 업데이트 요청 데이터:`, requestData);

      const response = await api.put(
        `/api/v1/projects/${projectId}`,
        requestData
      );
      console.log("프로젝트 업데이트 응답:", response.data);

      // 응답에서 받은 데이터를 Project 타입에 맞게 변환
      const updatedProject: Project = {
        id: response.data.projectId,
        title: response.data.title,
        lastModified: new Date().toISOString(), // 현재 시간으로 업데이트
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
    } catch (error) {
      console.error(`프로젝트 ID ${projectId} 업데이트 실패:`, error);
      // 에러 응답 내용 확인
      if (error.response) {
        console.error("에러 응답 데이터:", error.response.data);
      }
      set({
        error: "프로젝트 업데이트에 실패했습니다",
        isLoading: false,
      });
      throw error;
    }
  },

  // 새로 추가된 deleteProject 함수
  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`프로젝트 삭제 요청: /api/v1/projects/${projectId}`);

      await api.delete(`/api/v1/projects/${projectId}`);
      console.log(`프로젝트 ID ${projectId} 삭제 성공`);

      // 삭제된 프로젝트를 상태에서 제거
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      console.error(`프로젝트 ID ${projectId} 삭제 실패:`, error);
      // 에러 응답 내용 확인
      if (error.response) {
        console.error("에러 응답 데이터:", error.response.data);
      }
      set({
        error: "프로젝트 삭제에 실패했습니다",
        isLoading: false,
      });
      throw error;
    }
  },
}));
