import { Block, BlockResponse } from "@/entities/block/types/block";
import { BlockPayload } from "@/processes/websocket/types/socketMessage";

// BlockResponse → Block
export const mapBlockResponseToBlock = (dto: BlockResponse): Block => ({
  id: dto.id,
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
  id: payload.id,
  noteId: payload.noteId,
  title: payload.title,
  fieldKey: null, // payload로 fieldKey가 오지 않는다면 기본값 처리
  type: payload.type,
  properties: payload.properties,
  position: payload.position,
  isCollapsed: payload.isCollapsed,
});
