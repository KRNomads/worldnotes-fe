// src/types/block.ts

import { JSONContent } from "@tiptap/react";

// 블록 타입
export type BlockType = "TEXT" | "IMAGE" | "TAGS" | "PARAGRAPH";

// 기본 블록 속성 (discriminator를 위해 모든 properties 객체에 포함될 수 있음)
export interface BaseBlockProperties {
  type: BlockType; // 블록 타입에 따른 구분자
}

// BlockDto.properties는 이들 중 하나가 될 수 있음
export type BlockPropertiesUnion =
  | TextBlockProperties
  | ImageBlockProperties
  | TagsBlockProperties
  | ParagraphBlockProperties;

// TEXT 타입 블록의 properties
export interface TextBlockProperties extends BaseBlockProperties {
  type: "TEXT";
  value: string;
}

// IMAGE 타입 블록의 properties
export interface ImageBlockProperties extends BaseBlockProperties {
  type: "IMAGE";
  url: string;
  caption?: string;
}

// TAGS 타입 블록의 properties
export interface TagsBlockProperties extends BaseBlockProperties {
  type: "TAGS";
  tags: string[];
}

// PARAGRAPH 타입 블록의 properties
export interface ParagraphBlockProperties extends BaseBlockProperties {
  type: "PARAGRAPH";
  content: JSONContent;
}

/**
 * API 명세의 BlockDto 기반 타입
 * - isDefault 필드 제거
 * - position 필드는 서버 응답에 있으므로 유지
 */
export interface Block {
  id: number;
  // projectId는 API 명세의 BlockDto에 명시적으로 없으므로 제거된 상태 유지.
  noteId: string; // UUID
  title: string | null;
  fieldKey?: string | null; // API 명세 BlockDto에 추가됨.
  type: BlockType;
  properties: BlockPropertiesUnion;
  position: number; // 서버 응답에 포함되므로 유지
  isCollapsed: boolean;
}

/**
 * API 명세 기반 Block 생성 요청 타입 (POST /api/v1/blocks/block)
 * - isDefault 필드 제거
 * - position 필드 제거 (API 명세에 없음)
 */
export interface BlockCreateRequest {
  noteId: string; // uuid
  title: string;
  fieldKey?: string | null;
  type: BlockType;
  properties: BlockPropertiesUnion | null;
}

/**
 * API 명세 기반 여러 블록 생성 요청 타입 (POST /api/v1/blocks/blocks)
 */
export interface BlocksCreateRequest {
  blocks: BlockCreateRequest[];
}

/**
 * 블록 업데이트 API (PUT /api/v1/blocks/{blockId})의 요청 본문 타입.
 * API 명세의 BlockUpdateRequest 스키마를 따름.
 * - isDefault 필드 제거
 * - position 필드 제거 (API 명세에 없음)
 */
export interface BlockUpdateRequest {
  title?: string | null;
  type?: BlockType;
  properties?: BlockPropertiesUnion;
  isCollapsed?: boolean;
}

// API 응답은 대부분 Block 타입 객체 또는 그 배열일 것으로 예상
export type BlockResponse = Block;
