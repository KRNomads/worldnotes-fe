// src/components/sidebar/sidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./sidebar.module.scss";
import settingIcon from "../../../public/settingIcon.svg";
import { useAuthStore } from "@/store/authStore";
import { useWebSocketStore } from "@/store/websocketStore";

// 모달 컴포넌트를 사이드바 파일 내에 정의
function SettingsModal({ onClose }: { onClose: () => void }) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // ESC 키로 모달 닫기
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // 모달 외부 클릭 시 닫기
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    // 모달이 열릴 때 스크롤 방지
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);

      // 모달이 닫힐 때 스크롤 복원
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>설정</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.settingsSection}>
            <h3 className={styles.sectionTitle}>API 발급</h3>
            <div className={styles.settingItem}></div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button className={styles.saveButton}>확인</button>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  activeItem?: "home" | "basicinfo" | "characters" | "worldbuilding";
  isProjectSidebar?: boolean;
  projectId?: string; // 프로젝트 ID 추가
}

export default function Sidebar({
  activeItem = "home",
  isProjectSidebar = false,
  projectId = "", // 기본값 설정
}: SidebarProps) {
  const { logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===== 웹소켓 관련 ======
  const { isConnected, connect, disconnect } = useWebSocketStore();
  // ========================

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <Link href={`/dashboard`} className={styles.logo}>
          World Note
        </Link>
        <button
          className={styles.settingsButton}
          onClick={() => setIsModalOpen(true)}
          aria-label="설정"
        >
          <Image
            src={settingIcon || "/placeholder.svg"}
            alt="설정"
            width={30}
            height={30}
          />
        </button>
      </div>

      <div className={styles.menuContainer}>
        {isProjectSidebar ? (
          // 프로젝트 관련 사이드바 메뉴 (동적 라우팅 적용)
          <>
            <Link
              href={`/project/${projectId}/basicinfo`}
              className={`${styles.navItem} ${
                activeItem === "basicinfo" ? styles.navItemActive : ""
              }`}
            >
              기본정보
            </Link>

            <Link
              href={`/project/${projectId}/characters`}
              className={`${styles.navItem} ${
                activeItem === "characters" ? styles.navItemActive : ""
              }`}
            >
              캐릭터 정보
            </Link>

            <Link
              href={`/project/${projectId}/worldbuilding`}
              className={`${styles.navItem} ${
                activeItem === "worldbuilding" ? styles.navItemActive : ""
              }`}
            >
              세계관 정보
            </Link>

            <button
              className={styles.navItem}
              onClick={isConnected ? disconnect : connect}
              style={{
                background: "none",
                border: "none",
                color: isConnected ? "green" : "orange",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              웹소켓 테스트
            </button>
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
            color: "red",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 모달 렌더링 */}
      {isModalOpen && <SettingsModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
