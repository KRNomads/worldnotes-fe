// src/app/dashboard/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.scss";
import Sidebar from "@/components/sidebar/sidebar";
import { useProjectStore } from "@/store/projectStore";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

export default function Dashboard() {
  const router = useRouter();
  const { projects, isLoading, error, fetchUserProjects, createProject } =
    useProjectStore();

  // 컴포넌트 마운트 시 사용자의 프로젝트 목록 가져오기
  useEffect(() => {
    fetchUserProjects();
  }, [fetchUserProjects]);

  // 새 프로젝트 생성 핸들러
  const handleNewProject = async () => {
    try {
      // 기본 "새 작품" 타이틀로 빈 프로젝트 생성
      const newProject = await createProject({
        title: "새 작품",
      });

      console.log("생성된 프로젝트:", newProject);

      // 생성된 프로젝트의 기본정보 페이지로 이동
      if (newProject && newProject.id) {
        router.push(`/project/${newProject.id}/basicinfo`);
      } else {
        console.error("프로젝트 ID가 없습니다:", newProject);
      }
    } catch (error) {
      console.error("새 작품 생성 실패:", error);
    }
  };

  // 기존 프로젝트 클릭 핸들러
  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}/basicinfo`);
  };

  return (
    <div className={styles.container}>
      {/* 사이드바 컴포넌트 */}
      <Sidebar activeItem="home" isProjectSidebar={false} />

      {/* 메인 콘텐츠 영역 */}
      <div className={styles.mainArea}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.welcomeMessage}>
            WorldNote에 오신 걸 환영합니다.
          </h1>
          <button
            className={styles.newProjectButton}
            onClick={handleNewProject}
            disabled={isLoading}
          >
            {isLoading ? "생성 중..." : "+ 새 작품"}
          </button>
        </div>

        {/* 최근 작품 섹션 */}
        <h2 className={styles.sectionTitle}>최근 작품</h2>

        {/* 조건부 렌더링 */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <p>프로젝트를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={fetchUserProjects} className={styles.retryButton}>
              다시 시도
            </button>
          </div>
        ) : (
          <div className={styles.projectsContainer}>
            {projects.length === 0 ? (
              <p>최근 작업한 작품이 없습니다.</p>
            ) : (
              // 여기에서 map 함수를 사용하여 리스트 렌더링할 때
              // 각 항목에 고유한 key 속성 제공
              projects.map((project) => (
                <div
                  key={project.id} // 고유 key 추가
                  className={styles.projectCard}
                  onClick={() => handleProjectClick(project.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleProjectClick(project.id);
                    }
                  }}
                >
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <p className={styles.lastModified}>
                    {project.lastModified} 수정
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
