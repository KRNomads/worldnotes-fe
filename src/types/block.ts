// src/types/block.ts

/**
 * API 명세의 BlockDto 및 제공된 Java BlockDto 기반 타입
 * - `title`은 API 응답에 따라 nullable 할 수 있습니다.
 * - `fieldKey`는 API 생성 요청에는 있으나, DTO 명세에는 명시적으로 없습니다.
 * 응답에 포함된다면 유용할 수 있어 옵셔널로 추가합니다. (백엔드 확인 필요)
 * - `isDefault`도 생성 시에 주로 사용될 수 있어 옵셔널로 처리합니다.
 */
export interface Block {
  blockId: number; // API: blockId (int64), Java: blockId (Long)
  projectId: string; // API: projectId (uuid), Java: projectId (UUID)
  noteId: string; // API: noteId (uuid), Java: noteId (UUID)
  title: string | null; // API: title (string), Java: title (String)
  isDefault?: boolean; // API: isDefault (boolean), Java: isDefault (boolean)
  fieldKey?: string | null; // Java DTO에는 없으나, 생성 요청에는 존재. 응답 DTO에 포함 여부 확인 필요.
  type: "TEXT" | "TAGS" | "IMAGE"; // API: type (enum), Java: BlockType (enum)
  properties: Record<string, any>; // API: BlockProperties (object), Java: BlockProperties
  position: number; // API: position (int32), Java: position (Integer)
}

/**
 * API 명세 기반 Block 생성 요청 타입 (POST /api/v1/blocks/block)
 * - `position`은 API 명세에는 없으나, 생성 시 위치 지정이 필요할 수 있습니다.
 * 백엔드에서 자동 관리한다면 불필요합니다.
 */
export interface BlockCreateRequest {
  noteId: string; // uuid
  title: string;
  isDefault?: boolean;
  fieldKey?: string;
  type: "TEXT" | "TAGS" | "IMAGE";
  properties: Record<string, any>;
  position?: number;
}

/**
 * API 명세 기반 여러 블록 생성 요청 타입 (POST /api/v1/blocks/blocks)
 */
export interface BlocksCreateRequest {
  blocks: BlockCreateRequest[];
}

export type BlockUpdateRequest = Partial<
  Omit<Block, "blockId" | "projectId" | "noteId">
>;
// 예시: { title?: string; type?: "TEXT" | "TAGS" | "IMAGE"; properties?: Record<string, any>; position?: number; isDefault?: boolean; fieldKey?: string | null; }

// API 응답에서 BlockDto가 실제 Block 타입과 동일하다고 가정합니다.
export type BlockResponse = Block;
