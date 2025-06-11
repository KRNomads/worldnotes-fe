import { useWebSocketStore } from "@/processes/websocket/store/websocketStore";
import { Switch } from "@/shared/ui/switch";

export function WebsocketToggleButton() {
  const { isConnected, connect, disconnect } = useWebSocketStore();

  const handleToggle = (checked: boolean) => {
    if (checked) {
      connect();
    } else {
      disconnect();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm font-medium ${
          isConnected ? "text-green-600" : "text-gray-500"
        }`}
      >
        {isConnected ? "On" : "Off"}
      </span>
      <Switch
        checked={isConnected}
        onCheckedChange={handleToggle}
        className={`${isConnected ? "bg-green-500" : "bg-gray-300"}`}
      />
    </div>
  );
}
