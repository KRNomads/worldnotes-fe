// src/store/projectStore.ts
import { create } from "zustand";
import {
  CreateProjectRequest,
  CreateProjectResponse,
  Project,
} from "@/types/project";
import { AxiosResponse } from "axios";
import api from "@/lib/api";
import { mapProjectResponseToProject } from "@/utils/mappers";

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

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchUserProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/api/v1/projects");
      const fetchedProjects: Project[] = response.data.map(
        mapProjectResponseToProject
      );
      set({ projects: fetchedProjects, isLoading: false });
    } catch (err) {
      set({
        error: "프로젝트를 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  fetchProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/v1/projects/${projectId}`);
      const project: Project = mapProjectResponseToProject(response.data);
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
      const requestData = {
        name: updateData.title,
        description: updateData.description,
      };
      const response = await api.put(
        `/api/v1/projects/${projectId}`,
        requestData
      );
      const updatedProject: Project = mapProjectResponseToProject(
        response.data
      );
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? updatedProject : p
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
