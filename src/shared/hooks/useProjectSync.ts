import { useEffect } from "react";
import { useWebSocketStore } from "@/processes/websocket/store/websocketStore";

/**
 * projectId: 구독할 프로젝트 ID
 */
export const useProjectSync = (projectId: string) => {
  const { subscribeToProject, unsubscribe } = useWebSocketStore();

  useEffect(() => {
    if (!projectId) return;

    // 프로젝트 구독
    subscribeToProject(projectId);

    // 언마운트나 projectId 변경 시 정리
    return () => {
      unsubscribe(`/project/${projectId}`);
    };
  }, [projectId, subscribeToProject, unsubscribe]);
};
