"use client";

import type React from "react";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ProjectSidebar } from "@/widgets/project-sidebar/project-sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProjectSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-white/80 backdrop-blur-sm border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-[#81DFCF]">WorldNote</h1>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
