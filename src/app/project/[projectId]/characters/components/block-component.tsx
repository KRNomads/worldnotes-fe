"use client";

import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import type {
  Block,
  BlockUpdateRequest,
  TextBlockProperties,
  ImageBlockProperties,
  TagBlockProperties,
  BlockPropertiesUnion,
} from "@/types/block";
import { useBlockStore } from "@/store/blockStore";
import TextBlock from "./blocks/text-block"; // 자식 컴포넌트 경로 확인
import TagsBlock from "./blocks/tags-block"; // 자식 컴포넌트 경로 확인
import ImageBlock from "./blocks/image-block"; // 자식 컴포넌트 경로 확인
import styles from "../characters.module.scss";

const DEBOUNCE_DELAY = 1000; // 1초

interface BlockComponentProps {
  block: Block;
  noteId: string;
}

export default function BlockComponent({ block, noteId }: BlockComponentProps) {
  const { updateBlock, deleteBlock } = useBlockStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string>(block.title || "");

  // --- Debounced 업데이트 함수들 ---
  const debouncedUpdateTitle = useCallback(
    debounce(async (newTitle: string) => {
      // 현재 블록의 실제 제목 (null일 경우 빈 문자열로 간주)과 비교
      if (newTitle !== (block.title || "")) {
        console.log(
          `Debouncing title update for block ${block.blockId}:`,
          newTitle
        );
        await updateBlock(block.blockId, noteId, {
          type: block.type,
          title: newTitle,
        });
      }
    }, DEBOUNCE_DELAY),
    [block.blockId, block.noteId, block.title, block.type, updateBlock, noteId]
  );

  const debouncedUpdateContent = useCallback(
    debounce(async (newProperties: BlockPropertiesUnion) => {
      console.log(
        `Debouncing content update for block ${block.blockId}:`,
        newProperties
      );
      await updateBlock(block.blockId, noteId, {
        type: block.type,
        properties: newProperties,
      });
    }, DEBOUNCE_DELAY),
    [block.blockId, block.noteId, block.type, updateBlock, noteId]
  );

  // --- useEffect 훅 ---
  useEffect(() => {
    setCurrentTitle(block.title || "");
    setIsEditing(false); // 블록이 변경되면 일반 편집 모드는 해제
    setIsEditingTitle(false); // 블록이 변경되면 제목 편집 모드도 해제
  }, [block.blockId, block.title]); // block.id뿐만 아니라 block.title 변경 시에도 currentTitle 업데이트

  // Debounce cleanup
  useEffect(() => {
    return () => {
      debouncedUpdateTitle.cancel();
      debouncedUpdateContent.cancel();
    };
  }, [debouncedUpdateTitle, debouncedUpdateContent]);

  // --- 이벤트 핸들러 ---
  const handleCurrentTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
    debouncedUpdateTitle(e.target.value);
  };

  // onBlur 시에는 debounce를 flush하거나 직접 API 호출하여 즉시 저장
  const handleTitleChangeOnBlur = async () => {
    debouncedUpdateTitle.flush(); // lodash debounce의 flush 사용
    // 또는, 직접 호출:
    // if (currentTitle !== (block.title || "")) {
    //   await updateBlock(block.blockId, noteId, { type: block.type, title: currentTitle });
    // }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      debouncedUpdateTitle.flush(); // Enter 시 즉시 저장
      setIsEditingTitle(false);
    } else if (e.key === "Escape") {
      setCurrentTitle(block.title || ""); // 원래 제목으로 복원
      debouncedUpdateTitle.cancel(); // debounce 취소
      setIsEditingTitle(false);
    }
  };

  // 자식 컴포넌트에서 호출될 함수 (내부적으로 debounce된 함수를 호출)
  const handleContentUpdateFromChild = (
    updatedProperties: BlockPropertiesUnion
  ) => {
    // 여기서 자식 컴포넌트가 전달한 'updatedProperties'는 이미 {type: 'TYPE', ...} 형태여야 함.
    // 자식 컴포넌트는 자신의 핵심 값만 반환하고, 여기서 BlockPropertiesUnion을 만듦.
    // 예를 들어 TextBlock.onUpdate(newValue: string) -> 여기서 {type: "TEXT", value: newValue}로 변환
    // 이 함수의 파라미터는 이미 BlockPropertiesUnion 타입이므로 그대로 debouncedUpdateContent에 전달
    debouncedUpdateContent(updatedProperties);
  };

  const handleDeleteSpecificBlock = async () => {
    if (window.confirm("이 블록을 삭제하시겠습니까?")) {
      await deleteBlock(block.blockId, noteId);
    }
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case "TEXT":
        return (
          <TextBlock
            block={block as Block & { properties: TextBlockProperties }}
            isEditing={isEditing}
            // TextBlock의 onUpdate는 새 string 값(value)만 전달
            onUpdate={(newValue: string) =>
              handleContentUpdateFromChild({ type: "TEXT", value: newValue })
            }
            onEditingChange={setIsEditing}
          />
        );
      case "TAGS":
        return (
          <TagsBlock
            block={block as Block & { properties: TagBlockProperties }}
            isEditing={isEditing}
            // TagsBlock의 onUpdate는 새 string 배열(tags)만 전달
            onUpdate={(newTags: string[]) =>
              handleContentUpdateFromChild({ type: "TAGS", tags: newTags })
            }
            onEditingChange={setIsEditing}
          />
        );
      case "IMAGE":
        return (
          <ImageBlock
            block={block as Block & { properties: ImageBlockProperties }}
            isEditing={isEditing}
            // ImageBlock의 onUpdate는 { url, caption } 객체 전달
            onUpdate={(newImageAttrs: { url: string; caption?: string }) =>
              handleContentUpdateFromChild({
                type: "IMAGE",
                url: newImageAttrs.url,
                caption: newImageAttrs.caption,
              })
            }
            onEditingChange={setIsEditing}
          />
        );
      default:
        const _exhaustiveCheck: never = block.type;
        return <div>지원하지 않는 블록 타입입니다: {_exhaustiveCheck}</div>;
    }
  };

  return (
    <div
      className={`${styles.blockContainer} ${
        isEditing || isEditingTitle ? styles.editing : ""
      }`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className={styles.blockTitleContainer}>
        {isEditingTitle ? (
          <div className={styles.blockTitleEdit}>
            <input
              type="text"
              value={currentTitle}
              onChange={handleCurrentTitleChange}
              onBlur={handleTitleChangeOnBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className={styles.blockTitleInput}
            />
          </div>
        ) : (
          <div
            className={styles.blockTitle}
            onClick={() => {
              if (!isEditing) setIsEditingTitle(true);
            }}
          >
            {currentTitle || (block.title === null ? "" : "제목 없음")}
          </div>
        )}
      </div>

      <div className={styles.blockContent}>{renderBlockContent()}</div>

      {showOptions && !isEditing && !isEditingTitle && (
        <div className={styles.blockOptions}>
          <button
            className={styles.blockOptionButton}
            onClick={() => setIsEditingTitle(true)}
            aria-label="타이틀 편집"
            title="타이틀 편집"
          >
            T
          </button>
          <button
            className={styles.blockOptionButton}
            onClick={() => setIsEditing(true)}
            aria-label="블록 편집"
            title="블록 편집"
          >
            ✎
          </button>
          <button
            className={styles.blockOptionButton}
            onClick={handleDeleteSpecificBlock}
            aria-label="블록 삭제"
            title="블록 삭제"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
