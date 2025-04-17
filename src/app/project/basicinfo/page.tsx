"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./basicinfo.module.scss";

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
      <div className={styles.sidebar}>
        <h1 className={styles.logo}>World Note</h1>

        <div className={styles.menuContainer}>
          <Link
            href="/project/basicinfo"
            className={`${styles.navItem} ${styles.navItemActive}`}
          >
            기본정보
          </Link>

          <Link href="/project/characters" className={styles.navItem}>
            캐릭터 정보
          </Link>

          <Link href="/project/worldbuilding" className={styles.navItem}>
            세계관 정보
          </Link>
        </div>
      </div>

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

          {/* <div className={styles.formField}>
            <label htmlFor="period" className={styles.fieldLabel}>
              시대 배경
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                id="period"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                placeholder="시대 배경을 입력하세요 (현대, 중세, 미래 등)"
                className={styles.inputField}
              />
            </div>
          </div>
          
          <div className={styles.formField}>
            <label htmlFor="background" className={styles.fieldLabel}>
              작품 배경
            </label>
            <div className={styles.textAreaContainer}>
              <textarea
                id="background"
                name="background"
                value={formData.background}
                onChange={handleInputChange}
                placeholder="작품의 배경을 자세히 설명해주세요"
                className={styles.textAreaField}
              />
            </div>
          </div>
          
          <div className={styles.formField}>
            <label htmlFor="summary" className={styles.fieldLabel}>
              줄거리
            </label>
            <div className={styles.textAreaContainer}>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="줄거리를 입력하세요"
                className={styles.textAreaField}
              />
            </div>
          </div>
          
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>
              저장하기
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
}
