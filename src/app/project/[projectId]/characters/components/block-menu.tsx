"use client"

import { useRef, useEffect } from "react"
import styles from "../characters.module.scss"

interface BlockMenuProps {
  onAddBlock: (type: "TEXT" | "TAGS" | "IMAGE") => void
  onClose: () => void
}

export default function BlockMenu({ onAddBlock, onClose }: BlockMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <div className={styles.blockMenuOverlay}>
      <div className={styles.blockMenu} ref={menuRef}>
        <button className={styles.blockMenuItem} onClick={() => onAddBlock("TEXT")}>
          <span className={styles.blockMenuItemIcon}>T</span>
          <span className={styles.blockMenuItemText}>텍스트</span>
        </button>
        <button className={styles.blockMenuItem} onClick={() => onAddBlock("TAGS")}>
          <span className={styles.blockMenuItemIcon}>#</span>
          <span className={styles.blockMenuItemText}>태그</span>
        </button>
        <button className={styles.blockMenuItem} onClick={() => onAddBlock("IMAGE")}>
          <span className={styles.blockMenuItemIcon}>🖼️</span>
          <span className={styles.blockMenuItemText}>이미지</span>
        </button>
      </div>
    </div>
  )
}
