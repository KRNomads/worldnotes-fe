"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useBlockStore } from "@/store/blockStore";
import { useNoteStore } from "@/store/noteStore";
import type { BlockCreateRequest } from "@/types/block";
import BlockMenu from "./block-menu";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import styles from "../characters.module.scss";

interface StructuredCharacterEditorProps {
  noteId: string;
  projectId: string;
}

// 이미지 업로드 상태 타입
type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function StructuredCharacterEditor({
  noteId,
  projectId,
}: StructuredCharacterEditorProps) {
  const {
    fetchBlocksByNote,
    getBlocksForNote,
    isLoading,
    error,
    createBlock,
    updateBlock,
  } = useBlockStore();
  const { notes, updateNote } = useNoteStore();
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  // 캐릭터 정보 상태
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [appearance, setAppearance] = useState("");
  const [basicInfo, setBasicInfo] = useState("");

  // 이미지 업로드 관련 상태
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentNote = notes.find((note) => note.id === noteId);
  const blocks = getBlocksForNote(noteId);

  // 노트 데이터 로드
  useEffect(() => {
    if (noteId) {
      fetchBlocksByNote(noteId);
    }
  }, [noteId, fetchBlocksByNote]);

  // 블록 데이터로 폼 초기화
  useEffect(() => {
    if (blocks.length > 0) {
      // 제목은 노트 제목에서 가져옴
      if (currentNote) {
        setTitle(currentNote.title);
      }

      // 블록에서 데이터 추출
      blocks.forEach((block) => {
        if (block.type === "IMAGE" && block.properties.type === "IMAGE") {
          setImageUrl(block.properties.url);
        } else if (
          block.title === "외모" &&
          block.type === "TEXT" &&
          block.properties.type === "TEXT"
        ) {
          setAppearance(block.properties.value);
        } else if (
          block.title === "텍스트" &&
          block.type === "TEXT" &&
          block.properties.type === "TEXT"
        ) {
          setBasicInfo(block.properties.value);
        }
      });
    } else if (!isLoading && noteId) {
      // 기본 블록 생성
      createDefaultBlocks();
    }
  }, [blocks, currentNote, isLoading]);

  // 기본 블록 생성
  const createDefaultBlocks = async () => {
    if (!noteId) return;

    // 이미지 블록
    await createBlock({
      noteId,
      title: "이미지",
      type: "IMAGE",
      properties: {
        type: "IMAGE",
        url: "",
        caption: "",
      },
    });

    // 외모 설명 블록
    await createBlock({
      noteId,
      title: "외모",
      type: "TEXT",
      properties: {
        type: "TEXT",
        value: "",
      },
    });

    // 기본 정보 블록
    await createBlock({
      noteId,
      title: "텍스트",
      type: "TEXT",
      properties: {
        type: "TEXT",
        value: "",
      },
    });
  };

  // 제목 변경 처리
  const handleTitleChange = async () => {
    if (currentNote && title !== currentNote.title) {
      await updateNote(noteId, { title });
    }
  };

  // 이미지 URL 변경 처리
  const handleImageUrlChange = async () => {
    const imageBlock = blocks.find((block) => block.type === "IMAGE");
    if (imageBlock) {
      await updateBlock(imageBlock.blockId, noteId, {
        properties: {
          type: "IMAGE",
          url: imageUrl,
          caption: "",
        },
      });
    }
  };

  // 외모 설명 변경 처리
  const handleAppearanceChange = async () => {
    const appearanceBlock = blocks.find(
      (block) => block.title === "외모" && block.type === "TEXT"
    );
    if (appearanceBlock) {
      await updateBlock(appearanceBlock.blockId, noteId, {
        properties: {
          type: "TEXT",
          value: appearance,
        },
      });
    }
  };

  // 기본 정보 변경 처리
  const handleBasicInfoChange = async () => {
    const infoBlock = blocks.find(
      (block) => block.title === "텍스트" && block.type === "TEXT"
    );
    if (infoBlock) {
      await updateBlock(infoBlock.blockId, noteId, {
        properties: {
          type: "TEXT",
          value: basicInfo,
        },
      });
    }
  };

  // 이미지 업로드 함수 수정
  // 실제 API 호출을 시뮬레이션하는 함수
  const simulateImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // 실제 구현에서는 여기서 서버에 이미지를 업로드하고 URL을 받아옵니다
        // 여기서는 Data URL을 반환합니다
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error("이미지 읽기 실패"));
      };
      reader.readAsDataURL(file);
    });
  };

  // 이미지 업로드 처리 함수 수정
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // 이미지 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);

    // 업로드 진행 상태를 시뮬레이션
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // 이미지 업로드 시뮬레이션
      const imageUrl = await simulateImageUpload(file);
      setImageUrl(imageUrl);

      // 이미지 블록 업데이트
      const imageBlock = blocks.find((block) => block.type === "IMAGE");
      if (imageBlock) {
        await updateBlock(imageBlock.blockId, noteId, {
          properties: {
            type: "IMAGE",
            url: imageUrl,
            caption: "",
          },
        });
      }

      setUploadProgress(100);
      setUploadStatus("success");

      // 성공 상태를 잠시 보여준 후 idle 상태로 돌아감
      setTimeout(() => {
        setUploadStatus("idle");
      }, 3000);
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      setUploadStatus("error");

      // 에러 상태를 잠시 보여준 후 idle 상태로 돌아감
      setTimeout(() => {
        setUploadStatus("idle");
      }, 3000);
    } finally {
      clearInterval(progressInterval);
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // 드래그 앤 드롭 처리
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // 이미지 영역 클릭 처리
  const handleImageAreaClick = () => {
    fileInputRef.current?.click();
  };

  // 새 블록 추가
  const handleAddBlock = async (type: "TEXT" | "TAGS" | "IMAGE") => {
    if (!noteId) return;

    let blockData: BlockCreateRequest;

    switch (type) {
      case "TEXT":
        blockData = {
          noteId,
          title: "텍스트",
          type: "TEXT",
          properties: {
            type: "TEXT",
            value: "",
          },
        };
        break;
      case "TAGS":
        blockData = {
          noteId,
          title: "태그",
          type: "TAGS",
          properties: {
            type: "TAGS",
            tags: [],
          },
        };
        break;
      case "IMAGE":
        blockData = {
          noteId,
          title: "이미지",
          type: "IMAGE",
          properties: {
            type: "IMAGE",
            url: "",
            caption: "",
          },
        };
        break;
      default:
        return;
    }

    await createBlock(blockData);
    setShowBlockMenu(false);
  };

  // 업로드 상태에 따른 UI 렌더링
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

  if (isLoading && blocks.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>캐릭터 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>오류가 발생했습니다: {error}</p>
        <button
          className={styles.retryButton}
          onClick={() => fetchBlocksByNote(noteId)}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.editorWrapper}>
      <form className={styles.characterForm}>
        {/* 제목 섹션 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>제목</h2>
          <input
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleChange}
            placeholder="캐릭터 이름"
          />
        </div>

        {/* 외모 섹션 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>외모</h2>
          <div className={styles.appearanceSection}>
            {/* 이미지 업로드 영역 */}
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
                {imageUrl ? (
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="캐릭터 이미지"
                    className={styles.imagePreview}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder.svg?height=300&width=300";
                    }}
                  />
                ) : (
                  <>
                    <span className={styles.uploadIcon}>📁</span>
                    <p className={styles.uploadText}>
                      이미지를 드래그하거나 클릭하여 업로드하세요
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
                    className={styles.progressBar}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              {renderUploadStatus()}

              <input
                type="text"
                className={styles.imageUrlInput}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onBlur={handleImageUrlChange}
                placeholder="또는 이미지 URL을 직접 입력하세요"
              />
            </div>

            {/* 외모 설명 영역 */}
            <div className={styles.descriptionContainer}>
              <textarea
                className={styles.descriptionTextarea}
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                onBlur={handleAppearanceChange}
                placeholder="캐릭터의 외모에 대한 설명을 입력하세요."
              />
            </div>
          </div>
        </div>

        {/* 텍스트 섹션 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>텍스트</h2>
          <div className={styles.textSection}>
            <textarea
              className={styles.infoTextarea}
              value={basicInfo}
              onChange={(e) => setBasicInfo(e.target.value)}
              onBlur={handleBasicInfoChange}
              placeholder="캐릭터의 기본 정보를 입력하세요."
            />
          </div>
        </div>

        {/* 블록 추가 버튼 */}
        <button
          type="button"
          className={styles.addBlockButton}
          onClick={() => setShowBlockMenu(true)}
        >
          <span className={styles.addBlockIcon}>+</span>
          블록 추가
        </button>
      </form>

      {/* 블록 추가 메뉴 */}
      {showBlockMenu && (
        <BlockMenu
          onAddBlock={handleAddBlock}
          onClose={() => setShowBlockMenu(false)}
        />
      )}
    </div>
  );
}
