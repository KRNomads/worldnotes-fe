// src/components/Sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import styles from "./sidebar.module.scss";

interface SidebarProps {
  activeItem?:
    | "home"
    | "projects"
    | "basicinfo"
    | "characters"
    | "worldbuilding";
  isProjectSidebar?: boolean;
}

export default function Sidebar({
  activeItem = "home",
  isProjectSidebar = false,
}: SidebarProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.sidebar}>
      <h1 className={styles.logo}>World Note</h1>

      <div className={styles.menuContainer}>
        {isProjectSidebar ? (
          // 프로젝트 관련 사이드바 메뉴
          <>
            <Link
              href="/project/basicinfo"
              className={`${styles.navItem} ${
                activeItem === "basicinfo" ? styles.navItemActive : ""
              }`}
            >
              기본정보
            </Link>

            <Link
              href="/project/characters"
              className={`${styles.navItem} ${
                activeItem === "characters" ? styles.navItemActive : ""
              }`}
            >
              캐릭터 정보
            </Link>

            <Link
              href="/project/worldbuilding"
              className={`${styles.navItem} ${
                activeItem === "worldbuilding" ? styles.navItemActive : ""
              }`}
            >
              세계관 정보
            </Link>
          </>
        ) : (
          // 메인 사이드바 메뉴
          <>
            <Link
              href="/dashboard"
              className={`${styles.navItem} ${
                activeItem === "home" ? styles.navItemActive : ""
              }`}
            >
              홈
            </Link>
          </>
        )}

        {/* 로그아웃 버튼 (모든 사이드바에 공통으로 포함) */}
        <button
          className={styles.navItem}
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            textAlign: "left",
            justifyContent: "center",
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
