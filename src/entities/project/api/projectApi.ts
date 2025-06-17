// src/entities/project/api/projectApi.ts
import {
  ProjectCreateRequest,
  ProjectResponse,
} from "@/entities/project/types/project";
import api from "@/shared/lib/api";

export const projectApi = {
  fetchProjects: (): Promise<ProjectResponse[]> =>
    api.get("/api/v1/projects").then((res) => res.data),

  fetchProject: (projectId: string): Promise<ProjectResponse> =>
    api.get(`/api/v1/projects/${projectId}`).then((res) => res.data),

  createProject: (data: ProjectCreateRequest): Promise<ProjectResponse> =>
    api.post("/api/v1/projects", data),

  updateProject: (
    projectId: string,
    data: Partial<ProjectCreateRequest>
  ): Promise<ProjectResponse> =>
    api.patch(`/api/v1/projects/${projectId}`, data).then((res) => res.data),

  deleteProject: (projectId: string): Promise<void> =>
    api.delete(`/api/v1/projects/${projectId}`).then(() => {}),
};
