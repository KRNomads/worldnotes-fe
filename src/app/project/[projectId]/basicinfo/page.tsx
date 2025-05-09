// src/app/project/[projectId]/basicinfo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./basicinfo.module.scss";
import Sidebar from "@/components/sidebar/sidebar";
import { useProjectStore } from "@/store/projectStore";
// Note 타입은 필요하다면 @/types/note에서 직접 가져옵니다.
// import { Note } from "@/types/note";
import { useNoteStore } from "@/store/noteStore"; // 수정된 스토어 사용
import { useBlockStore } from "@/store/blockStore";

export default function BasicInfoPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const {
    currentProject,
    fetchProject,
    error: projectError,
  } = useProjectStore();

  // noteStore에서 BASIC_INFO 노트 전용 상태와 액션을 가져옵니다.
  const {
    activeProjectBasicInfoNote, // 전용 상태 사용
    ensureActiveProjectBasicInfoNote, // 전용 액션 사용
    isLoadingActiveProjectBasicInfoNote, // 전용 로딩 상태 사용
    errorActiveProjectBasicInfoNote, // 전용 에러 상태 사용
  } = useNoteStore();

  const {
    blocks,
    fetchBlocksByNote,
    isLoading: blocksLoading, // 블록 스토어의 로딩 상태
    error: blocksError, // 블록 스토어의 에러 상태
  } = useBlockStore();

  // 로컬 basicInfoNote 상태는 이제 필요 없습니다. activeProjectBasicInfoNote를 직접 사용합니다.
  // const [basicInfoNote, setBasicInfoNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState({
    projectTitle: "",
    genre: "",
  });

  // 1. 프로젝트 정보 가져오기 (변경 없음)
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  // 2. BASIC_INFO 노트 메타데이터 로드 (ensure... 액션 사용으로 변경)
  useEffect(() => {
    if (projectId) {
      ensureActiveProjectBasicInfoNote(projectId);
    }
  }, [projectId, ensureActiveProjectBasicInfoNote]);

  // 3. BASIC_INFO 노트(스토어의 activeProjectBasicInfoNote)가 식별되면 해당 노트의 블록 가져오기
  useEffect(() => {
    if (activeProjectBasicInfoNote && activeProjectBasicInfoNote.id) {
      fetchBlocksByNote(activeProjectBasicInfoNote.id);
    }
    // 만약 activeProjectBasicInfoNote가 null이 되면 (예: 프로젝트 변경 또는 노트 삭제 시)
    // blocks 상태를 초기화하는 로직을 blockStore에 추가하거나 여기서 처리할 수 있습니다.
    // 예: else if (!activeProjectBasicInfoNote && blocks.length > 0) { get().clearBlocks(); } (blockStore에 clearBlocks가 있다면)
  }, [activeProjectBasicInfoNote, fetchBlocksByNote]);

  // 4. currentProject와 (스토어의) activeProjectBasicInfoNote, 그리고 blocks 데이터로 폼 상태 업데이트
  useEffect(() => {
    if (currentProject) {
      setFormData((prev) => ({
        ...prev,
        projectTitle: currentProject.title || "",
      }));
    }

    if (activeProjectBasicInfoNote && blocks.length > 0) {
      const genreBlock = blocks.find(
        (b) => b.title === "genre" /* 또는 b.fieldKey === 'genre' */
      );
      setFormData((prev) => ({
        ...prev,
        genre: genreBlock?.properties?.text || "",
      }));
    } else if (
      activeProjectBasicInfoNote &&
      blocks.length === 0 &&
      !blocksLoading
    ) {
      // 노트는 있지만 블록이 로딩 중이 아니면서 비어있을 때 (예: 새 노트)
      setFormData((prev) => ({ ...prev, genre: "" }));
    } else if (!activeProjectBasicInfoNote) {
      // 노트 자체가 없을 때 (예: 아직 생성 전)
      setFormData((prev) => ({ ...prev, genre: "" }));
    }
  }, [currentProject, activeProjectBasicInfoNote, blocks, blocksLoading]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("저장될 데이터:", {
      projectId: projectId,
      projectTitle: formData.projectTitle,
      basicInfoNoteId: activeProjectBasicInfoNote?.id, // 스토어의 노트 ID 사용
      genre: formData.genre,
    });
    // 여기에 프로젝트 제목 저장 로직 (projectStore.updateProject(...))
    // 그리고 'genre' 블록 저장 로직 (blockStore.updateBlock 또는 createBlock) 구현
  };

  // 로딩 및 에러 UI (전용 상태 사용)
  if (projectError || errorActiveProjectBasicInfoNote || blocksError) {
    return (
      <div className={styles.errorContainer}>
        <p>데이터 로드 중 오류 발생:</p>
        {projectError && <p>- 프로젝트 오류: {projectError}</p>}
        {errorActiveProjectBasicInfoNote && (
          <p>- 기본 정보 노트 오류: {errorActiveProjectBasicInfoNote}</p>
        )}
        {blocksError && <p>- 세부 내용(블록) 오류: {blocksError}</p>}
      </div>
    );
  }

  // 기본 정보 노트 메타데이터 로딩 중이거나, 노트는 있지만 블록이 로딩 중일 때
  if (
    isLoadingActiveProjectBasicInfoNote ||
    (activeProjectBasicInfoNote && blocksLoading)
  ) {
    return <p>기본 정보를 불러오는 중입니다...</p>;
  }

  // 로딩이 끝났고, 에러도 없는데 activeProjectBasicInfoNote가 없는 경우 (예: 아직 생성되지 않음)
  if (
    !isLoadingActiveProjectBasicInfoNote &&
    !activeProjectBasicInfoNote &&
    !errorActiveProjectBasicInfoNote
  ) {
    // 이 UI는 필요에 따라 다르게 구성할 수 있습니다. (예: "기본 정보 노트를 생성하세요" 버튼 표시)
    // 현재는 폼이 비어있는 상태로 렌더링됩니다.
  }

  return (
    <div className={styles.container}>
      <Sidebar
        activeItem="basicinfo"
        isProjectSidebar={true}
        projectId={projectId}
      />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>기본정보</h1>
          {/* activeProjectBasicInfoNote가 있다면 그 제목을 부가적으로 표시할 수 있습니다. */}
          {/* <h2>{activeProjectBasicInfoNote?.title}</h2> */}
        </div>

        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.formField}>
            <label htmlFor="projectTitle" className={styles.fieldLabel}>
              작품 제목
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                placeholder="작품 제목을 입력하세요"
                className={styles.inputField}
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="genre" className={styles.fieldLabel}>
              장르
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                placeholder="장르를 입력하세요 (판타지, SF, 로맨스 등)"
                className={styles.inputField}
              />
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
