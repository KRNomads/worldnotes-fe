import { create } from "zustand";
import {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "@/entities/project/types/project";
import { projectApi } from "../api/projectApi";
import { mapProjectResponseToProject } from "../utils/mapper";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  fetchUserProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  setCurrentProject: (projectId: string) => void;
  createProject: (data: ProjectCreateRequest) => Promise<Project>;
  updateProject: (
    projectId: string,
    data: ProjectUpdateRequest
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
      const projects = data.map(mapProjectResponseToProject);
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

  createProject: async (requestData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectApi.createProject(requestData);
      const newProject = mapProjectResponseToProject(response);
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

  updateProject: async (projectId, requestData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedData = await projectApi.updateProject(
        projectId,
        requestData
      );
      const updatedProject = mapProjectResponseToProject(updatedData);

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
