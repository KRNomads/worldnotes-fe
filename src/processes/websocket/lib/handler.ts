import { useBlockStore } from "@/entities/block/store/blockStore";
import { useNoteStore } from "@/entities/note/store/noteStore";
import {
  BlockPayload,
  NotePayload,
  WebSocketMessage,
} from "@/processes/websocket/types/socketMessage";
import {
  mapBlockPayloadToBlock,
  mapNotePayloadToNote,
} from "@/entities/block/lib/mappers";

export function handleMessage(msg: WebSocketMessage<unknown>) {
  switch (msg.type) {
    case "NOTE_CREATED":
    case "NOTE_UPDATED":
    case "NOTE_DELETED":
      handleNoteMessage(msg as WebSocketMessage<NotePayload>);
      break;
    case "BLOCK_CREATED":
    case "BLOCK_UPDATED":
    case "BLOCK_DELETED":
      handleBlockMessage(msg as WebSocketMessage<BlockPayload>);
      break;
    default:
      console.warn("[WebSocket] 처리되지 않은 타입:", msg.type);
  }
}

function handleNoteMessage(msg: WebSocketMessage<NotePayload>) {
  const { createNoteInStore, updateNoteInStore, deleteNoteInStore } =
    useNoteStore.getState();

  switch (msg.type) {
    case "NOTE_CREATED":
      console.log("[WebSocket] 노트 생성:", msg.payload);
      createNoteInStore(mapNotePayloadToNote(msg.payload));
      break;

    case "NOTE_UPDATED":
      console.log("[WebSocket] 노트 업데이트:", msg.payload);
      updateNoteInStore(mapNotePayloadToNote(msg.payload));
      break;

    case "NOTE_DELETED":
      console.log("[WebSocket] 노트 삭제:", msg.payload.noteId);
      deleteNoteInStore(msg.payload.noteId);
      break;
  }
}

function handleBlockMessage(msg: WebSocketMessage<BlockPayload>) {
  const { createBlockInStore, updateBlockInStore, deleteBlockInStore } =
    useBlockStore.getState();

  switch (msg.type) {
    case "BLOCK_CREATED":
      console.log("[WebSocket] 블록 생성:", msg.payload);
      createBlockInStore(mapBlockPayloadToBlock(msg.payload));
      break;

    case "BLOCK_UPDATED":
      console.log("[WebSocket] 블록 업데이트:", msg.payload);
      updateBlockInStore(mapBlockPayloadToBlock(msg.payload));
      break;

    case "BLOCK_DELETED":
      console.log("[WebSocket] 블록 삭제:", msg.payload.blockId);
      deleteBlockInStore(msg.payload.blockId, msg.payload.noteId);
      break;
  }
}
