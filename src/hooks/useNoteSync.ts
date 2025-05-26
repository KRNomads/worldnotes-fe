import { useEffect } from "react";
import { useWebSocketStore } from "@/store/websocketStore";
import { useBlockStore } from "@/store/blockStore";
import { Message } from "@stomp/stompjs";

/**
 * noteId: 구독할 노트 ID
 */
export const useNoteSync = (noteId: string) => {
  const { isSyncEnabled, subscribe, unsubscribe, connect } =
    useWebSocketStore();

  useEffect(() => {
    if (!noteId || !isSyncEnabled) return;

    connect();

    const noteDestination = `/topic/note/${noteId}`;

    subscribe(noteDestination, (message: Message) => {
      const payload = JSON.parse(message.body);
      console.log("[WebSocket] 블록 이벤트:", payload);
      useBlockStore.getState().handleBlockSocketEvent(payload);
    });

    return () => {
      unsubscribe(noteDestination);
    };
  }, [noteId, isSyncEnabled]);
};
