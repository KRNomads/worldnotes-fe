// src/types/note.ts
export interface Note {
  id: string;
  projectId: string;
  title: string;
  type: NoteType;
  position: number; // 이건 노트순서
  lastModified?: string;
}

// API 응답 타입 정의
export interface NoteResponse {
  noteId: string;
  projectId: string;
  title: string;
  type: NoteType;
  position: number;
}

// 노트 생성 요청 타입
export interface NoteCreateRequest {
  projectId: string;
  title: string;
  type: NoteType;
}

// 노트 업데이트 요청 타입
export interface NoteUpdateRequest {
  title: string;
}

// 노트 타입 상수 (필요에 따라 사용)
export const NOTE_TYPES = {
  CHARACTER: "CHARACTER",
  EVENT: "EVENT",
  PLACE: "PLACE",
  DETAILS: "DETAILS",
  ITEM: "ITEM",
} as const;

// 노트 타입 (타입 안정성을 위해 필요하다면 사용)
export type NoteType = (typeof NOTE_TYPES)[keyof typeof NOTE_TYPES];
