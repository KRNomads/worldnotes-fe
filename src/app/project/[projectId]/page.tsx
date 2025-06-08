// src/app/project/[projectId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import ProjectInfo from "@/widgets/project-info/project-info";
import Sidebar from "@/widgets/sidebar/sidebar";
import styles from "./page.module.scss";

export default function ProjectPage() {
  const { projectId } = useParams();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <div className={styles.pageContainer}>
        <Sidebar
          activeItem="basicinfo"
          isProjectSidebar={true}
          projectId={projectId as string}
        />
        <main className={styles.mainContent}>
          <div className={styles.contentWrapper}>
            <div className={styles.characterPageLayout}>
              <ProjectInfo />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
