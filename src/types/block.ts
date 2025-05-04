// src/types/block.ts
export type BlockType = "TEXT" | "TAGS" | "IMAGE";

export interface BlockProperties {
  content?: string;
  tags?: string[];
  imageUrl?: string;
  [key: string]: any; // 기타 속성 허용
}

export interface Block {
  id: number;
  noteId: string;
  projectId: string;
  title: string;
  type: BlockType;
  isDefault: boolean;
  properties: BlockProperties;
  position: number;
}

export interface BlockCreateRequest {
  noteId: string;
  title: string;
  isDefault: boolean;
  fieldKey?: string;
  type: BlockType;
  properties: BlockProperties;
}

export interface BlockUpdateRequest {
  updateFields: Record<string, any>;
}

export interface BlockResponse {
  blockId: number;
  noteId: string;
  projectId: string;
  title: string;
  isDefault: boolean;
  type: BlockType;
  properties: BlockProperties;
  position: number;
}

export interface BlocksCreateRequest {
  blocks: BlockCreateRequest[];
}
