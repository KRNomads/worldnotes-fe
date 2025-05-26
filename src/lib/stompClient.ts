import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL!;

const stompClient = new Client({
  brokerURL: undefined, // SockJS를 쓰면 brokerURL 대신 webSocketFactory를 사용
  webSocketFactory: () => new SockJS(SOCKET_URL),
  reconnectDelay: 5000, // 재연결 딜레이 (5초)
  debug: (str) => {
    console.log("[STOMP DEBUG]:", str);
  },
});

export default stompClient;
