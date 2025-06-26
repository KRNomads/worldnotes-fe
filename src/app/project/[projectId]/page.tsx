"use client";

import { BasicHeader } from "@/widgets/basic-header/basic-header";
import { ProjectInfo } from "@/widgets/project-info/project-info";

export default function ProjectPage() {
  return (
    <div>
      <BasicHeader />

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
          <ProjectInfo />
        </main>
      </div>
    </div>
  );
}
