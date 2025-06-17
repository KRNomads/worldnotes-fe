import { Project, ProjectResponse } from "../types/project";

// ProjectResponse → Note
export const mapProjectResponseToProject = (dto: ProjectResponse): Project => ({
  id: dto.id,
  title: dto.title,
  overview: dto.overview,
  synopsis: dto.synopsis,
  genre: dto.genre,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});
