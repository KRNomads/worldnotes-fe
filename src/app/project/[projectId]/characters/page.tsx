// src/app/project/[projectId]/characters/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./characters.module.scss";
import Sidebar from "@/components/sidebar/sidebar";
import { useProjectStore } from "@/store/projectStore";

// 프로필 항목의 타입 정의
interface ProfileItem {
  id: string;
  label: string;
  value: string;
}

export default function Characters() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { error, fetchProject } = useProjectStore();

  // 선택된 캐릭터 상태 관리
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    "character1"
  );

  // 프로필 항목 상태 관리
  const [profileItems, setProfileItems] = useState<ProfileItem[]>([
    { id: "profile-1", label: "이름", value: "" },
  ]);

  // 컴포넌트 마운트 시 프로젝트 데이터 로드
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  // 캐릭터 데이터 (예시)
  const charactersList = [
    { id: "character1", name: "주인공" },
    { id: "character2", name: "조력자" },
    { id: "character3", name: "적대자" },
  ];

  // textarea 높이 자동 조절 함수
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  // 프로필 항목 추가 함수
  const addProfileItem = () => {
    const newId = `profile-${profileItems.length + 1}`;
    setProfileItems([...profileItems, { id: newId, label: "", value: "" }]);
  };

  // 프로필 라벨 변경 함수
  const handleLabelChange = (id: string, newLabel: string) => {
    setProfileItems(
      profileItems.map((item) =>
        item.id === id ? { ...item, label: newLabel } : item
      )
    );
  };

  // 프로필 값 변경 함수
  const handleValueChange = (id: string, newValue: string) => {
    setProfileItems(
      profileItems.map((item) =>
        item.id === id ? { ...item, value: newValue } : item
      )
    );
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
      {/* 사이드바 */}
      <Sidebar
        activeItem="characters"
        isProjectSidebar={true}
        projectId={projectId}
      />

      {/* 메인 콘텐츠 영역 */}
      <div className={styles.mainContent}>
        {/* 상단 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>캐릭터 정보</h2>
          <button className={styles.addCharacterBtn}>+ 캐릭터 추가</button>
        </div>

        <div className={styles.contentContainer}>
          {/* 왼쪽 캐릭터 목록 패널 */}
          <div className={styles.charactersPanel}>
            <h3 className={styles.charactersPanelTitle}>캐릭터 목록</h3>
            <div className={styles.divider}></div>
            <div className={styles.charactersList}>
              {charactersList.map((character) => (
                <div
                  key={character.id}
                  className={`${styles.characterItem} ${
                    selectedCharacter === character.id
                      ? styles.characterItemActive
                      : ""
                  }`}
                  onClick={() => setSelectedCharacter(character.id)}
                >
                  <div className={styles.characterAvatar}></div>
                  <span className={styles.characterName}>{character.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽 캐릭터 정보 패널 */}
          <div className={styles.characterInfoPanel}>
            <div className={styles.characterInfoHeader}>
              <h3 className={styles.characterInfoTitle}>새 캐릭터</h3>
              <button className={styles.deleteBtn}>삭제</button>
            </div>

            {/* 캐릭터 정보 상단 */}
            <div className={styles.characterInfoTop}>
              <div className={styles.characterImageArea}>
                <span className={styles.characterImagePlaceholder}>🖼️</span>
              </div>
              <div className={styles.characterDescArea}>
                <h4 className={styles.characterDescTitle}>캐릭터 설명</h4>
                <div className={styles.characterDescInputContainer}>
                  <textarea
                    className={styles.characterDescInput}
                    placeholder="캐릭터에 대한 설명을 입력하세요..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 캐릭터 프로필 */}
            <div className={styles.characterProfile}>
              <h3 className={styles.profileTitle}>캐릭터 프로필</h3>
              <div className={styles.profileItems}>
                {/* 프로필 항목들을 동적으로 렌더링 */}
                {profileItems.map((item) => (
                  <div key={item.id} className={styles.profileRow}>
                    <div className={styles.profileLabel}>
                      <textarea
                        className={styles.profileLabelInput}
                        value={item.label}
                        placeholder=""
                        rows={1}
                        onChange={(e) =>
                          handleLabelChange(item.id, e.target.value)
                        }
                        onInput={handleTextareaInput}
                      ></textarea>
                    </div>
                    <div className={styles.profileInputContainer}>
                      <textarea
                        className={styles.profileInput}
                        value={item.value}
                        placeholder="내용을 입력하세요"
                        rows={1}
                        onChange={(e) =>
                          handleValueChange(item.id, e.target.value)
                        }
                        onInput={handleTextareaInput}
                      ></textarea>
                      <div className={styles.profileOptions}>
                        <span className={styles.optionsIcon}>⋯</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 프로필 추가 버튼 */}
              <div className={styles.addProfileBtnContainer}>
                <button
                  className={styles.addProfileBtn}
                  onClick={addProfileItem}
                >
                  프로필 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
