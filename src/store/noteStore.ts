// src/store/noteStore.ts
import { create } from "zustand";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
  NoteResponse,
} from "@/shared/types/note"; // 실제 타입 경로 확인
import { mapNoteResponseToNote } from "@/shared/utils/mappers";
import api from "@/shared/lib/api";

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

  // WebSocket 메시지 등 외부 이벤트로 상태만 수정하는 메서드
  createNoteInStore: (note: Note) => void;
  updateNoteInStore: (note: Note) => void;
  deleteNoteInStore: (noteId: string) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  fetchNotesByProject: async (projectId) => {
    if (!projectId) {
      set({
        notes: [],
        isLoading: false,
        error: "프로젝트 ID가 유효하지 않습니다.",
      });
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
        // 에러 로그 유지
        `[NoteStore] fetchNotesByProject FAILED for projectId: ${projectId}:`,
        error.message
      );
      set({ error: "노트를 불러오는데 실패했습니다.", isLoading: false });
    }
  },

  fetchNote: async (noteId) => {
    if (!noteId) {
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
        currentNote:
          state.currentNote?.id === noteId ? note : state.currentNote,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error | AxiosError;
      console.error(
        // 에러 로그 유지
        `[NoteStore] fetchNote FAILED for noteId: ${noteId}:`,
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
        errorMessage += ` 서버 응답: ${
          (error.response.data as any)?.message ||
          JSON.stringify(error.response.data)
        }`;
      }
      console.error("[NoteStore] createNote FAILED:", errorMessage, error); // 에러 로그 유지
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
        errorMessage += ` 서버 응답: ${
          (error.response.data as any)?.message ||
          JSON.stringify(error.response.data)
        }`;
      }
      console.error(
        `[NoteStore] updateNote FAILED for noteId: ${noteId}`,
        errorMessage,
        error
      ); // 에러 로그 유지
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
        `[NoteStore] deleteNote FAILED for noteId: ${noteId}:`,
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
    if (noteId === undefined) {
      set({ currentNote: null });
      return;
    }
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

  createNoteInStore: (note) => {
    set((state) => ({
      notes: [...state.notes, note].sort((a, b) => a.position - b.position),
      currentNote: note,
    }));
  },

  updateNoteInStore: (note) => {
    set((state) => ({
      notes: state.notes
        .map((n) => (n.id === note.id ? note : n))
        .sort((a, b) => a.position - b.position),
      currentNote: state.currentNote?.id === note.id ? note : state.currentNote,
    }));
  },

  deleteNoteInStore: (noteId) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== noteId),
      currentNote: state.currentNote?.id === noteId ? null : state.currentNote,
    }));
  },
}));
