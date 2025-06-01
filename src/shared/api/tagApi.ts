import api from "../lib/api";
import { Note } from "../types/note";
import { Tag, TagCreateRequest, TagUpdateRequest } from "../types/tag";

export const tagApi = {
  // 모든 태그 조회
  getAllTags: (projectId: string) =>
    api.get<Tag[]>(`/projects/${projectId}/tags`).then((res) => res.data),

  // 단일 태그 조회
  getTag: (projectId: string, tagId: string) =>
    api
      .get<Tag>(`/projects/${projectId}/tags/${tagId}`)
      .then((res) => res.data),

  // 태그 생성
  createTag: (projectId: string, data: TagCreateRequest) =>
    api.post<Tag>(`/projects/${projectId}/tags`, data).then((res) => res.data),

  // 태그 업데이트
  updateTag: (projectId: string, tagId: string, data: TagUpdateRequest) =>
    api
      .post<Tag>(`/projects/${projectId}/tags/${tagId}`, data)
      .then((res) => res.data),

  // 태그 삭제
  deleteTag: (projectId: string, tagId: string) =>
    api.delete(`/projects/${projectId}/tags/${tagId}`),

  // 태그로 연결된 노트 목록
  getNotesByTag: (projectId: string, tagId: string) =>
    api
      .get<Note[]>(`/projects/${projectId}/tags/${tagId}/notes`)
      .then((res) => res.data),

  // 노트에 연결된 태그 목록
  getTagsByNote: (noteId: string) =>
    api.get<Tag[]>(`/notes/${noteId}/tags`).then((res) => res.data),

  // 노트에 태그 연결
  addTagToNote: (noteId: string, tagId: string) =>
    api.post(`/notes/${noteId}/tags/${tagId}`),

  // 노트에서 태그 제거
  removeTagFromNote: (noteId: string, tagId: string) =>
    api.delete(`/notes/${noteId}/tags/${tagId}`),
};
