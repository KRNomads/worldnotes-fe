import { useEffect } from "react";
import { useWebSocketStore } from "@/store/websocketStore";
import { useNoteStore } from "@/store/noteStore";
import { Message } from "@stomp/stompjs";

/**
 * projectId: 구독할 프로젝트 ID
 */
export const useProjectSync = (projectId: string) => {
  const { isSyncEnabled, subscribe, unsubscribe, connect } =
    useWebSocketStore();

  useEffect(() => {
    if (!projectId || !isSyncEnabled) return;

    connect();

    const projectDestination = `/topic/project/${projectId}`;

    subscribe(projectDestination, (message: Message) => {
      const payload = JSON.parse(message.body);
      console.log("[WebSocket] 프로젝트 노트 이벤트:", payload);
      // 예: payload = { action: 'created' | 'updated' | 'deleted', note: Note }
      useNoteStore.getState().handleNoteSocketEvent(payload);
    });

    return () => {
      unsubscribe(projectDestination);
    };
  }, [projectId, isSyncEnabled]);
};
