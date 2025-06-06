import {
  BlockPropertiesUnion,
  BlockType,
} from "../../entities/block/types/block";
import { NoteType } from "../../entities/note/types/note";

export interface WebSocketMessage<T> {
  type: MessageType;
  userId: string;
  payload: T;
}

export type MessageType =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "NOTE_CREATED"
  | "NOTE_UPDATED"
  | "NOTE_DELETED"
  | "BLOCK_CREATED"
  | "BLOCK_UPDATED"
  | "BLOCK_DELETED";
// | "CURSOR_MOVED"
// | "USER_JOINED"
// | "USER_LEFT";

// export interface ProjectPayload {
//   projectId: string;
//   title: string;
//   description: string;
// }

export type MessagePayload = NotePayload | BlockPayload;

export interface NotePayload {
  noteId: string;
  projectId: string;
  title: string;
  type: NoteType;
  position: number;
}

export interface BlockPayload {
  blockId: number;
  noteId: string;
  title: string | null;
  type: BlockType;
  properties: BlockPropertiesUnion;
  position: number;
  isCollapsed: boolean;
}
