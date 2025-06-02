import { useEffect } from "react";
import { useWebSocketStore } from "@/processes/websocket/store/websocketStore";

/**
 * noteId: 구독할 노트 ID
 */
export const useNoteSync = (noteId: string) => {
  const { subscribeToNote, unsubscribe } = useWebSocketStore();

  useEffect(() => {
    if (!noteId) return;

    // 노트에 대한 WebSocket 구독 시작
    subscribeToNote(noteId);

    // 컴포넌트 언마운트 또는 noteId 변경될 때 정리
    return () => {
      unsubscribe(`/note/${noteId}`);
    };
  }, [noteId, subscribeToNote, unsubscribe]);
};
