"use client";

import React from "react";
import Link from "next/link";
import styles from "../basicinfo/basicinfo.module.scss";

export default function Characters() {
  return (
    <div className={styles.container}>
      {/* 사이드바 */}
      <div className={styles.sidebar}>
        <h1 className={styles.logo}>World Note</h1>

        <div className={styles.menuContainer}>
          <Link href="/project/basicinfo" className={styles.navItem}>
            기본정보
          </Link>

          <Link
            href="/project/characters"
            className={`${styles.navItem} ${styles.navItemActive}`}
          >
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
          <h1 className={styles.headerTitle}>캐릭터 정보</h1>
        </div>

        {/* 캐릭터 정보 컨텐츠 - 기본 틀만 구현 */}
        <div className={styles.formContainer}>
          <p>캐릭터 정보 페이지입니다.</p>
          <p>이 페이지는 아직 구현 중입니다.</p>
        </div>
      </div>
    </div>
  );
}
