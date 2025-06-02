// src/entities/project/api/projectApi.ts
import {
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectResponse,
} from "@/entities/project/types/project";
import api from "@/shared/lib/api";

export const projectApi = {
  fetchProjects: (): Promise<ProjectResponse[]> =>
    api.get("/api/v1/projects").then((res) => res.data),

  fetchProject: (projectId: string): Promise<ProjectResponse> =>
    api.get(`/api/v1/projects/${projectId}`).then((res) => res.data),

  createProject: (data: CreateProjectRequest): Promise<CreateProjectResponse> =>
    api.post("/api/v1/projects", data),

  updateProject: (
    projectId: string,
    data: Partial<CreateProjectRequest>
  ): Promise<ProjectResponse> =>
    api.put(`/api/v1/projects/${projectId}`, data).then((res) => res.data),

  deleteProject: (projectId: string): Promise<void> =>
    api.delete(`/api/v1/projects/${projectId}`).then(() => {}),
};
