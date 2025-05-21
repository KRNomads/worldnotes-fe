"use client";

import type React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { debounce } from "lodash";
import { useBlockStore } from "@/store/blockStore";
import { useNoteStore } from "@/store/noteStore";
import type {
  BlockCreateRequest,
  Block,
  TextBlockProperties,
  ImageBlockProperties,
  BlockUpdateRequest,
} from "@/types/block";
import BlockMenu from "./block-menu";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import styles from "../characters.module.scss";

const DEBOUNCE_DELAY = 1000;

interface StructuredCharacterEditorProps {
  noteId: string;
  projectId: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function StructuredCharacterEditor({
  noteId,
}: // projectId,
StructuredCharacterEditorProps) {
  const {
    fetchBlocksByNote,
    getBlocksForNote,
    isLoading: isLoadingBlocks,
    error: errorBlocks,
    createBlock,
    createBlocks,
    updateBlock,
    deleteBlock,
  } = useBlockStore();
  const {
    notes,
    updateNote,
    currentNote: activeNoteFromNoteStore,
  } = useNoteStore();

  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const [characterTitle, setCharacterTitle] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);
  const [appearance, setAppearance] = useState("");
  const [basicInfo, setBasicInfo] = useState("");

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addBlockButtonRef = useRef<HTMLButtonElement | null>(null);

  const [additionalTextBlocks, setAdditionalTextBlocks] = useState<Block[]>([]);
  const [editingBlockTitleId, setEditingBlockTitleId] = useState<number | null>(
    null
  );
  const [editingBlockTitleValue, setEditingBlockTitleValue] = useState("");

  // ========== 추가: 기본 블록 검사 완료 플래그 ==========
  const [isDefaultBlockCheckDone, setIsDefaultBlockCheckDone] = useState(false);
  // =======================================================

  const currentNoteDetails =
    activeNoteFromNoteStore?.id === noteId
      ? activeNoteFromNoteStore
      : notes.find((note) => note.id === noteId);
  const blocksFromStore = getBlocksForNote(noteId);

  const debouncedUpdateNoteTitle = useCallback(
    debounce(async (newTitle: string) => {
      if (currentNoteDetails && newTitle !== currentNoteDetails.title) {
        await updateNote(noteId, { title: newTitle });
      }
    }, DEBOUNCE_DELAY),
    [noteId, currentNoteDetails, updateNote]
  );

  const getStructuredBlock = useCallback(
    (title: string, type: Block["type"]): Block | undefined => {
      return blocksFromStore.find((b) => b.title === title && b.type === type);
    },
    [blocksFromStore]
  );

  const debouncedUpdateAppearance = useCallback(
    debounce(async (newAppearance: string) => {
      const appearanceBlock = getStructuredBlock("외모", "TEXT");
      if (
        appearanceBlock &&
        appearanceBlock.properties.type === "TEXT" &&
        newAppearance !== appearanceBlock.properties.value
      ) {
        await updateBlock(appearanceBlock.blockId, noteId, {
          type: "TEXT",
          properties: { type: "TEXT", value: newAppearance },
        });
      }
    }, DEBOUNCE_DELAY),
    [noteId, getStructuredBlock, updateBlock]
  );

  const debouncedUpdateBasicInfo = useCallback(
    debounce(async (newBasicInfo: string) => {
      const basicInfoBlock = getStructuredBlock("텍스트", "TEXT");
      if (
        basicInfoBlock &&
        basicInfoBlock.properties.type === "TEXT" &&
        newBasicInfo !== basicInfoBlock.properties.value
      ) {
        await updateBlock(basicInfoBlock.blockId, noteId, {
          type: "TEXT",
          properties: { type: "TEXT", value: newBasicInfo },
        });
      }
    }, DEBOUNCE_DELAY),
    [noteId, getStructuredBlock, updateBlock]
  );

  const debouncedUpdateAdditionalBlockContent = useCallback(
    debounce(async (blockId: number, newContent: string) => {
      const blockToUpdate = blocksFromStore.find((b) => b.blockId === blockId);
      if (
        blockToUpdate &&
        blockToUpdate.properties.type === "TEXT" &&
        newContent !== blockToUpdate.properties.value
      ) {
        await updateBlock(blockId, noteId, {
          type: "TEXT",
          properties: { type: "TEXT", value: newContent },
        });
      }
    }, DEBOUNCE_DELAY),
    [noteId, blocksFromStore, updateBlock]
  );

  const debouncedUpdateAdditionalBlockTitle = useCallback(
    debounce(async (blockId: number, newTitle: string) => {
      const blockToUpdate = blocksFromStore.find((b) => b.blockId === blockId);
      if (!blockToUpdate) return;
      const trimmedNewTitle = newTitle.trim();
      if (trimmedNewTitle !== (blockToUpdate.title || "").trim()) {
        if (trimmedNewTitle === "") {
          console.warn(
            `Block title for ${blockId} cannot be empty via debounce. Final check onBlur.`
          );
          return;
        }
        await updateBlock(blockId, noteId, {
          type: blockToUpdate.type,
          title: trimmedNewTitle,
        });
      }
    }, DEBOUNCE_DELAY),
    [noteId, blocksFromStore, updateBlock]
  );

  useEffect(() => {
    if (currentNoteDetails) {
      setCharacterTitle(currentNoteDetails.title || "");
    }
    const imageBlock = getStructuredBlock("이미지", "IMAGE");
    if (imageBlock && imageBlock.properties.type === "IMAGE") {
      setCurrentImageUrl(imageBlock.properties.url || "");
      setImageError(false);
    } else {
      setCurrentImageUrl("");
      setImageError(false);
    }

    const appearanceBlock = getStructuredBlock("외모", "TEXT");
    setAppearance(
      appearanceBlock && appearanceBlock.properties.type === "TEXT"
        ? appearanceBlock.properties.value || ""
        : ""
    );

    const basicInfoBlock = getStructuredBlock("텍스트", "TEXT");
    setBasicInfo(
      basicInfoBlock && basicInfoBlock.properties.type === "TEXT"
        ? basicInfoBlock.properties.value || ""
        : ""
    );

    const structuredTitles = ["이미지", "외모", "텍스트"];
    setAdditionalTextBlocks(
      blocksFromStore
        .filter(
          (b) =>
            b.type === "TEXT" &&
            b.title !== null &&
            !structuredTitles.includes(b.title)
        )
        .sort((a, b) => a.position - b.position)
    );
  }, [blocksFromStore, currentNoteDetails, getStructuredBlock]);

  useEffect(() => {
    if (noteId) {
      fetchBlocksByNote(noteId);
      // ========== 수정: noteId 변경 시 기본 블록 검사 플래그 리셋 ==========
      setIsDefaultBlockCheckDone(false);
      // =================================================================
    }
  }, [noteId, fetchBlocksByNote]);

  // ========== 수정: 기본 블록 생성 로직 useEffect 수정 ==========
  useEffect(() => {
    if (noteId && !isLoadingBlocks && !isDefaultBlockCheckDone) {
      // 플래그 확인
      const imageBlock = getStructuredBlock("이미지", "IMAGE");
      const appearanceBlock = getStructuredBlock("외모", "TEXT");
      const basicInfoBlock = getStructuredBlock("텍스트", "TEXT");

      const needsImage = !imageBlock;
      const needsAppearance = !appearanceBlock;
      const needsBasicInfo = !basicInfoBlock;

      // 최초 로드 시 블록이 없거나, 필수 블록 중 하나라도 없으면 생성 시도
      if (
        blocksFromStore.length === 0 ||
        needsImage ||
        needsAppearance ||
        needsBasicInfo
      ) {
        const requests: BlockCreateRequest[] = [];
        if (needsImage)
          requests.push({
            noteId,
            title: "이미지",
            type: "IMAGE",
            properties: { type: "IMAGE", url: "" },
          });
        if (needsAppearance)
          requests.push({
            noteId,
            title: "외모",
            type: "TEXT",
            properties: { type: "TEXT", value: "" },
          });
        if (needsBasicInfo)
          requests.push({
            noteId,
            title: "텍스트",
            type: "TEXT",
            properties: { type: "TEXT", value: "" },
          });

        if (requests.length > 0) {
          console.log(
            `Attempting to create default blocks for noteId ${noteId}`
          );
          createBlocks({ blocks: requests })
            .then(() => {
              console.log(
                `Default blocks creation attempt finished for noteId ${noteId}`
              );
              // 성공/실패 여부와 관계없이 한 번 시도했으므로 플래그 설정
              // fetchBlocksByNote(noteId); // createBlocks 후 스토어가 업데이트되면 blocksFromStore useEffect가 다시 실행됨
            })
            .catch((err) => {
              console.error("Failed to create default blocks:", err);
            })
            .finally(() => {
              setIsDefaultBlockCheckDone(true); // 시도 후 플래그 설정
            });
        } else {
          // 생성할 요청이 없으면 (즉, 모든 기본 블록이 이미 존재하면)
          setIsDefaultBlockCheckDone(true);
        }
      } else {
        // 모든 기본 블록이 이미 존재하고 blocksFromStore도 비어있지 않음
        setIsDefaultBlockCheckDone(true);
      }
    }
    // 의존성 배열: isDefaultBlockCheckDone 추가, createBlocks, getStructuredBlock 안정화 가정
  }, [
    noteId,
    isLoadingBlocks,
    blocksFromStore,
    isDefaultBlockCheckDone,
    getStructuredBlock,
    createBlocks,
  ]);
  // ====================================================================================

  useEffect(
    () => () => debouncedUpdateNoteTitle.cancel(),
    [debouncedUpdateNoteTitle]
  );
  useEffect(
    () => () => debouncedUpdateAppearance.cancel(),
    [debouncedUpdateAppearance]
  );
  useEffect(
    () => () => debouncedUpdateBasicInfo.cancel(),
    [debouncedUpdateBasicInfo]
  );
  useEffect(
    () => () => debouncedUpdateAdditionalBlockContent.cancel(),
    [debouncedUpdateAdditionalBlockContent]
  );
  useEffect(
    () => () => debouncedUpdateAdditionalBlockTitle.cancel(),
    [debouncedUpdateAdditionalBlockTitle]
  );

  const handleCharacterTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTitle = e.target.value;
    setCharacterTitle(newTitle);
    debouncedUpdateNoteTitle(newTitle);
  };

  const handleImageChangeAndUpdateBlock = async (newUrl: string) => {
    setCurrentImageUrl(newUrl);
    setImageError(false);
    const imageBlock = getStructuredBlock("이미지", "IMAGE");
    const currentCaption =
      (imageBlock?.properties as ImageBlockProperties)?.caption || "";
    const updatePayload: BlockUpdateRequest = {
      type: "IMAGE",
      properties: { type: "IMAGE", url: newUrl, caption: currentCaption },
    };
    if (imageBlock)
      await updateBlock(imageBlock.blockId, noteId, updatePayload);
    else
      await createBlock({
        noteId,
        title: "이미지",
        type: "IMAGE",
        properties: { type: "IMAGE", url: newUrl, caption: "" },
      });
  };

  const handleAppearanceInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setAppearance(newValue);
    debouncedUpdateAppearance(newValue);
  };

  const handleBasicInfoInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setBasicInfo(newValue);
    debouncedUpdateBasicInfo(newValue);
  };

  const handleAdditionalTextBlockContentInputChange = (
    blockId: number,
    value: string
  ) => {
    setAdditionalTextBlocks((prev) =>
      prev.map((b) =>
        b.blockId === blockId && b.properties.type === "TEXT"
          ? {
              ...b,
              properties: { ...b.properties, value } as TextBlockProperties,
            }
          : b
      )
    );
    debouncedUpdateAdditionalBlockContent(blockId, value);
  };

  const handleStartEditingBlockTitle = (block: Block) => {
    setEditingBlockTitleId(block.blockId);
    setEditingBlockTitleValue(block.title || "");
  };

  const handleEditingBlockTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTitle = e.target.value;
    setEditingBlockTitleValue(newTitle);
    if (editingBlockTitleId !== null) {
      debouncedUpdateAdditionalBlockTitle(editingBlockTitleId, newTitle);
    }
  };

  const handleSaveBlockTitleEditOnBlur = async (blockId: number) => {
    debouncedUpdateAdditionalBlockTitle.cancel();
    const blockToUpdate = blocksFromStore.find((b) => b.blockId === blockId);
    if (!blockToUpdate) return;
    const finalTitle = editingBlockTitleValue.trim();
    if (finalTitle === "") {
      alert("블록 제목은 비워둘 수 없습니다.");
      setEditingBlockTitleValue(blockToUpdate.title || "제목 없음");
      setEditingBlockTitleId(null);
      return;
    }
    if (finalTitle !== (blockToUpdate.title || "").trim()) {
      await updateBlock(blockId, noteId, {
        type: blockToUpdate.type,
        title: finalTitle,
      });
    }
    setEditingBlockTitleId(null);
  };

  const handleCancelBlockTitleEdit = () => {
    setEditingBlockTitleId(null);
  };
  const handleDeleteAdditionalBlock = async (blockId: number) => {
    if (window.confirm("이 텍스트 블록을 삭제하시겠습니까?"))
      await deleteBlock(blockId, noteId);
  };

  const simulateImageUpload = useCallback(
    async (file: File): Promise<string> => {
      return URL.createObjectURL(file);
    },
    []
  );
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file || !file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      setUploadStatus("uploading");
      setUploadProgress(0);
      setImageError(false);
      const progressInterval = setInterval(
        () => setUploadProgress((prev) => Math.min(prev + 10, 90)),
        200
      );
      try {
        const uploadedUrl = await simulateImageUpload(file);
        await handleImageChangeAndUpdateBlock(uploadedUrl);
        setUploadProgress(100);
        setUploadStatus("success");
      } catch (err) {
        console.error("이미지 업로드 실패:", err);
        setUploadStatus("error");
        setImageError(true);
      } finally {
        clearInterval(progressInterval);
        setTimeout(() => setUploadStatus("idle"), 3000);
      }
    },
    [handleImageChangeAndUpdateBlock, simulateImageUpload]
  );
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
  };
  const handleImageAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddNewBlock = async (type: "TEXT" | "TAGS" | "IMAGE") => {
    if (!noteId) return;
    if (type === "TEXT") {
      await createBlock({
        noteId,
        title: "새 텍스트 항목",
        type: "TEXT",
        properties: { type: "TEXT", value: "" },
      });
    } else console.warn(`${type} 타입 블록 추가 미지원`);
    setShowBlockMenu(false);
  };

  const renderUploadStatus = () => {
    switch (uploadStatus) {
      case "uploading":
        return (
          <div className={`${styles.uploadStatus} ${styles.loading}`}>
            <span className={styles.spinner}></span>
            <span>업로드 중...</span>
          </div>
        );
      case "success":
        return (
          <div className={`${styles.uploadStatus} ${styles.success}`}>
            <span>✓</span>
            <span>업로드 완료</span>
          </div>
        );
      case "error":
        return (
          <div className={`${styles.uploadStatus} ${styles.error}`}>
            <span>✕</span>
            <span>업로드 실패</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoadingBlocks && !isDefaultBlockCheckDone) {
    // 초기 로딩 및 기본 블록 생성 전까지 로딩 표시
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>정보 구성 중...</p>
      </div>
    );
  }
  if (errorBlocks)
    return (
      <div className={styles.errorContainer}>
        <p>오류: {errorBlocks}</p>
        <button onClick={() => fetchBlocksByNote(noteId)}>재시도</button>
      </div>
    );

  return (
    <div className={styles.editorWrapper}>
      <form
        className={styles.characterForm}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={styles.TitleformSection}>
          <input
            type="text"
            className={styles.titleInput}
            value={characterTitle}
            onChange={handleCharacterTitleChange}
            placeholder="캐릭터 이름"
          />
          <div className={styles.gradientline}></div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>외모</h2>
          <div className={styles.appearanceSection}>
            <div className={styles.imageUploadContainer}>
              <div
                className={`${styles.imagePreviewArea} ${
                  isDragging ? styles.dragOver : ""
                }`}
                onClick={handleImageAreaClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {currentImageUrl && !imageError ? (
                  <Image
                    key={currentImageUrl}
                    src={currentImageUrl}
                    alt="캐릭터 이미지"
                    layout="fill"
                    objectFit="cover"
                    className={styles.imagePreview}
                    onError={() => setImageError(true)}
                    unoptimized={
                      currentImageUrl.startsWith("data:") ||
                      currentImageUrl.startsWith("http")
                    }
                  />
                ) : (
                  <>
                    <span className={styles.uploadIcon}>📁</span>
                    <p className={styles.uploadText}>
                      {imageError ? "이미지 로드 실패" : "이미지 업로드"}
                    </p>
                    <button type="button" className={styles.uploadButton}>
                      파일 선택
                    </button>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.uploadInput}
                  onChange={handleFileSelect}
                />
              </div>
              {uploadStatus === "uploading" && (
                <div className={styles.uploadProgress}>
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className={styles.progressBar}
                  ></div>
                </div>
              )}
              {renderUploadStatus()}
            </div>
            <div className={styles.descriptionContainer}>
              <textarea
                className={styles.descriptionTextarea}
                value={appearance}
                onChange={handleAppearanceInputChange}
                placeholder="캐릭터의 외모 설명"
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}></h2>
          <div className={styles.textSection}>
            <div className={styles.textBlockContainer}>
              <div className={styles.textBlockHeader}>
                <h3 className={styles.textBlockTitle}>텍스트</h3>
              </div>
              <textarea
                className={styles.infoTextarea}
                value={basicInfo}
                onChange={handleBasicInfoInputChange}
                placeholder="캐릭터의 기본 정보"
              />
            </div>

            {additionalTextBlocks.map((block) => {
              let blockContent = "";
              if (block.properties.type === "TEXT")
                blockContent = block.properties.value;
              return (
                <div key={block.blockId} className={styles.textBlockContainer}>
                  <div className={styles.textBlockHeader}>
                    {editingBlockTitleId === block.blockId ? (
                      <input
                        type="text"
                        className={styles.textBlockTitleInput}
                        value={editingBlockTitleValue}
                        onChange={handleEditingBlockTitleChange}
                        onBlur={() =>
                          handleSaveBlockTitleEditOnBlur(block.blockId)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveBlockTitleEditOnBlur(block.blockId);
                          else if (e.key === "Escape")
                            handleCancelBlockTitleEdit();
                        }}
                        autoFocus
                      />
                    ) : (
                      <h3
                        className={styles.textBlockTitle}
                        onClick={() => handleStartEditingBlockTitle(block)}
                      >
                        {block.title || "제목 없음"}
                      </h3>
                    )}
                    <button
                      onClick={() => handleDeleteAdditionalBlock(block.blockId)}
                      className={`${styles.deleteButton} ${styles.textBlockDeleteButton}`}
                      aria-label="텍스트 블록 삭제"
                      title="텍스트 블록 삭제"
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    className={styles.infoTextarea}
                    value={blockContent}
                    onChange={(e) =>
                      handleAdditionalTextBlockContentInputChange(
                        block.blockId,
                        e.target.value
                      )
                    }
                    placeholder="텍스트를 입력하세요."
                  />
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={styles.addBlockButton}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            addBlockButtonRef.current = event.currentTarget;
            setShowBlockMenu(true);
          }}
        >
          <span className={styles.addBlockIcon}>+</span>
        </button>
      </form>

      {showBlockMenu && addBlockButtonRef.current && (
        <BlockMenu
          onAddBlock={handleAddNewBlock}
          onClose={() => {
            setShowBlockMenu(false);
            addBlockButtonRef.current = null;
          }}
          buttonRef={addBlockButtonRef}
          position="top"
        />
      )}
    </div>
  );
}
