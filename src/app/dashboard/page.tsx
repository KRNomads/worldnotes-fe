"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.scss";
import { Project } from "@/types/project";

export default function Dashboard() {
  const router = useRouter();

  // 예시 프로젝트 데이터
  const recentProjects: Project[] = [
    {
      id: "1",
      title: "새 작품",
      lastModified: "6시간 전",
    },
    {
      id: "2",
      title: "새 작품",
      lastModified: "10일 전",
    },
  ];

  const handleNewProject = () => {
    console.log("새 작품 만들기 버튼 클릭");
    // 테스트를 위해 고정 경로로 이동
    router.push("/project/basicinfo");
  };

  const handleProjectClick = (projectId: string) => {
    // 테스트를 위해 고정 경로로 이동
    router.push("/project/basicinfo");
  };

  return (
    <div className={styles.container}>
      {/* 사이드바 */}
      <div className={styles.sidebar}>
        <h1 className={styles.logo}>World Note</h1>

        <div className={styles.menuContainer}>
          <Link
            href="/dashboard"
            className={`${styles.navItem} ${styles.navItemActive}`}
          >
            홈
          </Link>

          <Link href="/my-projects" className={styles.navItem}>
            내 프로젝트
          </Link>
        </div>
      </div>

      {/* 메인 영역 */}
      <div className={styles.mainArea}>
        <div className={styles.header}>
          <h1 className={styles.welcomeMessage}>
            WorldNote에 오신 걸 환영합니다.
          </h1>
          <button
            className={styles.newProjectButton}
            onClick={handleNewProject}
          >
            + 새 작품
          </button>
        </div>

        <h2 className={styles.sectionTitle}>최근 작품</h2>

        <div className={styles.projectsContainer}>
          {recentProjects.map((project) => (
            <div
              key={project.id}
              className={styles.projectCard}
              onClick={() => handleProjectClick(project.id)}
            >
              <h3 className={styles.projectTitle}>{project.title}</h3>
              <p className={styles.lastModified}>{project.lastModified} 수정</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
