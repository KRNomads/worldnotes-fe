// src/types/note.ts
export interface Note {
  id: string;
  projectId: string;
  title: string;
  type: string;
  position: number; // 이건 노트순서
  lastModified?: string;
}

// API 응답 타입 정의
export interface NoteResponse {
  noteId: string;
  projectId: string;
  title: string;
  type: string;
  position: number;
}

// 노트 생성 요청 타입
export interface NoteCreateRequest {
  projectId: string;
  title: string;
  type: string; // "BASIC_INFO" | "CHARACTER" | "DETAILS"
}

// 노트 업데이트 요청 타입
export interface NoteUpdateRequest {
  title: string;
}

// 노트 타입 상수 (필요에 따라 사용)
export const NOTE_TYPES = {
  BASIC_INFO: "BASIC_INFO",
  CHARACTER: "CHARACTER",
  DETAILS: "DETAILS",
} as const;

// 노트 타입 (타입 안정성을 위해 필요하다면 사용)
export type NoteType = (typeof NOTE_TYPES)[keyof typeof NOTE_TYPES];
