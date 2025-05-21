// src/app/project/[projectId]/characters/components/block-menu.tsx
"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import styles from "../characters.module.scss";

interface BlockMenuProps {
  onAddBlock: (type: "TEXT" | "TAGS" | "IMAGE") => void;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>; // null 허용하도록 수정됨
  position?: "bottom" | "top";
}

export default function BlockMenu({
  onAddBlock,
  onClose,
  buttonRef,
  position = "bottom",
}: BlockMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isPositionCalculated, setIsPositionCalculated] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (buttonRef?.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 45;
      const menuWidth = 200;

      let top, left;
      left =
        buttonRect.left + window.scrollX + buttonRect.width / 2 - menuWidth / 2;

      if (position === "top") {
        top = buttonRect.top + window.scrollY - menuHeight - 8;
      } else {
        top = buttonRect.bottom + window.scrollY + 8;
      }

      const { innerWidth, innerHeight } = window;
      // 화면 경계 체크 및 조정
      if (left < 8) left = 8;
      if (left + menuWidth > innerWidth - 8) left = innerWidth - menuWidth - 8;
      if (top < 8) top = 8; // 메뉴가 화면 상단 밖으로 나가지 않도록
      if (top + menuHeight > innerHeight - 8) {
        // 메뉴가 화면 하단 밖으로 나갈 경우
        if (position === "bottom") {
          // 현재 아래에 표시하려 했다면 위로 조정
          top = buttonRect.top + window.scrollY - menuHeight - 8;
          if (top < 8) top = 8; // 그래도 위로 넘치면 최상단에 고정
        } else {
          // 이미 위쪽에 표시하려 했는데도 넘치면 (매우 작은 화면 등) 최하단에 고정
          top = innerHeight - menuHeight - 8;
        }
      }

      setMenuPosition({ top, left });
      setIsPositionCalculated(true);
    } else {
      // buttonRef.current가 없으면 위치 계산을 시도하지 않음
      setIsPositionCalculated(false);
    }
  }, [buttonRef, position]); // position 변경 시에도 재계산

  // 위치 계산이 완료되지 않았거나 buttonRef가 유효하지 않으면 렌더링하지 않음
  if (!isPositionCalculated || !buttonRef?.current) {
    return null;
  }

  return (
    <div
      className={styles.blockMenuDropdown}
      ref={menuRef}
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        visibility: isPositionCalculated ? "visible" : "hidden", // 위치 계산 후 보이도록
      }}
      data-position={position}
    >
      <div className={styles.blockMenu}>
        <button
          className={styles.blockMenuItem}
          onClick={() => onAddBlock("TEXT")}
        >
          <span className={styles.blockMenuItemIcon}>T</span>
          <span className={styles.blockMenuItemText}>텍스트 추가</span>
        </button>
        {/* 다른 타입 블록 추가 기능은 현재 주석 처리됨
        <button className={styles.blockMenuItem} onClick={() => onAddBlock("TAGS")}>
          <span className={styles.blockMenuItemIcon}>#</span>
          <span className={styles.blockMenuItemText}>태그 추가</span>
        </button>
        <button className={styles.blockMenuItem} onClick={() => onAddBlock("IMAGE")}>
          <span className={styles.blockMenuItemIcon}>🖼️</span>
          <span className={styles.blockMenuItemText}>이미지 추가</span>
        </button>
        */}
      </div>
    </div>
  );
}
