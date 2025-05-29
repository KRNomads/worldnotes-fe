import { useEffect } from "react";
import { useWebSocketStore } from "@/store/websocketStore";
import { useNoteStore } from "@/store/noteStore";

/**
 * projectId: 구독할 프로젝트 ID
 */
export const useProjectSync = (projectId: string) => {
  const { isSyncEnabled, enableSync, subscribeToProject } = useWebSocketStore();

  useEffect(() => {
    if (!projectId) return;

    if (!isSyncEnabled) {
      enableSync();
    }

    // 새로운 프로젝트 구독
    subscribeToProject(projectId, (payload) => {
      console.log("[WebSocket] 프로젝트 노트 이벤트:", payload);
      useNoteStore.getState().handleNoteSocketEvent(payload);
    });
  }, [projectId, isSyncEnabled, enableSync, subscribeToProject]);
};
