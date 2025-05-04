// src/store/noteStore.ts
import { create } from "zustand";
import axios, { AxiosError, AxiosResponse } from "axios";

// API 명세서를 기반으로 프론트엔드에서 사용할 Note 타입 정의
interface Note {
  id: string; // 노트 ID (서버에서는 noteId)
  projectId: string; // 프로젝트 ID
  title: string; // 노트 제목
  type: string; // 노트 타입 (BASIC_INFO, CHARACTER, DETAILS)
  position: number; // 노트 순서
  lastModified?: string; // 마지막 수정 시간 (프론트에서 추가)
}

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// API 응답 타입 정의
interface NoteResponse {
  noteId: string;
  projectId: string;
  title: string;
  type: string;
  position: number;
}

// 노트 생성 요청 타입
interface NoteCreateRequest {
  projectId: string;
  title: string;
  type: string; // "BASIC_INFO" | "CHARACTER" | "DETAILS"
}

// 노트 업데이트 요청 타입
interface NoteUpdateRequest {
  title: string;
}

interface NoteState {
  // 상태 관리
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;

  // CRUD 작업
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

  // 헬퍼 함수
  getNotesByType: (type: string) => Note[];
  setCurrentNote: (noteId: string) => void;
  clearNotes: () => void;
}

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  // 프로젝트의 모든 노트 가져오기
  fetchNotesByProject: async (projectId) => {
    // 프로젝트 ID 유효성 검사
    if (!projectId || projectId === "undefined") {
      set({
        error: "유효하지 않은 프로젝트 ID입니다",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse = await api.get(
        `/api/v1/notes/project/${projectId}`
      );

      // API 응답을 프론트엔드 모델로 변환
      const fetchedNotes: Note[] = response.data.map(
        (noteData: NoteResponse) => ({
          id: noteData.noteId,
          projectId: noteData.projectId,
          title: noteData.title || "제목 없음",
          type: noteData.type,
          position: noteData.position,
          lastModified: new Date().toISOString(), // 임시로 현재 시간 사용
        })
      );

      set({
        notes: fetchedNotes,
        isLoading: false,
      });
    } catch (err) {
      const error = err as Error | AxiosError;
      console.error("노트 목록 가져오기 실패:", error);
      set({
        error: "노트를 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  // 특정 타입의 노트만 가져오기
  fetchNotesByType: async (projectId, type) => {
    if (!projectId || projectId === "undefined") {
      set({
        error: "유효하지 않은 프로젝트 ID입니다",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse = await api.get(
        `/api/v1/notes/project/${projectId}/filter?type=${type}`
      );

      // API 응답을 프론트엔드 모델로 변환
      const fetchedNotes: Note[] = response.data.map(
        (noteData: NoteResponse) => ({
          id: noteData.noteId,
          projectId: noteData.projectId,
          title: noteData.title || "제목 없음",
          type: noteData.type,
          position: noteData.position,
          lastModified: new Date().toISOString(), // 임시로 현재 시간 사용
        })
      );

      set({
        notes: fetchedNotes,
        isLoading: false,
      });
    } catch (err) {
      console.error(`${type} 타입의 노트 가져오기 실패:`, err);
      set({
        error: `${type} 타입의 노트를 불러오는데 실패했습니다`,
        isLoading: false,
      });
    }
  },

  // 단일 노트 정보 가져오기
  fetchNote: async (noteId) => {
    if (!noteId || noteId === "undefined") {
      set({
        error: "유효하지 않은 노트 ID입니다",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse = await api.get(`/api/v1/notes/${noteId}`);

      // API 응답 데이터를 프론트엔드 모델로 변환
      const note: Note = {
        id: response.data.noteId,
        projectId: response.data.projectId,
        title: response.data.title || "제목 없음",
        type: response.data.type,
        position: response.data.position,
        lastModified: new Date().toISOString(), // 임시로 현재 시간 사용
      };

      set({ currentNote: note, isLoading: false });
    } catch (err) {
      console.error("노트 정보 가져오기 실패:", err);
      set({
        error: "노트 정보를 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  // 현재 선택된 노트 설정
  setCurrentNote: (noteId) => {
    const { notes } = get();
    const note = notes.find((n) => n.id === noteId) || null;
    set({ currentNote: note });
  },

  // 특정 타입의 노트만 필터링하여 반환
  getNotesByType: (type) => {
    const { notes } = get();
    return notes.filter((note) => note.type === type);
  },

  // 노트 상태 초기화
  clearNotes: () => {
    set({ notes: [], currentNote: null, error: null });
  },

  // 새 노트 생성
  createNote: async (noteData) => {
    set({ isLoading: true, error: null });
    try {
      // 백엔드 API 요청 데이터 형식 준수
      const requestData: NoteCreateRequest = {
        projectId: noteData.projectId,
        title: noteData.title,
        type: noteData.type,
      };

      const response: AxiosResponse<NoteResponse> = await api.post(
        "/api/v1/notes",
        requestData
      );

      // 응답에서 받은 데이터를 Note 타입에 맞게 변환
      const newNote: Note = {
        id: response.data.noteId,
        projectId: response.data.projectId,
        title: response.data.title,
        type: response.data.type,
        position: response.data.position,
        lastModified: new Date().toISOString(), // 임시로 현재 시간 사용
      };

      // 노트 목록에 새 노트 추가
      set((state) => ({
        notes: [...state.notes, newNote],
        currentNote: newNote,
        isLoading: false,
      }));

      return newNote;
    } catch (err) {
      console.error("노트 생성 실패:", err);
      set({
        error: "노트 생성에 실패했습니다",
        isLoading: false,
      });
      return null;
    }
  },

  // 노트 업데이트
  updateNote: async (noteId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const requestData: NoteUpdateRequest = {
        title: updateData.title,
      };

      const response = await api.put(`/api/v1/notes/${noteId}`, requestData);

      // 응답에서 받은 데이터를 Note 타입에 맞게 변환
      const updatedNote: Note = {
        id: response.data.noteId,
        projectId: response.data.projectId,
        title: response.data.title,
        type: response.data.type,
        position: response.data.position,
        lastModified: new Date().toISOString(), // 임시로 현재 시간 사용
      };

      // 노트 목록과 현재 노트 상태 업데이트
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId ? updatedNote : note
        ),
        currentNote:
          state.currentNote?.id === noteId ? updatedNote : state.currentNote,
        isLoading: false,
      }));

      return updatedNote;
    } catch (err) {
      console.error("노트 업데이트 실패:", err);
      set({
        error: "노트 업데이트에 실패했습니다",
        isLoading: false,
      });
      return null;
    }
  },

  // 노트 삭제
  deleteNote: async (noteId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/notes/${noteId}`);

      // 삭제된 노트를 상태에서 제거
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== noteId),
        currentNote:
          state.currentNote?.id === noteId ? null : state.currentNote,
        isLoading: false,
      }));

      return true;
    } catch (err) {
      console.error("노트 삭제 실패:", err);
      set({
        error: "노트 삭제에 실패했습니다",
        isLoading: false,
      });
      return false;
    }
  },
}));
