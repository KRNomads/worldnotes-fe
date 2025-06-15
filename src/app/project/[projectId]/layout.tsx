"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ProjectSidebar } from "@/widgets/project-sidebar/project-sidebar";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useProjectStore } from "@/entities/project/store/projectStore";
import { Profileui } from "@/widgets/profileui/profileui";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id: projectId } = useParams();
  const { setCurrentProject, fetchProject } = useProjectStore();
  const { fetchNotesByProject } = useNoteStore();

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId as string);
      fetchProject(projectId as string);
      fetchNotesByProject(projectId as string).catch((err) => {
        console.error("프로젝트 노트 전체 로드 실패 (ProjectPage):", err);
      });
    }
  }, [projectId, fetchProject, fetchNotesByProject, setCurrentProject]);

  return (
    <div className="flex min-h-screen bg-gray-50">
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

        <main className="flex-1 pt-4 p-4 lg:p-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
