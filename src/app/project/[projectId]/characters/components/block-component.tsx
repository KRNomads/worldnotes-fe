"use client"

import { useState } from "react"
import type { Block, BlockUpdateRequest } from "@/types/block"
import { useBlockStore } from "@/store/blockStore"
import TextBlock from "./blocks/text-block"
import TagsBlock from "./blocks/tags-block"
import ImageBlock from "./blocks/image-block"
import styles from "../characters.module.scss"

interface BlockComponentProps {
  block: Block
  noteId: string
}

export default function BlockComponent({ block, noteId }: BlockComponentProps) {
  const { updateBlock, deleteBlock } = useBlockStore()
  const [isEditing, setIsEditing] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleUpdateBlock = async (updateData: BlockUpdateRequest) => {
    await updateBlock(block.blockId, noteId, updateData)
  }

  const handleDeleteBlock = async () => {
    if (window.confirm("이 블록을 삭제하시겠습니까?")) {
      await deleteBlock(block.blockId, noteId)
    }
  }

  const renderBlockContent = () => {
    switch (block.type) {
      case "TEXT":
        return (
          <TextBlock block={block} isEditing={isEditing} onUpdate={handleUpdateBlock} onEditingChange={setIsEditing} />
        )
      case "TAGS":
        return (
          <TagsBlock block={block} isEditing={isEditing} onUpdate={handleUpdateBlock} onEditingChange={setIsEditing} />
        )
      case "IMAGE":
        return (
          <ImageBlock block={block} isEditing={isEditing} onUpdate={handleUpdateBlock} onEditingChange={setIsEditing} />
        )
      default:
        return <div>지원하지 않는 블록 타입입니다.</div>
    }
  }

  return (
    <div
      className={`${styles.blockContainer} ${isEditing ? styles.editing : ""}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {block.title && <div className={styles.blockTitle}>{block.title}</div>}

      <div className={styles.blockContent}>{renderBlockContent()}</div>

      {showOptions && !isEditing && (
        <div className={styles.blockOptions}>
          <button className={styles.blockOptionButton} onClick={() => setIsEditing(true)} aria-label="블록 편집">
            ✎
          </button>
          <button className={styles.blockOptionButton} onClick={handleDeleteBlock} aria-label="블록 삭제">
            ×
          </button>
        </div>
      )}
    </div>
  )
}
