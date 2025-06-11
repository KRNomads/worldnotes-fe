// src/app/project/[projectId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import ProjectInfo from "@/widgets/project-info/project-info";

export default function ProjectPage() {
  const { projectId } = useParams();

  return <ProjectInfo />;
}
