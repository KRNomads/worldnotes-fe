"use client";

import { Menu } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { UserProfile } from "@/features/user-profile/user-profile";
import { WebsocketToggleButton } from "@/features/websocket/websocket-toggle-button";

interface ProjectHeaderProps {
  onMenuClick: () => void;
}

export function Profileui({ onMenuClick }: ProjectHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-white shadow flex items-center justify-between px-4">
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center space-x-3">
        {/* 추가적인 아이콘들 */}
        <WebsocketToggleButton />
        <UserProfile />
      </div>
    </div>
  );
}
