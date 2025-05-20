"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Block, BlockUpdateRequest, TextBlockProperties } from "@/types/block"
import styles from "../../characters.module.scss"

interface TextBlockProps {
  block: Block
  isEditing: boolean
  onUpdate: (updateData: BlockUpdateRequest) => Promise<void>
  onEditingChange: (isEditing: boolean) => void
}

export default function TextBlock({ block, isEditing, onUpdate, onEditingChange }: TextBlockProps) {
  const properties = block.properties as TextBlockProperties
  const [text, setText] = useState(properties.value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setText(properties.value)
  }, [properties.value])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      // 커서를 텍스트 끝으로 이동
      textareaRef.current.selectionStart = textareaRef.current.value.length
      textareaRef.current.selectionEnd = textareaRef.current.value.length

      // 자동 높이 조절
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [isEditing])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)

    // 자동 높이 조절
    e.target.style.height = "auto"
    e.target.style.height = e.target.scrollHeight + "px"
  }

  const handleSave = async () => {
    await onUpdate({
      properties: {
        type: "TEXT",
        value: text,
      },
    })
    onEditingChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setText(properties.value) // 원래 값으로 되돌림
      onEditingChange(false)
    } else if (e.key === "Enter" && e.ctrlKey) {
      handleSave()
    }
  }

  if (isEditing) {
    return (
      <div className={styles.textBlockEditing}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className={styles.textBlockTextarea}
          placeholder="텍스트를 입력하세요..."
        />
        <div className={styles.editingActions}>
          <button className={styles.saveButton} onClick={handleSave}>
            저장
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => {
              setText(properties.value) // 원래 값으로 되돌림
              onEditingChange(false)
            }}
          >
            취소
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.textBlockDisplay} onClick={() => onEditingChange(true)}>
      {properties.value ? (
        <p className={styles.textBlockContent}>{properties.value}</p>
      ) : (
        <p className={styles.textBlockPlaceholder}>텍스트를 입력하려면 클릭하세요...</p>
      )}
    </div>
  )
}
