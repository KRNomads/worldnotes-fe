"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import type {
  Block,
  BlockUpdateRequest,
  TagBlockProperties,
} from "@/shared/types/block";
import styles from "../../characters.module.scss";

interface TagsBlockProps {
  block: Block;
  isEditing: boolean;
  onUpdate: (updateData: BlockUpdateRequest) => Promise<void>;
  onEditingChange: (isEditing: boolean) => void;
}

export default function TagsBlock({
  block,
  isEditing,
  onUpdate,
  onEditingChange,
}: TagsBlockProps) {
  const properties = block.properties as TagBlockProperties;
  const [tags, setTags] = useState<string[]>(properties.tags);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTags(properties.tags);
  }, [properties.tags]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAddTag = () => {
    if (inputValue.trim()) {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      setTags(properties.tags); // 원래 값으로 되돌림
      onEditingChange(false);
    }
  };

  const handleSave = async () => {
    await onUpdate({
      properties: {
        type: "TAGS",
        tags,
      },
    });
    onEditingChange(false);
  };

  if (isEditing) {
    return (
      <div className={styles.tagsBlockEditing}>
        <div className={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <div key={index} className={styles.tag}>
              <span className={styles.tagText}>{tag}</span>
              <button
                className={styles.removeTagButton}
                onClick={() => handleRemoveTag(index)}
                aria-label="태그 삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className={styles.tagInputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="태그를 입력하고 Enter를 누르세요"
            className={styles.tagInput}
          />
          <button className={styles.addTagButton} onClick={handleAddTag}>
            추가
          </button>
        </div>

        <div className={styles.editingActions}>
          <button className={styles.saveButton} onClick={handleSave}>
            저장
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => {
              setTags(properties.tags); // 원래 값으로 되돌림
              onEditingChange(false);
            }}
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.tagsBlockDisplay}
      onClick={() => onEditingChange(true)}
    >
      {tags.length > 0 ? (
        <div className={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <div key={index} className={styles.tag}>
              <span className={styles.tagText}>{tag}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.tagsBlockPlaceholder}>
          태그를 추가하려면 클릭하세요...
        </p>
      )}
    </div>
  );
}
