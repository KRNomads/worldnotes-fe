// src/types/note.ts
export type NoteType = "CHARACTER" | "PLACE" | "EVENT" | "DETAILS" | "ITEM";

export interface Note {
  id: string;
  projectId: string;
  title: string;
  subTitle: string;
  summary: string;
  imgUrl: string;
  color: string;
  type: NoteType;
  position: number; // 이건 노트순서
  createdAt: Date;
  updatedAt: Date;
}

// API 응답 타입 정의
export interface NoteResponse {
  id: string;
  projectId: string;
  title: string;
  subTitle: string;
  summary: string;
  imgUrl: string;
  color: string;
  type: NoteType;
  position: number; // 이건 노트순서
  createdAt: string; // "2025-06-17T12:34:56"
  updatedAt: string; // "2025-06-17T12:34:56"
}

// 노트 생성 요청 타입
export interface NoteCreateRequest {
  projectId: string;
  title: string;
  type: NoteType;
}

// 노트 업데이트 요청 타입
export interface NoteUpdateRequest {
  title?: string;
  subTitle?: string;
  summary?: string;
  imgUrl?: string;
  color?: string;
}
