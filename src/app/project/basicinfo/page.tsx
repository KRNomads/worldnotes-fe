"use client";

import React, { useState } from "react";
import styles from "./basicinfo.module.scss";
import Sidebar from "../../../components/sidebar/sidebar";

export default function BasicInfo() {
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    period: "",
    background: "",
    summary: "",
  });

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

  return (
    <div className={styles.container}>
      {/* 사이드바 */}
      <Sidebar activeItem="basicinfo" isProjectSidebar={true} />

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
        </form>
      </div>
    </div>
  );
}
