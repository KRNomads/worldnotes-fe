// src/entities/note/api/noteApi.ts
import api from "@/shared/lib/api";
import {
  NoteCreateRequest,
  NoteUpdateRequest,
  NoteResponse,
} from "@/entities/note/types/note";

export const noteApi = {
  fetchNotesByProject: (projectId: string): Promise<NoteResponse[]> =>
    api.get(`/api/v1/notes/project/${projectId}`).then((res) => res.data),

  fetchNote: (noteId: string): Promise<NoteResponse> =>
    api.get(`/api/v1/notes/${noteId}`).then((res) => res.data),

  createNote: (data: NoteCreateRequest): Promise<NoteResponse> =>
    api.post(`/api/v1/notes`, data).then((res) => res.data),

  updateNote: (
    noteId: string,
    data: NoteUpdateRequest
  ): Promise<NoteResponse> =>
    api.put(`/api/v1/notes/${noteId}`, data).then((res) => res.data),

  deleteNote: (noteId: string): Promise<void> =>
    api.delete(`/api/v1/notes/${noteId}`).then(() => {}),
};
