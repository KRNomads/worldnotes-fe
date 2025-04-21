"use client";

import React from "react";
import styles from "../basicinfo/basicinfo.module.scss";
import Sidebar from "../../../components/sidebar/sidebar";

export default function Worldbuilding() {
  return (
    <div className={styles.container}>
      {/* 사이드바 */}
      <Sidebar activeItem="worldbuilding" isProjectSidebar={true} />

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>세계관 정보</h1>
        </div>

        {/* 세계관 정보 컨텐츠 - 기본 틀만 구현 */}
        <div className={styles.formContainer}>
          <p>세계관 정보 페이지입니다.</p>
          <p>이 페이지는 아직 구현 중입니다.</p>
        </div>
      </div>
    </div>
  );
}
