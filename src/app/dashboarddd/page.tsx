"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import Sidebar from "@/widgets/sidebar/sidebar";
import { useProjectStore } from "@/entities/project/store/projectStore";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";

export default function Dashboard() {
  const router = useRouter();
  const {
    projects,
    isLoading,
    error,
    fetchUserProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectStore();

  // 수정 관련 상태 추가
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  // 삭제 확인 모달 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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
        router.push(`/project/${newProject.id}`);
      } else {
        console.error("프로젝트 ID가 없습니다:", newProject);
      }
    } catch (error) {
      console.error("새 작품 생성 실패:", error);
    }
  };

  // 기존 프로젝트 클릭 핸들러
  const handleProjectClick = (projectId: string) => {
    // 편집 모드일 때는 프로젝트로 이동하지 않음
    if (editingProjectId === projectId) {
      return;
    }
    router.push(`/project/${projectId}`);
  };

  // 수정 버튼 클릭 핸들러
  const handleEditClick = (
    event: React.MouseEvent,
    projectId: string,
    currentTitle: string
  ) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    setEditingProjectId(projectId);
    setEditedTitle(currentTitle);
  };

  // 타이틀 변경 저장 핸들러
  const handleSaveTitle = async (
    event: React.MouseEvent,
    projectId: string
  ) => {
    event.stopPropagation(); // 이벤트 버블링 방지

    if (!editedTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      await updateProject(projectId, { title: editedTitle });
      setEditingProjectId(null);
    } catch (error) {
      console.error("프로젝트 제목 업데이트 실패:", error);
      alert("제목 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 편집 취소 핸들러
  const handleCancelEdit = (event: React.MouseEvent) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    setEditingProjectId(null);
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = (event: React.MouseEvent, projectId: string) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    setProjectToDelete(projectId);
    setShowDeleteConfirm(true);
  };

  // 삭제 확인 핸들러
  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete);
        setShowDeleteConfirm(false);
        setProjectToDelete(null);
      } catch (error) {
        console.error("프로젝트 삭제 실패:", error);
        alert("프로젝트 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 삭제 취소 핸들러
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
  };

  return (
    <div className={styles.container}>
      {/* 사이드바 컴포넌트 */}
      <Sidebar activeItem="home" isProjectSidebar={false} />

      {/* 메인 콘텐츠 영역 */}
      <div className={styles.mainArea}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.welcomeMessage}>안녕하세요!</h1>
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
              projects.map((project) => (
                <div
                  key={project.id}
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
                  <div className={styles.projectHeader}>
                    {editingProjectId === project.id ? (
                      <div
                        className={styles.editTitleContainer}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          className={styles.editTitleInput}
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          autoFocus
                        />
                        <div className={styles.editButtons}>
                          <button
                            className={styles.saveButton}
                            onClick={(e) => handleSaveTitle(e, project.id)}
                          >
                            저장
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={handleCancelEdit}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        <button
                          className={styles.editButton}
                          onClick={(e) =>
                            handleEditClick(e, project.id, project.title)
                          }
                        >
                          수정
                        </button>
                      </>
                    )}
                  </div>

                  <div className={styles.projectFooter}>
                    <p className={styles.lastModified}>
                      {project.lastModified} 수정
                    </p>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDeleteClick(e, project.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>작품 삭제</h3>
              <p>정말 이 작품을 삭제하시겠습니까?</p>
              <p className={styles.warningText}>
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className={styles.modalButtons}>
                <button
                  className={styles.cancelDeleteButton}
                  onClick={handleCancelDelete}
                >
                  취소
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  onClick={handleConfirmDelete}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
