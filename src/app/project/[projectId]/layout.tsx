"use client";

import { useNoteStore } from "@/entities/note/store/noteStore";
import { useProjectStore } from "@/entities/project/store/projectStore";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projectId } = useParams();
  const { setCurrentProject, fetchProject } = useProjectStore();
  const { fetchNotesByProject } = useNoteStore();

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId as string);
      fetchProject(projectId as string);
      fetchNotesByProject(projectId as string).catch((err) => {
        console.error("프로젝트 노트 전체 로드 실패 (ProjectPage):", err);
      });
    }
  }, [projectId, fetchProject, fetchNotesByProject, setCurrentProject]);

  return <>{children}</>;
}
