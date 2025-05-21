"use client";

import { useEffect, useState, useCallback } from "react"; // useRef 제거
import { useBlockStore } from "@/store/blockStore";
import { useNoteStore } from "@/store/noteStore";
// BlockCreateRequest만 남기고 Block 타입 임포트 제거
import type { BlockCreateRequest } from "@/types/block";
import BlockComponent from "./block-component";
import BlockMenu from "./block-menu";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import styles from "../characters.module.scss";

interface CharacterEditorProps {
  noteId: string;
  projectId: string;
}

export default function CharacterEditor({
  noteId,
}: // projectId, // 현재 직접 사용 X
CharacterEditorProps) {
  const {
    fetchBlocksByNote,
    getBlocksForNote,
    isLoading: isLoadingBlocks,
    error: errorBlocks,
    createBlock,
  } = useBlockStore();

  const { notes, currentNote: activeNoteFromNoteStore } = useNoteStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuButtonRef, setAddMenuButtonRef] =
    useState<HTMLButtonElement | null>(null);
  // addMenuPositionIndex 상태 변수 제거

  const currentNoteDetails =
    activeNoteFromNoteStore?.id === noteId
      ? activeNoteFromNoteStore
      : notes.find((note) => note.id === noteId);
  const blocks = getBlocksForNote(noteId); // 반환 타입이 Block[]이므로, blocks는 Block[]로 타입 추론됨

  useEffect(() => {
    if (noteId) {
      fetchBlocksByNote(noteId);
    }
  }, [noteId, fetchBlocksByNote]);

  const addDefaultBlocksIfNeeded = useCallback(async () => {
    if (noteId && !isLoadingBlocks && blocks.length === 0) {
      const defaultBlocksData: BlockCreateRequest[] = [
        {
          noteId,
          title: "캐릭터 이름",
          type: "TEXT",
          properties: { type: "TEXT", value: currentNoteDetails?.title || "" },
        },
        {
          noteId,
          title: "캐릭터 설명",
          type: "TEXT",
          properties: { type: "TEXT", value: "" },
        },
        {
          noteId,
          title: "특성",
          type: "TAGS",
          properties: { type: "TAGS", tags: [] },
        },
      ];
      // 여러 블록 동시 생성 API가 있다면 사용, 여기서는 개별 생성으로 가정
      // 또는 createBlocks 스토어 함수가 있다면 그것을 사용
      for (const blockData of defaultBlocksData) {
        await createBlock(blockData);
      }
      // 필요시 fetchBlocksByNote(noteId); // 스토어가 즉시 업데이트하면 불필요
    }
  }, [noteId, isLoadingBlocks, blocks, createBlock, currentNoteDetails]);

  useEffect(() => {
    // noteId, blocks, isLoadingBlocks, currentNoteDetails가 준비된 후 기본 블록 생성 로직 실행
    if (noteId && currentNoteDetails) {
      // currentNoteDetails도 확인하여 title을 안전하게 참조
      addDefaultBlocksIfNeeded();
    }
  }, [
    noteId,
    blocks,
    isLoadingBlocks,
    currentNoteDetails,
    addDefaultBlocksIfNeeded,
  ]);

  const handleAddBlock = async (type: "TEXT" | "TAGS" | "IMAGE") => {
    if (!noteId) return;

    let newBlockData: BlockCreateRequest;
    const title =
      type === "TEXT" ? "새 텍스트" : type === "TAGS" ? "태그" : "이미지";

    switch (type) {
      case "TEXT":
        newBlockData = {
          noteId,
          title,
          type: "TEXT",
          properties: { type: "TEXT", value: "" },
        };
        break;
      case "TAGS":
        newBlockData = {
          noteId,
          title,
          type: "TAGS",
          properties: { type: "TAGS", tags: [] },
        };
        break;
      case "IMAGE":
        newBlockData = {
          noteId,
          title,
          type: "IMAGE",
          properties: { type: "IMAGE", url: "", caption: "" },
        };
        break;
      default:
        return;
    }
    await createBlock(newBlockData);
    setShowAddMenu(false);
    setAddMenuButtonRef(null);
    // setAddMenuPositionIndex(null); // 제거됨
  };

  const handleShowAddMenu = (
    buttonElement: HTMLButtonElement
    // indexForInsertion 제거 (사용되지 않음)
  ) => {
    setAddMenuButtonRef(buttonElement);
    // setAddMenuPositionIndex(indexForInsertion); // 제거됨
    setShowAddMenu(true);
  };

  if (isLoadingBlocks && blocks.length === 0 && !currentNoteDetails) {
    // currentNoteDetails 확인 추가
    return (
      <div className={styles.loadingContainer}>
        {" "}
        <LoadingSpinner /> <p>블록을 불러오는 중...</p>{" "}
      </div>
    );
  }
  if (errorBlocks) {
    return (
      <div className={styles.errorContainer}>
        {" "}
        <p>오류가 발생했습니다: {errorBlocks}</p>{" "}
        <button
          className={styles.retryButton}
          onClick={() => fetchBlocksByNote(noteId)}
        >
          {" "}
          다시 시도{" "}
        </button>{" "}
      </div>
    );
  }

  return (
    <div className={styles.editorWrapper}>
      {/* 캐릭터 에디터 제목은 currentNoteDetails에서 가져올 수 있습니다.
          예: <h1 className={styles.characterTitle}>{currentNoteDetails?.title || "캐릭터"}</h1> 
          요청하신 UI/UX 변경 없음 원칙에 따라 원본에 해당 JSX가 없었다면 추가하지 않습니다.
      */}
      <div className={styles.blocksContainer}>
        {blocks.map(
          (
            block,
            index // block의 타입은 Block[]에서 추론된 Block
          ) => (
            <div
              key={block.blockId || `block-${index}-${new Date().getTime()}`}
              className={styles.blockWrapper}
            >
              {" "}
              {/* key 안정성 향상 */}
              <BlockComponent block={block} noteId={noteId} />
              <button
                className={styles.addBlockButton}
                onClick={(e) =>
                  handleShowAddMenu(e.currentTarget /*, index + 1*/)
                } // index + 1 제거
                aria-label="이 위치에 블록 추가"
              >
                +
              </button>
            </div>
          )
        )}

        {blocks.length === 0 && !isLoadingBlocks && (
          <div className={styles.emptyBlocksMessage}>
            <p>블록이 없습니다. 첫 블록을 추가해보세요.</p>
            <button
              className={styles.addFirstBlockButton}
              onClick={(e) => {
                // 첫 블록 추가 시, 버튼 ref를 설정하고 메뉴를 표시
                // handleShowAddMenu의 두 번째 인자였던 index는 이제 사용하지 않음
                const buttonElem = e.currentTarget;
                setAddMenuButtonRef(buttonElem);
                setShowAddMenu(true);
              }}
            >
              텍스트 블록 추가{" "}
              {/* 기본적으로 텍스트 블록 추가, 다른 타입은 BlockMenu에서 선택 */}
            </button>
          </div>
        )}
        {blocks.length > 0 && ( // 블록이 있을 때만 맨 아래 추가 버튼 표시
          <button
            style={{ display: "block", margin: "10px auto" }}
            className={styles.addBlockButton}
            onClick={(e) =>
              handleShowAddMenu(e.currentTarget /*, blocks.length*/)
            } // blocks.length 제거
            aria-label="가장 마지막에 블록 추가"
          >
            +
          </button>
        )}
      </div>

      {showAddMenu && addMenuButtonRef && (
        <BlockMenu
          onAddBlock={(type) => {
            handleAddBlock(type);
          }}
          onClose={() => {
            setShowAddMenu(false);
            setAddMenuButtonRef(null);
          }}
          buttonRef={{ current: addMenuButtonRef }}
          position="bottom"
        />
      )}
    </div>
  );
}
