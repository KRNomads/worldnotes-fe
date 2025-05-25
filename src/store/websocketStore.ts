import { create } from "zustand";
import stompClient from "@/lib/stompClient";
import { Message, StompSubscription } from "@stomp/stompjs";

interface WebSocketState {
  isConnected: boolean;
  isSyncEnabled: boolean;
  subscriptions: Record<string, StompSubscription>; // { [destination]: subscription }

  // 웹소켓 연결
  connect: () => void;
  disconnect: () => void;

  // 동기화 모드 ON / OFF
  enableSync: () => void;
  disableSync: () => void;

  // 채널 구독 / 취소
  subscribe: (
    destination: string,
    callback: (message: Message) => void
  ) => void;
  unsubscribe: (destination: string) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
  isSyncEnabled: false,
  subscriptions: {},

  connect: () => {
    if (!stompClient.active) {
      stompClient.onConnect = () => {
        console.log("[WebSocket] 연결됨");
        set({ isConnected: true });
      };
      stompClient.onStompError = (frame) => {
        console.error("[WebSocket] 오류:", frame.headers["message"]);
      };
      stompClient.activate();
    }
  },

  disconnect: () => {
    if (stompClient.active) {
      stompClient.deactivate();
      set({ isConnected: false, subscriptions: {} });
      console.log("[WebSocket] 연결 해제");
    }
  },

  enableSync: () => {
    get().connect();
    set({ isSyncEnabled: true });
  },

  disableSync: () => {
    Object.keys(get().subscriptions).forEach((destination) => {
      get().unsubscribe(destination);
    });
    get().disconnect(); // 연결 자체 해제
    set({ isSyncEnabled: false });
    console.log("[WebSocket] 동기화 모드 종료 및 연결 해제");
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
}));
