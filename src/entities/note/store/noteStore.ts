// src/entities/note/model/noteStore.ts
import { create } from "zustand";
import {
  Note,
  NoteCreateRequest,
  NoteUpdateRequest,
} from "@/entities/note/types/note";
import { noteApi } from "../api/noteApi";
import { mapNoteResponseToNote } from "../lib/mapper";

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
      const data = await noteApi.fetchNotesByProject(projectId);
      const fetchedNotes: Note[] = data.map(mapNoteResponseToNote);
      set({ notes: fetchedNotes, isLoading: false });
    } catch (err: any) {
      console.error(
        `[NoteStore] fetchNotesByProject FAILED for projectId: ${projectId}:`,
        err.message
      );
      set({ error: "노트를 불러오는데 실패했습니다.", isLoading: false });
    }
  },

  fetchNote: async (noteId) => {
    if (!noteId) return;
    set({ isLoading: true, error: null });
    try {
      const data = await noteApi.fetchNote(noteId);
      const note = mapNoteResponseToNote(data);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? note : n)),
        currentNote:
          state.currentNote?.id === noteId ? note : state.currentNote,
        isLoading: false,
      }));
    } catch (err: any) {
      console.error(
        `[NoteStore] fetchNote FAILED for noteId: ${noteId}:`,
        err.message
      );
      set({ error: "노트 정보를 불러오는데 실패했습니다.", isLoading: false });
    }
  },

  createNote: async (noteData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await noteApi.createNote(noteData);
      const newNote = mapNoteResponseToNote(data);
      set((state) => ({
        notes: [...state.notes, newNote].sort(
          (a, b) => a.position - b.position
        ),
        currentNote: newNote,
        isLoading: false,
      }));
      return newNote;
    } catch (err: any) {
      let errorMessage = "노트 생성에 실패했습니다.";
      if (err.response?.data) {
        errorMessage += ` 서버 응답: ${
          (err.response.data as any)?.message ||
          JSON.stringify(err.response.data)
        }`;
      }
      console.error("[NoteStore] createNote FAILED:", errorMessage, err);
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateNote: async (noteId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await noteApi.updateNote(noteId, updateData);
      const updatedNote = mapNoteResponseToNote(data);
      set((state) => ({
        notes: state.notes
          .map((n) => (n.id === noteId ? updatedNote : n))
          .sort((a, b) => a.position - b.position),
        currentNote:
          state.currentNote?.id === noteId ? updatedNote : state.currentNote,
        isLoading: false,
      }));
      return updatedNote;
    } catch (err: any) {
      let errorMessage = `노트 (ID: ${noteId}) 업데이트에 실패했습니다.`;
      if (err.response?.data) {
        errorMessage += ` 서버 응답: ${
          (err.response.data as any)?.message ||
          JSON.stringify(err.response.data)
        }`;
      }
      console.error(
        `[NoteStore] updateNote FAILED for noteId: ${noteId}`,
        errorMessage,
        err
      );
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deleteNote: async (noteId) => {
    set({ isLoading: true, error: null });
    try {
      await noteApi.deleteNote(noteId);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== noteId),
        currentNote:
          state.currentNote?.id === noteId ? null : state.currentNote,
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      console.error(
        `[NoteStore] deleteNote FAILED for noteId: ${noteId}:`,
        err.message
      );
      set({
        error: `노트 (ID: ${noteId}) 삭제에 실패했습니다.`,
        isLoading: false,
      });
      return false;
    }
  },

  setCurrentNote: (noteId) => {
    const note = noteId
      ? get().notes.find((n) => n.id === noteId) || null
      : null;
    set({ currentNote: note });
  },

  getNotesByType: (type, projectId) => {
    return get()
      .notes.filter(
        (n) => n.type === type && (!projectId || n.projectId === projectId)
      )
      .sort((a, b) => a.position - b.position);
  },

  clearNotes: () =>
    set({ notes: [], currentNote: null, error: null, isLoading: false }),

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
