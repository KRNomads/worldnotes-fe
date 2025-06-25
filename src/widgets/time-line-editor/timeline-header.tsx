import { Button } from "@/shared/ui/button";
import { Eye, Menu, Map, Settings } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type TimelineHeaderProps = {
  showMinimap: boolean;
  setShowMinimap: Dispatch<SetStateAction<boolean>>;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
};

export function TimelineHeader({
  showMinimap,
  setShowMinimap,
  setShowSettings,
}: TimelineHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between shadow-sm border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            엘프 왕국의 몰락
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant={showMinimap ? "default" : "ghost"}
          size="icon"
          onClick={() => setShowMinimap(!showMinimap)}
          title="미니맵"
        >
          <Map className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
