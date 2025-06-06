// src/entities/project/model/projectStore.ts
import { create } from "zustand";
import { AxiosResponse } from "axios";
import {
  Project,
  CreateProjectRequest,
  CreateProjectResponse,
} from "@/entities/project/types/project";
import { mapProjectResponseToProject } from "@/entities/block/lib/mappers";
import { projectApi } from "../api/projectApi";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  fetchUserProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  setCurrentProject: (projectId: string) => void;
  createProject: (data: {
    title: string;
    description?: string;
  }) => Promise<Project>;
  updateProject: (
    projectId: string,
    data: { title?: string; description?: string }
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
      const data = await projectApi.fetchProjects();
      const projects: Project[] = data.map(mapProjectResponseToProject);
      set({ projects, isLoading: false });
    } catch (err) {
      set({ error: "프로젝트를 불러오는데 실패했습니다", isLoading: false });
    }
  },

  fetchProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await projectApi.fetchProject(projectId);
      const project = mapProjectResponseToProject(data);
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

  createProject: async ({ title, description }) => {
    set({ isLoading: true, error: null });
    try {
      const requestData: CreateProjectRequest = {
        name: title,
        description,
      };
      const response: AxiosResponse<CreateProjectResponse> =
        await projectApi.createProject(requestData);

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
      set({ error: "프로젝트 생성에 실패했습니다", isLoading: false });
      throw err;
    }
  },

  updateProject: async (projectId, { title, description }) => {
    set({ isLoading: true, error: null });
    try {
      const requestData = { name: title, description };
      const updatedData = await projectApi.updateProject(
        projectId,
        requestData
      );

      const updatedProject: Project = mapProjectResponseToProject(updatedData);

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
      set({ error: "프로젝트 업데이트에 실패했습니다", isLoading: false });
      throw err;
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await projectApi.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: "프로젝트 삭제에 실패했습니다", isLoading: false });
      throw err;
    }
  },
}));
