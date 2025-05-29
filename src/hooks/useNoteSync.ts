import { useEffect } from "react";
import { useWebSocketStore } from "@/store/websocketStore";
import { useBlockStore } from "@/store/blockStore";

/**
 * noteId: 구독할 노트 ID
 */
export const useNoteSync = (noteId: string) => {
  const { isSyncEnabled, enableSync, subscribeToNote } = useWebSocketStore();

  useEffect(() => {
    if (!noteId) return;

    if (!isSyncEnabled) {
      enableSync();
    }

    // 새로운 구독
    subscribeToNote(noteId, (payload) => {
      console.log("[WebSocket] 블록 이벤트:", payload);
      useBlockStore.getState().handleBlockSocketEvent(payload);
    });
  }, [noteId, isSyncEnabled, enableSync, subscribeToNote]);
};
