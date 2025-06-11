"use client";

import { useNoteStore } from "@/entities/note/store/noteStore";
import { useProjectStore } from "@/entities/project/store/projectStore";
import { ProjectSidebar } from "@/widgets/project-sidebar/project-sidebar";
import { ProjectHeader } from "@/widgets/project-header/project-header";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projectId } = useParams();
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
    <div className="relative min-h-screen bg-gray-50">
      <ProjectHeader onMenuClick={() => setSidebarOpen(true)} />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="pt-16 p-4 lg:p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
