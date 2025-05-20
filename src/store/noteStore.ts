// src/store/noteStore.ts
import { create } from "zustand";
import axios from "axios";
import {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
  NoteResponse,
} from "@/types/note";

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

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  fetchNotesByProject: async (projectId) => {
    if (!projectId) return;

    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<NoteResponse[]>(
        `/api/v1/notes/project/${projectId}`
      );
      const notes: Note[] = data.map((n) => ({
        id: n.noteId,
        projectId: n.projectId,
        title: n.title || "제목 없음",
        type: n.type,
        position: n.position,
        lastModified: new Date().toISOString(),
      }));
      set({ notes, isLoading: false });
    } catch (error) {
      set({ error: "노트를 불러오는데 실패했습니다", isLoading: false });
    }
  },

  fetchNote: async (noteId) => {
    if (!noteId) return;
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<NoteResponse>(`/api/v1/notes/${noteId}`);
      const note: Note = {
        id: data.noteId,
        projectId: data.projectId,
        title: data.title || "제목 없음",
        type: data.type,
        position: data.position,
        lastModified: new Date().toISOString(),
      };
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? note : n)),
        currentNote: note,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "노트 정보를 불러오는데 실패했습니다", isLoading: false });
    }
  },

  createNote: async (noteData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<NoteResponse>("/api/v1/notes", noteData);
      const newNote: Note = {
        id: data.noteId,
        projectId: data.projectId,
        title: data.title,
        type: data.type,
        position: data.position,
        lastModified: new Date().toISOString(),
      };
      set((state) => ({
        notes: [...state.notes, newNote],
        currentNote: newNote,
        isLoading: false,
      }));
      return newNote;
    } catch {
      set({ error: "노트 생성 실패", isLoading: false });
      return null;
    }
  },

  updateNote: async (noteId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put<NoteResponse>(
        `/api/v1/notes/${noteId}`,
        updateData
      );
      const updatedNote: Note = {
        id: data.noteId,
        projectId: data.projectId,
        title: data.title,
        type: data.type,
        position: data.position,
        lastModified: new Date().toISOString(),
      };
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updatedNote : n)),
        currentNote:
          state.currentNote?.id === noteId ? updatedNote : state.currentNote,
        isLoading: false,
      }));
      return updatedNote;
    } catch {
      set({ error: "노트 업데이트 실패", isLoading: false });
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
    } catch {
      set({ error: "노트 삭제 실패", isLoading: false });
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
