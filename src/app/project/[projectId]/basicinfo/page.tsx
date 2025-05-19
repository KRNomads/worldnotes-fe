// src/app/project/[projectId]/basicinfo/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import styles from "./basicinfo.module.scss";
import Sidebar from "@/components/sidebar/sidebar";
import { useProjectStore } from "@/store/projectStore";
import { useNoteStore } from "@/store/noteStore";
import { useBlockStore } from "@/store/blockStore";
import type {
  Block,
  BlockCreateRequest,
  BlockUpdateRequest,
  TextBlockProperties,
} from "@/types/block";
import axios from "axios"; // AxiosError 타입 명시적 임포트

// 디바운스 훅 (제네릭 타입 개선 시도)
function useDebounce<TCallback extends (...args: any[]) => void>( // eslint-disable-line @typescript-eslint/no-explicit-any
  callback: TCallback,
  delay: number
): (...args: Parameters<TCallback>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedCallback = useCallback(
    (...args: Parameters<TCallback>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );
  return debouncedCallback;
}

const EMPTY_ARRAY: Block[] = [];

export default function BasicInfoPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const {
    currentProject,
    fetchProject,
    updateProject,
    isLoading: isLoadingProject,
    error: projectError,
  } = useProjectStore();

  const {
    activeProjectBasicInfoNote,
    ensureActiveProjectBasicInfoNote,
    createNote,
    isLoadingActiveProjectBasicInfoNote,
    errorActiveProjectBasicInfoNote,
  } = useNoteStore();

  const {
    fetchBlocksByNote,
    createBlock,
    updateBlock,
    isLoading: isLoadingBlocksGlobal,
    error: errorBlocksGlobal,
  } = useBlockStore();

  const [formData, setFormData] = useState({ projectTitle: "", genre: "" });
  const [isSaving, setIsSaving] = useState<"projectTitle" | "genre" | null>(
    null
  );
  const [lastSaveError, setLastSaveError] = useState<string | null>(null);
  const initialLoadTracker = useRef({
    project: false,
    note: false,
    blocksInitialFetchDone: false,
  });

  const basicInfoNoteId = activeProjectBasicInfoNote?.id;
  const currentNoteBlocks = useBlockStore((state) =>
    basicInfoNoteId
      ? state.blocksByNoteId[basicInfoNoteId] || EMPTY_ARRAY
      : EMPTY_ARRAY
  );

  // --- 데이터 로딩 useEffects (이전과 동일) ---
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
        .then(() => {
          initialLoadTracker.current.project = true;
        })
        .catch((e) => {
          console.error("Failed to fetch project", e);
          initialLoadTracker.current.project = true;
        });
    }
  }, [projectId, fetchProject]);

  useEffect(() => {
    if (projectId) {
      ensureActiveProjectBasicInfoNote(projectId).catch((e) =>
        console.error("Failed to ensure basic info note", e)
      );
    }
  }, [projectId, ensureActiveProjectBasicInfoNote]);

  useEffect(() => {
    if (activeProjectBasicInfoNote !== undefined) {
      initialLoadTracker.current.note = true;
    }
  }, [activeProjectBasicInfoNote]);

  useEffect(() => {
    if (basicInfoNoteId) {
      fetchBlocksByNote(basicInfoNoteId)
        .then(() => {
          initialLoadTracker.current.blocksInitialFetchDone = true;
        })
        .catch((e) => {
          console.error("Failed to fetch blocks for note:", basicInfoNoteId, e);
          initialLoadTracker.current.blocksInitialFetchDone = true;
        });
    } else if (
      activeProjectBasicInfoNote === null &&
      !isLoadingActiveProjectBasicInfoNote
    ) {
      initialLoadTracker.current.blocksInitialFetchDone = true;
    }
  }, [
    basicInfoNoteId,
    fetchBlocksByNote,
    activeProjectBasicInfoNote,
    isLoadingActiveProjectBasicInfoNote,
  ]);

  // --- 폼 데이터 초기화 (fieldKey 우선으로 장르 블록 식별) ---
  useEffect(() => {
    if (initialLoadTracker.current.project && currentProject) {
      setFormData((prev) => ({
        ...prev,
        projectTitle: currentProject.title || "",
      }));
    }
  }, [currentProject]);

  useEffect(() => {
    if (
      initialLoadTracker.current.note &&
      initialLoadTracker.current.blocksInitialFetchDone
    ) {
      if (basicInfoNoteId && currentNoteBlocks.length > 0) {
        const genreBlock =
          currentNoteBlocks.find(
            (b: Block) => b.fieldKey === "genre" && b.type === "TEXT"
          ) ||
          currentNoteBlocks.find(
            (b: Block) => b.title === "genre" && b.type === "TEXT"
          ); // fallback

        const genreText =
          (genreBlock?.properties as TextBlockProperties)?.value || "";
        setFormData((prev) => ({ ...prev, genre: genreText }));
      } else {
        setFormData((prev) => ({ ...prev, genre: "" }));
      }
    }
  }, [basicInfoNoteId, currentNoteBlocks]);

  const isInitialLoadComplete = () => {
    return (
      initialLoadTracker.current.project &&
      initialLoadTracker.current.note &&
      initialLoadTracker.current.blocksInitialFetchDone
    );
  };

  // --- 자동 저장 로직 (작품 제목 - 이전과 동일) ---
  const autoSaveProjectTitle = useCallback(
    async (newTitle: string) => {
      if (!isInitialLoadComplete() || !projectId || !updateProject) return;
      if (newTitle === (currentProject?.title || "")) return;

      setIsSaving("projectTitle");
      setLastSaveError(null);
      try {
        await updateProject(projectId, { title: newTitle });
        console.log("작품 제목 자동 저장 완료:", newTitle);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "알 수 없는 오류";
        console.error("작품 제목 자동 저장 실패:", error);
        setLastSaveError(`작품 제목 저장 실패: ${message}`);
      } finally {
        setIsSaving(null);
      }
    },
    [projectId, updateProject, currentProject]
  );

  const debouncedAutoSaveProjectTitle = useDebounce(autoSaveProjectTitle, 1000);

  useEffect(() => {
    if (isInitialLoadComplete()) {
      debouncedAutoSaveProjectTitle(formData.projectTitle);
    }
  }, [formData.projectTitle, debouncedAutoSaveProjectTitle]);

  // --- 자동 저장 로직 (장르 - fieldKey: "genre"로 생성) ---
  const autoSaveGenreBlock = useCallback(
    async (newGenreText: string) => {
      if (!isInitialLoadComplete() || !projectId) return;

      const genreBlockFromState = basicInfoNoteId
        ? currentNoteBlocks.find(
            (b: Block) =>
              (b.fieldKey === "genre" && b.type === "TEXT") ||
              (b.title === "genre" && b.type === "TEXT")
          )
        : undefined;
      if (
        newGenreText ===
        ((genreBlockFromState?.properties as TextBlockProperties)?.value || "")
      )
        return;

      setIsSaving("genre");
      setLastSaveError(null);
      let noteIdToUse = basicInfoNoteId;

      try {
        if (!noteIdToUse) {
          if (!createNote)
            throw new Error("createNote 함수가 정의되지 않았습니다.");
          console.log("BASIC_INFO 노트 생성 시도");
          const newNote = await createNote({
            projectId,
            title: "기본 정보",
            type: "BASIC_INFO",
          });
          if (newNote?.id) {
            noteIdToUse = newNote.id;
            console.log("BASIC_INFO 노트 생성됨, ID:", noteIdToUse);
          } else {
            throw new Error("기본 정보 노트 생성에 실패했습니다.");
          }
        }

        if (noteIdToUse) {
          const genreBlock = currentNoteBlocks.find(
            (b: Block) =>
              ((b.fieldKey === "genre" && b.type === "TEXT") ||
                (b.title === "genre" && b.type === "TEXT")) &&
              b.noteId === noteIdToUse
          );

          const newTextProperties: TextBlockProperties = {
            type: "TEXT",
            value: newGenreText,
          };

          if (genreBlock) {
            if (!updateBlock)
              throw new Error("updateBlock 함수가 정의되지 않았습니다.");
            const payloadForUpdate: BlockUpdateRequest = {
              type: genreBlock.type, // "TEXT"
              properties: newTextProperties,
              title: genreBlock.title, // 기존 title 유지 (또는 "genre"로 고정)
              // fieldKey는 BlockUpdateRequest 타입에 포함되지 않으므로 보내지 않음 (API 명세에 따름)
            };

            console.log(
              "[BasicInfoPage] 장르 업데이트 전송 직전 payload:",
              JSON.parse(JSON.stringify(payloadForUpdate))
            );
            // ... (JSON.stringify 로깅)

            await updateBlock(
              genreBlock.blockId,
              noteIdToUse,
              payloadForUpdate
            );
            console.log(
              `장르 블록(ID:${genreBlock.blockId}) 자동 업데이트 완료:`,
              newGenreText
            );
          } else {
            if (!createBlock)
              throw new Error("createBlock 함수가 정의되지 않았습니다.");

            // BlockCreateRequest의 fieldKey 타입이 string | null | undefined 를 허용하므로 "genre" 전달
            const newBlockData: BlockCreateRequest = {
              noteId: noteIdToUse,
              title: "genre", // 새 "genre" 블록의 title
              type: "TEXT",
              properties: newTextProperties,
              fieldKey: "genre", // 명시적으로 "genre" fieldKey로 생성
            };

            const createdBlock = await createBlock(newBlockData);
            if (!createdBlock)
              throw new Error("장르 블록 생성 API 호출 실패 (반환값 없음).");
            console.log(
              `장르 블록 자동 생성 완료 (ID:${createdBlock.blockId}):`,
              newGenreText
            );
          }
        }
      } catch (error: unknown) {
        // any 대신 unknown 사용
        const message =
          error instanceof Error ? error.message : "알 수 없는 오류";
        console.error("장르 정보 자동 저장 실패:", error);
        let serverResponseMessage = "";
        if (axios.isAxiosError(error) && error.response?.data) {
          const responseData = error.response.data;
          // 서버 응답 데이터가 객체이고 특정 속성을 가지고 있는지 더 안전하게 확인
          if (responseData && typeof responseData === "object") {
            if (
              "message" in responseData &&
              typeof responseData.message === "string"
            ) {
              serverResponseMessage = responseData.message;
            } else if (
              "error" in responseData &&
              typeof responseData.error === "string"
            ) {
              serverResponseMessage = responseData.error;
            }
          }
          if (!serverResponseMessage && responseData) {
            try {
              // JSON.stringify도 실패할 수 있으므로 try-catch
              serverResponseMessage = JSON.stringify(responseData);
            } catch (err) {
              serverResponseMessage =
                "서버 응답을 문자열로 변환하는데 실패했습니다.";
            }
          }
        }
        setLastSaveError(
          `장르 정보 저장 실패: ${serverResponseMessage || message}`
        );
      } finally {
        setIsSaving(null);
      }
    },
    [
      projectId,
      basicInfoNoteId,
      currentNoteBlocks,
      createNote,
      updateBlock,
      createBlock,
    ]
  );

  const debouncedAutoSaveGenreBlock = useDebounce(autoSaveGenreBlock, 1000);

  useEffect(() => {
    if (isInitialLoadComplete()) {
      debouncedAutoSaveGenreBlock(formData.genre);
    }
  }, [formData.genre, debouncedAutoSaveGenreBlock]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isPageStillInitializing = !(
    initialLoadTracker.current.project &&
    initialLoadTracker.current.note &&
    initialLoadTracker.current.blocksInitialFetchDone
  );
  const pageDataLoadingError =
    projectError || errorActiveProjectBasicInfoNote || errorBlocksGlobal;
  const displayError = pageDataLoadingError || lastSaveError;

  if (
    isPageStillInitializing &&
    (isLoadingProject ||
      isLoadingActiveProjectBasicInfoNote ||
      (basicInfoNoteId &&
        isLoadingBlocksGlobal &&
        !initialLoadTracker.current.blocksInitialFetchDone))
  ) {
    return (
      <div className={styles.loadingContainer}>
        <p>기본 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (displayError && !isSaving) {
    return (
      <div className={styles.errorContainer}>
        <p>오류가 발생했습니다:</p>
        {projectError && <p>- 프로젝트 정보 로드: {projectError}</p>}
        {errorActiveProjectBasicInfoNote && (
          <p>- 기본 노트 정보 로드: {errorActiveProjectBasicInfoNote}</p>
        )}
        {errorBlocksGlobal && !lastSaveError && (
          <p>- 세부 항목 로드: {errorBlocksGlobal}</p>
        )}
        {lastSaveError && (
          <p className={styles.saveErrorFeedback}>{lastSaveError}</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Sidebar
        activeItem="basicinfo"
        isProjectSidebar={true}
        projectId={projectId}
      />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>기본정보</h1>
          <div className={styles.saveStatus}>
            {isSaving && (
              <span className={styles.savingIndicator}>
                {isSaving === "projectTitle" ? "제목" : "장르"} 저장 중...
              </span>
            )}
          </div>
        </div>

        <form
          className={styles.formContainer}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.formField}>
            <label htmlFor="projectTitle" className={styles.fieldLabel}>
              작품 제목
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                placeholder="작품 제목을 입력하세요"
                className={styles.inputField}
                disabled={isSaving === "projectTitle"}
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="genre" className={styles.fieldLabel}>
              장르
            </label>
            <div className={styles.inputContainer}>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                placeholder="장르를 입력하세요 (판타지, SF, 로맨스 등)"
                className={styles.inputField}
                disabled={isSaving === "genre"}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
