// src/store/noteStore.ts
import { create } from "zustand";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Note,
  NoteResponse,
  NoteCreateRequest,
  NoteUpdateRequest,
} from "@/types/note";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;

  activeProjectBasicInfoNote: Note | null;
  isLoadingActiveProjectBasicInfoNote: boolean;
  errorActiveProjectBasicInfoNote: string | null;

  activeProjectCharacterNotes: Note[];
  isLoadingActiveProjectCharacterNotes: boolean;
  errorActiveProjectCharacterNotes: string | null;

  activeProjectDetailsNotes: Note[];
  isLoadingActiveProjectDetailsNotes: boolean;
  errorActiveProjectDetailsNotes: string | null;

  fetchNotesByProject: (projectId: string) => Promise<void>;
  fetchNotesByType: (projectId: string, type: string) => Promise<void>;
  fetchNote: (noteId: string) => Promise<void>;
  createNote: (noteData: {
    projectId: string;
    title: string;
    type: string;
  }) => Promise<Note | null>;
  updateNote: (
    noteId: string,
    updateData: { title: string }
  ) => Promise<Note | null>;
  deleteNote: (noteId: string) => Promise<boolean>;

  getNotesByType: (type: string, projectId?: string) => Note[];
  setCurrentNote: (noteId: string) => void;
  clearNotes: () => void;

  ensureActiveProjectBasicInfoNote: (projectId: string) => Promise<void>;
  ensureActiveProjectCharacterNotes: (projectId: string) => Promise<void>;
  ensureActiveProjectDetailsNotes: (projectId: string) => Promise<void>;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  activeProjectBasicInfoNote: null,
  isLoadingActiveProjectBasicInfoNote: false,
  errorActiveProjectBasicInfoNote: null,
  activeProjectCharacterNotes: [],
  isLoadingActiveProjectCharacterNotes: false,
  errorActiveProjectCharacterNotes: null,
  activeProjectDetailsNotes: [],
  isLoadingActiveProjectDetailsNotes: false,
  errorActiveProjectDetailsNotes: null,

  fetchNotesByProject: async (projectId) => {
    if (!projectId || projectId === "undefined") {
      set({ error: "유효하지 않은 프로젝트 ID입니다", isLoading: false });
      return;
    }
    set({
      isLoading: true,
      error: null,
      isLoadingActiveProjectBasicInfoNote: true,
      isLoadingActiveProjectCharacterNotes: true,
      isLoadingActiveProjectDetailsNotes: true,
    });
    try {
      const response: AxiosResponse<NoteResponse[]> = await api.get(
        `/api/v1/notes/project/${projectId}`
      );
      const fetchedNotes: Note[] = response.data.map((noteData) => ({
        id: noteData.noteId,
        projectId: noteData.projectId,
        title: noteData.title || "제목 없음",
        type: noteData.type,
        position: noteData.position,
        lastModified: new Date().toISOString(),
      }));

      set({
        notes: fetchedNotes,
        activeProjectBasicInfoNote:
          fetchedNotes.find(
            (n) => n.projectId === projectId && n.type === "BASIC_INFO"
          ) || null,
        activeProjectCharacterNotes: fetchedNotes.filter(
          (n) => n.projectId === projectId && n.type === "CHARACTER"
        ),
        activeProjectDetailsNotes: fetchedNotes.filter(
          (n) => n.projectId === projectId && n.type === "DETAILS"
        ),
        isLoading: false,
        isLoadingActiveProjectBasicInfoNote: false,
        errorActiveProjectBasicInfoNote: null,
        isLoadingActiveProjectCharacterNotes: false,
        errorActiveProjectCharacterNotes: null,
        isLoadingActiveProjectDetailsNotes: false,
        errorActiveProjectDetailsNotes: null,
      });
    } catch (err) {
      const error = err as Error | AxiosError;
      console.error(`프로젝트 (${projectId}) 노트 목록 가져오기 실패:`, error);
      const errorMessage = "노트를 불러오는데 실패했습니다";
      set({
        error: errorMessage,
        isLoading: false,
        errorActiveProjectBasicInfoNote: errorMessage,
        isLoadingActiveProjectBasicInfoNote: false,
        errorActiveProjectCharacterNotes: errorMessage,
        isLoadingActiveProjectCharacterNotes: false,
        errorActiveProjectDetailsNotes: errorMessage,
        isLoadingActiveProjectDetailsNotes: false,
      });
    }
  },

  fetchNotesByType: async (projectId, type) => {
    if (!projectId || projectId === "undefined") {
      throw new Error("유효하지 않은 프로젝트 ID입니다");
    }
    try {
      const response: AxiosResponse<NoteResponse[]> = await api.get(
        `/api/v1/notes/project/${projectId}/filter?type=${type}`
      );
      const fetchedNotesForThisType: Note[] = response.data.map((noteData) => ({
        id: noteData.noteId,
        projectId: noteData.projectId,
        title: noteData.title || "제목 없음",
        type: noteData.type,
        position: noteData.position,
        lastModified: new Date().toISOString(),
      }));
      set((state) => {
        const otherNotes = state.notes.filter(
          (note) => !(note.projectId === projectId && note.type === type)
        );
        return { notes: [...otherNotes, ...fetchedNotesForThisType] };
      });
    } catch (err) {
      console.error(
        `${type} 타입 노트 (project: ${projectId}) 가져오기 실패:`,
        err
      );
      throw err;
    }
  },

  fetchNote: async (noteId) => {
    if (!noteId || noteId === "undefined") {
      set({ error: "유효하지 않은 노트 ID입니다", isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<NoteResponse> = await api.get(
        `/api/v1/notes/${noteId}`
      );
      const note: Note = {
        id: response.data.noteId,
        projectId: response.data.projectId,
        title: response.data.title || "제목 없음",
        type: response.data.type,
        position: response.data.position,
        lastModified: new Date().toISOString(),
      };
      set((state) => {
        const updatedNotes = state.notes.map((n) =>
          n.id === noteId ? note : n
        );
        let newActiveBasic = state.activeProjectBasicInfoNote;
        if (
          note.type === "BASIC_INFO" &&
          state.activeProjectBasicInfoNote?.projectId === note.projectId &&
          state.activeProjectBasicInfoNote?.id === noteId
        ) {
          newActiveBasic = note;
        }
        // CHARACTER, DETAILS 배열 내 업데이트 로직도 필요시 추가
        // (예: activeProjectCharacterNotes에서 해당 노트를 찾아 교체)
        return {
          notes: updatedNotes,
          currentNote: note,
          activeProjectBasicInfoNote: newActiveBasic,
          isLoading: false,
        };
      });
    } catch (err) {
      set({ error: "노트 정보를 불러오는데 실패했습니다", isLoading: false });
    }
  },

  createNote: async (noteData) => {
    set({ isLoading: true, error: null });
    try {
      const requestData: NoteCreateRequest = {
        projectId: noteData.projectId,
        title: noteData.title,
        type: noteData.type,
      };
      const response: AxiosResponse<NoteResponse> = await api.post(
        "/api/v1/notes",
        requestData
      );
      const newNote: Note = {
        id: response.data.noteId,
        projectId: response.data.projectId,
        title: response.data.title,
        type: response.data.type,
        position: response.data.position,
        lastModified: new Date().toISOString(),
      };
      set((state) => {
        const updatedNotes = [...state.notes, newNote];
        let newActiveBasic = state.activeProjectBasicInfoNote;
        let newActiveChars = state.activeProjectCharacterNotes;
        let newActiveDetails = state.activeProjectDetailsNotes;

        // 만약 현재 activeProject... 상태가 newNote의 projectId와 같다면, 해당 타입의 상태를 업데이트
        if (
          state.activeProjectBasicInfoNote?.projectId === newNote.projectId ||
          (state.activeProjectCharacterNotes.length > 0 &&
            state.activeProjectCharacterNotes[0].projectId ===
              newNote.projectId) ||
          (state.activeProjectDetailsNotes.length > 0 &&
            state.activeProjectDetailsNotes[0].projectId ===
              newNote.projectId) ||
          // 위 조건이 애매하다면, UI에서 현재 보고있는 projectId를 기준으로 비교하는 것이 더 명확할 수 있음
          // 여기서는 일단 active 상태에 projectId가 일치하는 노트가 이미 있었다면 업데이트 시도
          (!state.activeProjectBasicInfoNote &&
            state.activeProjectCharacterNotes.length === 0 &&
            state.activeProjectDetailsNotes.length === 0) // active 상태가 비어있다면 일단 추가 시도 (첫 노트일 수 있음)
        ) {
          if (newNote.type === "BASIC_INFO") {
            newActiveBasic = newNote;
          } else if (newNote.type === "CHARACTER") {
            newActiveChars = [
              ...state.activeProjectCharacterNotes.filter(
                (n) => n.id !== newNote.id
              ),
              newNote,
            ].sort((a, b) => a.position - b.position);
          } else if (newNote.type === "DETAILS") {
            newActiveDetails = [
              ...state.activeProjectDetailsNotes.filter(
                (n) => n.id !== newNote.id
              ),
              newNote,
            ].sort((a, b) => a.position - b.position);
          }
        }

        return {
          notes: updatedNotes,
          currentNote: newNote,
          isLoading: false,
          activeProjectBasicInfoNote: newActiveBasic,
          activeProjectCharacterNotes: newActiveChars,
          activeProjectDetailsNotes: newActiveDetails,
        };
      });
      return newNote;
    } catch (err) {
      set({ error: "노트 생성 실패", isLoading: false });
      return null;
    }
  },

  updateNote: async (noteId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const requestData: NoteUpdateRequest = { title: updateData.title };
      const response: AxiosResponse<NoteResponse> = await api.put(
        `/api/v1/notes/${noteId}`,
        requestData
      );
      const updatedNote: Note = {
        id: response.data.noteId,
        projectId: response.data.projectId,
        title: response.data.title,
        type: response.data.type,
        position: response.data.position,
        lastModified: new Date().toISOString(),
      };
      set((state) => {
        const newNotes = state.notes.map((n) =>
          n.id === noteId ? updatedNote : n
        );
        let newActiveBasic = state.activeProjectBasicInfoNote;
        let newActiveChars = state.activeProjectCharacterNotes;
        let newActiveDetails = state.activeProjectDetailsNotes;

        if (
          state.activeProjectBasicInfoNote?.projectId === updatedNote.projectId
        ) {
          if (
            updatedNote.type === "BASIC_INFO" &&
            state.activeProjectBasicInfoNote?.id === noteId
          ) {
            newActiveBasic = updatedNote;
          }
        }
        if (
          state.activeProjectCharacterNotes.length > 0 &&
          state.activeProjectCharacterNotes[0].projectId ===
            updatedNote.projectId
        ) {
          if (updatedNote.type === "CHARACTER") {
            newActiveChars = state.activeProjectCharacterNotes
              .map((n) => (n.id === noteId ? updatedNote : n))
              .sort((a, b) => a.position - b.position);
          }
        }
        if (
          state.activeProjectDetailsNotes.length > 0 &&
          state.activeProjectDetailsNotes[0].projectId === updatedNote.projectId
        ) {
          if (updatedNote.type === "DETAILS") {
            newActiveDetails = state.activeProjectDetailsNotes
              .map((n) => (n.id === noteId ? updatedNote : n))
              .sort((a, b) => a.position - b.position);
          }
        }
        return {
          notes: newNotes,
          currentNote:
            state.currentNote?.id === noteId ? updatedNote : state.currentNote,
          isLoading: false,
          activeProjectBasicInfoNote: newActiveBasic,
          activeProjectCharacterNotes: newActiveChars,
          activeProjectDetailsNotes: newActiveDetails,
        };
      });
      return updatedNote;
    } catch (err) {
      set({ error: "노트 업데이트에 실패했습니다", isLoading: false });
      return null;
    }
  },

  deleteNote: async (noteId) => {
    const noteToDelete = get().notes.find((n) => n.id === noteId);
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/notes/${noteId}`);
      set((state) => {
        const newNotes = state.notes.filter((n) => n.id !== noteId);
        let newActiveBasic = state.activeProjectBasicInfoNote;
        let newActiveChars = state.activeProjectCharacterNotes;
        let newActiveDetails = state.activeProjectDetailsNotes;

        if (noteToDelete) {
          // noteToDelete 정보를 사용
          if (
            state.activeProjectBasicInfoNote?.projectId ===
            noteToDelete.projectId
          ) {
            if (
              noteToDelete.type === "BASIC_INFO" &&
              state.activeProjectBasicInfoNote?.id === noteId
            ) {
              newActiveBasic = null;
            }
          }
          if (
            state.activeProjectCharacterNotes.length > 0 &&
            state.activeProjectCharacterNotes[0].projectId ===
              noteToDelete.projectId
          ) {
            if (noteToDelete.type === "CHARACTER") {
              newActiveChars = state.activeProjectCharacterNotes.filter(
                (n) => n.id !== noteId
              );
            }
          }
          if (
            state.activeProjectDetailsNotes.length > 0 &&
            state.activeProjectDetailsNotes[0].projectId ===
              noteToDelete.projectId
          ) {
            if (noteToDelete.type === "DETAILS") {
              newActiveDetails = state.activeProjectDetailsNotes.filter(
                (n) => n.id !== noteId
              );
            }
          }
        }
        return {
          notes: newNotes,
          currentNote:
            state.currentNote?.id === noteId ? null : state.currentNote,
          isLoading: false,
          activeProjectBasicInfoNote: newActiveBasic,
          activeProjectCharacterNotes: newActiveChars,
          activeProjectDetailsNotes: newActiveDetails,
        };
      });
      return true;
    } catch (err) {
      set({ error: "노트 삭제에 실패했습니다", isLoading: false });
      return false;
    }
  },

  getNotesByType: (type, projectId) => {
    const { notes } = get();
    return notes.filter(
      (note) =>
        note.type === type && (projectId ? note.projectId === projectId : true)
    );
  },
  setCurrentNote: (noteId) => {
    const note = get().notes.find((n) => n.id === noteId) || null;
    set({ currentNote: note });
  },
  clearNotes: () => {
    set({
      notes: [],
      currentNote: null,
      error: null,
      isLoading: false,
      activeProjectBasicInfoNote: null,
      isLoadingActiveProjectBasicInfoNote: false,
      errorActiveProjectBasicInfoNote: null,
      activeProjectCharacterNotes: [],
      isLoadingActiveProjectCharacterNotes: false,
      errorActiveProjectCharacterNotes: null,
      activeProjectDetailsNotes: [],
      isLoadingActiveProjectDetailsNotes: false,
      errorActiveProjectDetailsNotes: null,
    });
  },

  ensureActiveProjectBasicInfoNote: async (projectId: string) => {
    set({
      isLoadingActiveProjectBasicInfoNote: true,
      errorActiveProjectBasicInfoNote: null,
    });
    try {
      await get().fetchNotesByType(projectId, "BASIC_INFO");
      const foundNote = get().notes.find(
        (n) => n.projectId === projectId && n.type === "BASIC_INFO"
      );
      set({
        activeProjectBasicInfoNote: foundNote || null,
        isLoadingActiveProjectBasicInfoNote: false,
      });
    } catch (error) {
      set({
        errorActiveProjectBasicInfoNote:
          (error as Error).message || "기본 정보 노트 로드 실패",
        isLoadingActiveProjectBasicInfoNote: false,
        activeProjectBasicInfoNote: null,
      });
    }
  },

  ensureActiveProjectCharacterNotes: async (projectId: string) => {
    set({
      isLoadingActiveProjectCharacterNotes: true,
      errorActiveProjectCharacterNotes: null,
    });
    try {
      await get().fetchNotesByType(projectId, "CHARACTER");
      const foundNotes = get()
        .notes.filter(
          (n) => n.projectId === projectId && n.type === "CHARACTER"
        )
        .sort((a, b) => a.position - b.position); // position으로 정렬 추가
      set({
        activeProjectCharacterNotes: foundNotes,
        isLoadingActiveProjectCharacterNotes: false,
      });
    } catch (error) {
      set({
        errorActiveProjectCharacterNotes:
          (error as Error).message || "캐릭터 노트 로드 실패",
        isLoadingActiveProjectCharacterNotes: false,
        activeProjectCharacterNotes: [],
      });
    }
  },

  ensureActiveProjectDetailsNotes: async (projectId: string) => {
    set({
      isLoadingActiveProjectDetailsNotes: true,
      errorActiveProjectDetailsNotes: null,
    });
    try {
      await get().fetchNotesByType(projectId, "DETAILS");
      const foundNotes = get()
        .notes.filter((n) => n.projectId === projectId && n.type === "DETAILS")
        .sort((a, b) => a.position - b.position); // position으로 정렬 추가
      set({
        activeProjectDetailsNotes: foundNotes,
        isLoadingActiveProjectDetailsNotes: false,
      });
    } catch (error) {
      set({
        errorActiveProjectDetailsNotes:
          (error as Error).message || "세부 설정 노트 로드 실패",
        isLoadingActiveProjectDetailsNotes: false,
        activeProjectDetailsNotes: [],
      });
    }
  },
}));
