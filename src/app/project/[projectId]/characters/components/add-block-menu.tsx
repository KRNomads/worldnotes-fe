"use client";

import { useRef, useEffect } from "react";
import styles from "../characters.module.scss";

interface AddBlockMenuProps {
  onAddBlock: (type: "TEXT" | "TAGS" | "IMAGE") => void;
  onClose: () => void;
}

export default function AddBlockMenu({
  onAddBlock,
  onClose,
}: AddBlockMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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

  // JSX 구조 및 클래스명은 원본과 동일하게 유지
  return (
    <div className={styles.addBlockMenuOverlay}>
      {" "}
      <div className={styles.addBlockMenu} ref={menuRef}>
        <button className={styles.menuItem} onClick={() => onAddBlock("TEXT")}>
          <span className={styles.menuItemIcon}>T</span>
          <span className={styles.menuItemText}>텍스트</span>
        </button>
        <button className={styles.menuItem} onClick={() => onAddBlock("TAGS")}>
          <span className={styles.menuItemIcon}>#</span>
          <span className={styles.menuItemText}>태그</span>
        </button>
        <button className={styles.menuItem} onClick={() => onAddBlock("IMAGE")}>
          <span className={styles.menuItemIcon}>🖼️</span>
          <span className={styles.menuItemText}>이미지</span>
        </button>
      </div>
    </div>
  );
}
