// src/store/noteStore.ts
import { create } from "zustand";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
  NoteResponse, // from "@/types/note"
} from "@/types/note"; // 실제 타입 파일 경로를 정확히 확인해주세요.

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;

  fetchNotesByProject: (projectId: string) => Promise<void>;
  fetchNote: (noteId: string) => Promise<void>;
  createNote: (data: NoteCreateRequest) => Promise<Note | null>;
  updateNote: (noteId: string, data: NoteUpdateRequest) => Promise<Note | null>;
  deleteNote: (noteId: string) => Promise<boolean>;

  setCurrentNote: (noteId: string | null) => void;
  getNotesByType: (type: string, projectId?: string) => Note[];
  clearNotes: () => void;
}

// NoteResponse (API의 NoteDto)를 클라이언트 Note 타입으로 변환
const mapNoteResponseToNote = (dto: NoteResponse): Note => ({
  id: dto.noteId,
  projectId: dto.projectId,
  title: dto.title, // API 명세상 title은 항상 존재 (null 아님)
  type: dto.type,
  position: dto.position,
  lastModified: new Date().toISOString(), // 클라이언트에서 관리
});

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  fetchNotesByProject: async (projectId) => {
    if (!projectId) {
      console.warn(
        "[NoteStore] fetchNotesByProject: 유효하지 않은 프로젝트 ID:",
        projectId
      );
      set({ notes: [], isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<NoteResponse[]> = await api.get(
        `/api/v1/notes/project/${projectId}`
      );
      const fetchedNotes: Note[] = response.data.map(mapNoteResponseToNote);
      set({ notes: fetchedNotes, isLoading: false });
    } catch (err) {
      const error = err as Error | AxiosError;
      console.error(
        `[NoteStore] 프로젝트 (${projectId}) 노트 목록 가져오기 실패:`,
        error.message
      );
      set({ error: "노트를 불러오는데 실패했습니다.", isLoading: false });
    }
  },

  fetchNote: async (noteId) => {
    if (!noteId) {
      console.warn("[NoteStore] fetchNote: 유효하지 않은 노트 ID:", noteId);
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<NoteResponse> = await api.get(
        `/api/v1/notes/${noteId}`
      );
      const note = mapNoteResponseToNote(response.data);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? note : n)),
        currentNote: note,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error | AxiosError;
      console.error(
        `[NoteStore] 노트 (${noteId}) 정보 가져오기 실패:`,
        error.message
      );
      set({ error: "노트 정보를 불러오는데 실패했습니다.", isLoading: false });
    }
  },

  createNote: async (noteData: NoteCreateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<NoteResponse> = await api.post(
        "/api/v1/notes",
        noteData
      );
      const newNote = mapNoteResponseToNote(response.data);
      set((state) => ({
        notes: [...state.notes, newNote].sort(
          (a, b) => a.position - b.position
        ),
        currentNote: newNote,
        isLoading: false,
      }));
      return newNote;
    } catch (err) {
      const error = err as Error | AxiosError;
      let errorMessage = "노트 생성에 실패했습니다.";
      if (axios.isAxiosError(error) && error.response?.data) {
        const serverMessage =
          (error.response.data as any)?.message ||
          JSON.stringify(error.response.data);
        errorMessage += ` 서버 응답: ${serverMessage}`;
      }
      console.error("[NoteStore] 노트 생성 실패:", error);
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateNote: async (noteId, updateData: NoteUpdateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<NoteResponse> = await api.put(
        `/api/v1/notes/${noteId}`,
        updateData
      );
      const updatedNote = mapNoteResponseToNote(response.data);
      set((state) => ({
        notes: state.notes
          .map((n) => (n.id === noteId ? updatedNote : n))
          .sort((a, b) => a.position - b.position),
        currentNote:
          state.currentNote?.id === noteId ? updatedNote : state.currentNote,
        isLoading: false,
      }));
      return updatedNote;
    } catch (err) {
      const error = err as Error | AxiosError;
      let errorMessage = `노트 (ID: ${noteId}) 업데이트에 실패했습니다.`;
      if (axios.isAxiosError(error) && error.response?.data) {
        const serverMessage =
          (error.response.data as any)?.message ||
          JSON.stringify(error.response.data);
        errorMessage += ` 서버 응답: ${serverMessage}`;
      }
      console.error(`[NoteStore] 노트 (ID: ${noteId}) 업데이트 실패:`, error);
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deleteNote: async (noteId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/notes/${noteId}`);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== noteId),
        currentNote:
          state.currentNote?.id === noteId ? null : state.currentNote,
        isLoading: false,
      }));
      return true;
    } catch (err) {
      const error = err as Error | AxiosError;
      console.error(
        `[NoteStore] 노트 (ID: ${noteId}) 삭제 실패:`,
        error.message
      );
      set({
        error: `노트 (ID: ${noteId}) 삭제에 실패했습니다.`,
        isLoading: false,
      });
      return false;
    }
  },

  setCurrentNote: (noteId) => {
    const note = get().notes.find((n) => n.id === noteId) || null;
    set({ currentNote: note });
  },

  getNotesByType: (type, projectId) => {
    return get()
      .notes.filter(
        (n) => n.type === type && (!projectId || n.projectId === projectId)
      )
      .sort((a, b) => a.position - b.position);
  },

  clearNotes: () => {
    set({ notes: [], currentNote: null, error: null, isLoading: false });
  },
}));
