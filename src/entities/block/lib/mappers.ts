import { Block, BlockResponse } from "@/entities/block/types/block";
import { Note, NoteResponse } from "@/entities/note/types/note";
import { Project, ProjectResponse } from "@/entities/project/types/project";
import {
  BlockPayload,
  NotePayload,
} from "@/processes/websocket/types/socketMessage";

// BlockResponse → Block
export const mapBlockResponseToBlock = (dto: BlockResponse): Block => ({
  blockId: dto.blockId,
  noteId: dto.noteId,
  title: dto.title,
  fieldKey: dto.fieldKey,
  type: dto.type,
  properties: dto.properties,
  position: dto.position,
  isCollapsed: dto.isCollapsed,
});

// BlockPayload → Block
export const mapBlockPayloadToBlock = (payload: BlockPayload): Block => ({
  blockId: payload.blockId,
  noteId: payload.noteId,
  title: payload.title,
  fieldKey: null, // payload로 fieldKey가 오지 않는다면 기본값 처리
  type: payload.type,
  properties: payload.properties,
  position: payload.position,
  isCollapsed: payload.isCollapsed,
});

// NoteResponse → Note
export const mapNoteResponseToNote = (dto: NoteResponse): Note => ({
  id: dto.noteId,
  projectId: dto.projectId,
  title: dto.title,
  type: dto.type,
  position: dto.position,
  lastModified: new Date().toISOString(),
});

// NotePayload → Note
export const mapNotePayloadToNote = (payload: NotePayload): Note => ({
  id: payload.noteId,
  projectId: payload.projectId,
  title: payload.title,
  type: payload.type,
  position: payload.position,
  lastModified: new Date().toISOString(),
});

// ProjectResponse → Note
export const mapProjectResponseToProject = (dto: ProjectResponse): Project => ({
  id: dto.projectId,
  title: dto.title || "제목 없음",
  lastModified: new Date().toISOString(), // 클라이언트에서 관리 ( 서버에서 관리 필요 )
  description: dto.description,
  userId: dto.userId,
});
