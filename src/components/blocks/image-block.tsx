"use client";

import { useState, useEffect } from "react";
import type {
  Block,
  BlockUpdateRequest,
  ImageBlockProperties,
} from "@/shared/types/block";
import styles from "../../characters.module.scss";

interface ImageBlockProps {
  block: Block;
  isEditing: boolean;
  onUpdate: (updateData: BlockUpdateRequest) => Promise<void>;
  onEditingChange: (isEditing: boolean) => void;
}

export default function ImageBlock({
  block,
  isEditing,
  onUpdate,
  onEditingChange,
}: ImageBlockProps) {
  const properties = block.properties as ImageBlockProperties;
  const [url, setUrl] = useState(properties.url);
  const [caption, setCaption] = useState(properties.caption || "");

  useEffect(() => {
    setUrl(properties.url);
    setCaption(properties.caption || "");
  }, [properties.url, properties.caption]);

  const handleSave = async () => {
    await onUpdate({
      properties: {
        type: "IMAGE",
        url,
        caption,
      },
    });
    onEditingChange(false);
  };

  if (isEditing) {
    return (
      <div className={styles.imageBlockEditing}>
        <div className={styles.imageInputContainer}>
          <label htmlFor="imageUrl" className={styles.imageInputLabel}>
            이미지 URL:
          </label>
          <input
            id="imageUrl"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="이미지 URL을 입력하세요"
            className={styles.imageUrlInput}
          />
        </div>

        <div className={styles.imageInputContainer}>
          <label htmlFor="imageCaption" className={styles.imageInputLabel}>
            이미지 설명:
          </label>
          <input
            id="imageCaption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="이미지 설명을 입력하세요 (선택사항)"
            className={styles.imageCaptionInput}
          />
        </div>

        {url && (
          <div className={styles.imagePreviewContainer}>
            <p className={styles.previewLabel}>미리보기:</p>
            <img
              src={url || "/placeholder.svg"}
              alt={caption || "이미지 미리보기"}
              className={styles.imagePreview}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/placeholder.svg?height=200&width=300";
              }}
            />
          </div>
        )}

        <div className={styles.editingActions}>
          <button className={styles.saveButton} onClick={handleSave}>
            저장
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => {
              setUrl(properties.url);
              setCaption(properties.caption || "");
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
      className={styles.imageBlockDisplay}
      onClick={() => onEditingChange(true)}
    >
      {url ? (
        <div className={styles.imageContainer}>
          <img
            src={url || "/placeholder.svg"}
            alt={caption || "이미지"}
            className={styles.blockImage}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/placeholder.svg?height=200&width=300";
            }}
          />
          {caption && <p className={styles.imageCaption}>{caption}</p>}
        </div>
      ) : (
        <div className={styles.imageBlockPlaceholder}>
          <p>이미지를 추가하려면 클릭하세요...</p>
        </div>
      )}
    </div>
  );
}
