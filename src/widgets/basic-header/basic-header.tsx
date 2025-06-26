import { Button } from "@/shared/ui/button";
import { Menu } from "lucide-react";
import { Profileui } from "../profileui/profileui";
import { ProjectSidebar } from "../project-sidebar/project-sidebar";
import { useState } from "react";

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <Profileui onMenuClick={() => setSidebarOpen(true)} />
        </header>
      </div>
    </>
  );
}
