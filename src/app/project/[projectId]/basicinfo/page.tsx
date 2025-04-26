// src/app/project/[projectId]/basicinfo/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./basicinfo.module.scss";
import Sidebar from "@/components/sidebar/sidebar";
import { useProjectStore } from "@/store/projectStore";

export default function BasicInfo() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { currentProject, error, fetchProject } = useProjectStore();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    period: "",
    background: "",
    summary: "",
  });

  // 컴포넌트 마운트 시 프로젝트 데이터 로드
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  // 프로젝트 데이터가 로드되면 폼 상태 업데이트
  useEffect(() => {
    if (currentProject) {
      setFormData({
        title: currentProject.title || "",
        genre: "", // 현재 API가 반환하는 데이터에 따라 추가 필드 매핑
        period: "",
        background: "",
        summary: "",
      });
    }
  }, [currentProject]);

  // 입력 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("저장된 데이터:", formData);
    // 여기에 데이터 저장 로직 구현
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button
          onClick={() => fetchProject(projectId)}
          className={styles.retryButton}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 사이드바 - 프로젝트 ID 전달 */}
      <Sidebar
        activeItem="basicinfo"
        isProjectSidebar={true}
        projectId={projectId}
      />

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>기본정보</h1>
        </div>

        {/* 폼 컨테이너 */}
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          {/* 작품 제목 필드 */}
          <div className={styles.formField}>
            <label htmlFor="title" className={styles.fieldLabel}>
              작품 제목
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="작품 제목을 입력하세요"
                className={styles.inputField}
              />
            </div>
          </div>

          {/* 장르 필드 */}
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

          {/* 저장 버튼 */}
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
