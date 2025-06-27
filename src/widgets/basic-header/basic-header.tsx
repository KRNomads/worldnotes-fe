import { Button } from "@/shared/ui/button";
import { Menu } from "lucide-react";
import { ProjectSidebar } from "../project-sidebar/project-sidebar";
import { useState } from "react";
import { WebsocketToggleButton } from "@/features/websocket/websocket-toggle-button";
import { UserProfile } from "@/features/user-profile/user-profile";

export function BasicHeader() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-white/80 backdrop-blur-sm border-gray-200">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open sidebar</span>
          </Button> */}
          <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-white shadow flex items-center justify-between px-4 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              {/* 추가적인 아이콘들 */}
              <WebsocketToggleButton />
              <UserProfile />
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
