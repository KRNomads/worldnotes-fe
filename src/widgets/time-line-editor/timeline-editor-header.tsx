import { Button } from "@/shared/ui/button";
import { Eye, Menu, Map, Settings } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { ProjectSidebar } from "../project-sidebar/project-sidebar";

type TimelineEditorHeaderProps = {
  showMinimap: boolean;
  setShowMinimap: Dispatch<SetStateAction<boolean>>;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
};

export function TimelineEditorHeader({
  showMinimap,
  setShowMinimap,
  setShowSettings,
}: TimelineEditorHeaderProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-white/80 backdrop-blur-sm border-gray-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              엘프 왕국의 몰락
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      </header>
    </>
  );
}
