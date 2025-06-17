import { NotePayload } from "@/processes/websocket/types/socketMessage";
import { Note, NoteResponse } from "../types/note";

// NoteResponse → Note
export const mapNoteResponseToNote = (dto: NoteResponse): Note => ({
  id: dto.id,
  projectId: dto.projectId,
  title: dto.title,
  subTitle: dto.subTitle,
  summary: dto.summary,
  imgUrl: dto.imgUrl,
  color: dto.color,
  type: dto.type,
  position: dto.position,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});

// NotePayload → Note
// export const mapNotePayloadToNote = (payload: NotePayload): Note => ({
//   id: payload.noteId,
//   projectId: payload.projectId,
//   title: payload.title,
//   subTitle: payload.subTitle,
//   summary: payload.summary,
//   imgUrl: payload.imgUrl,
//   color: payload.color,
//   type: payload.type,
//   position: payload.position,
//   createdAt: new Date(), // 실시간 처리 기준
//   updatedAt: new Date(),
// });
