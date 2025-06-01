import { create } from "zustand";
import stompClient from "@/processes/websocket/lib/stompClient";
import { Message, StompSubscription } from "@stomp/stompjs";
import { WebSocketMessage } from "@/shared/types/socketMessage";
import { handleMessage } from "@/processes/websocket/lib/handler";

interface WebSocketState {
  isConnected: boolean;
  subscriptions: Record<string, StompSubscription>;
  currentSubscribedNoteId: string | null;
  currentSubscribedProjectId: string | null;

  connect: () => void;
  disconnect: () => void;

  subscribe: (destination: string) => void;
  unsubscribe: (destination: string) => void;

  subscribeToNote: (noteId: string) => void;
  subscribeToProject: (projectId: string) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
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

  subscribe: (destination: string) => {
    if (!get().isConnected || get().subscriptions[destination]) {
      return;
    }
    const subscription = stompClient.subscribe(
      destination,
      (message: Message) => {
        const parsed: WebSocketMessage<unknown> = JSON.parse(message.body);
        handleMessage(parsed);
      }
    );
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

  subscribeToNote: (noteId) => {
    const { currentSubscribedNoteId, unsubscribe, subscribe } = get();
    const destination = `/note/${noteId}`;

    if (currentSubscribedNoteId && currentSubscribedNoteId !== noteId) {
      unsubscribe(`/note/${currentSubscribedNoteId}`);
    }

    subscribe(destination);
    set({ currentSubscribedNoteId: noteId });
  },

  subscribeToProject: (projectId) => {
    const { currentSubscribedProjectId, unsubscribe, subscribe } = get();
    const destination = `/project/${projectId}`;

    if (
      currentSubscribedProjectId &&
      currentSubscribedProjectId !== projectId
    ) {
      unsubscribe(`/project/${currentSubscribedProjectId}`);
    }

    subscribe(destination);
    set({ currentSubscribedProjectId: projectId });
  },
}));
