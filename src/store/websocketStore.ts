import { create } from "zustand";
import stompClient from "@/lib/stompClient";
import { Message, StompSubscription } from "@stomp/stompjs";

interface WebSocketState {
  isConnected: boolean;
  subscriptions: Record<string, StompSubscription>;
  currentSubscribedNoteId: string | null;
  currentSubscribedProjectId: string | null;

  connect: () => void;
  disconnect: () => void;

  subscribe: (
    destination: string,
    callback: (message: Message) => void
  ) => void;
  unsubscribe: (destination: string) => void;

  subscribeToNote: (noteId: string, callback: (msg: any) => void) => void;
  subscribeToProject: (projectId: string, callback: (msg: any) => void) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
  isSyncEnabled: false,
  subscriptions: {},
  currentSubscribedNoteId: null,
  currentSubscribedProjectId: null,

  connect: () => {
    if (!stompClient.active) {
      stompClient.onConnect = () => {
        console.log("[WebSocket] 연결됨");
        set({ isConnected: true });
      };
      stompClient.onStompError = (frame) => {
        console.error("[WebSocket] 오류:", frame.headers["message"]);
      };
      stompClient.onWebSocketClose = () => {
        console.log("[WebSocket] 연결 끊김 (자동 close 감지)");
        set({ isConnected: false });
      };
      stompClient.activate();
    }
  },

  disconnect: () => {
    if (stompClient.active) {
      stompClient.deactivate();
      set({
        isConnected: false,
        subscriptions: {},
        currentSubscribedNoteId: null,
        currentSubscribedProjectId: null,
      });
      console.log("[WebSocket] 연결 해제");
    }
  },

  subscribe: (destination, callback) => {
    if (!get().isConnected || get().subscriptions[destination]) {
      return;
    }
    const subscription = stompClient.subscribe(destination, (message) => {
      callback(JSON.parse(message.body));
    });
    set((state) => ({
      subscriptions: { ...state.subscriptions, [destination]: subscription },
    }));
    console.log("[WebSocket] 구독 시작:", destination);
  },

  unsubscribe: (destination) => {
    const subscription = get().subscriptions[destination];
    if (subscription) {
      subscription.unsubscribe();
      set((state) => {
        const newSubs = { ...state.subscriptions };
        delete newSubs[destination];
        return { subscriptions: newSubs };
      });
      console.log("[WebSocket] 구독 해제:", destination);
    }
  },

  subscribeToNote: (noteId, callback) => {
    const { currentSubscribedNoteId, unsubscribe, subscribe } = get();
    const destination = `/note/${noteId}`;

    // 이전 노트 구독 해제
    if (currentSubscribedNoteId && currentSubscribedNoteId !== noteId) {
      unsubscribe(`/note/${currentSubscribedNoteId}`);
    }

    // 새 노트 구독
    subscribe(destination, callback);
    set({ currentSubscribedNoteId: noteId });
  },

  subscribeToProject: (projectId, callback) => {
    const { currentSubscribedProjectId, unsubscribe, subscribe } = get();
    const destination = `/project/${projectId}`;

    // 이전 프로젝트 구독 해제
    if (
      currentSubscribedProjectId &&
      currentSubscribedProjectId !== projectId
    ) {
      unsubscribe(`/project/${currentSubscribedProjectId}`);
    }

    // 새 프로젝트 구독
    subscribe(destination, callback);
    set({ currentSubscribedProjectId: projectId });
  },
}));
