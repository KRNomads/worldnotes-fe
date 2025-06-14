// src/features/block-editor/hooks/useBlockEditor.ts
import { useCallback, useRef, useState } from "react";
import { produce } from "immer";
import { debounce } from "lodash";
import { useBlockStore } from "@/entities/block/store/blockStore";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { Block } from "@/entities/block/types/block";

const DEBOUNCE_DELAY = 500;

export const useBlockEditor = (noteId: string) => {
  const {
    notes,
    updateNote,
    currentNote: activeNoteFromNoteStore,
  } = useNoteStore();

  const {
    isLoading: isLoadingBlocks,
    error: errorBlocks,
    fetchBlocksByNote,
    hasBlocksForNote,
    getBlocksForNote,
    getDefaultBlocks,
    getCustomBlocks,
    createBlock,
    updateBlockTitle,
    updateBlockProperties,
    updateBlockIsCollapsed,
    deleteBlock,
    updateBlockInStore,
  } = useBlockStore();

  // 상태들
  const [noteTitle, setNoteTitle] = useState("");
  const [defaultBlocks, setDefaultBlocks] = useState<Block[]>([]);
  const [customBlocks, setCustomBlocks] = useState<Block[]>([]);

  const currentNoteDetails =
    activeNoteFromNoteStore?.id === noteId
      ? activeNoteFromNoteStore
      : notes.find((note) => note.id === noteId);

  // 메모이제이션된 동기화 함수
  const syncBlocksFromStore = useCallback(() => {
    if (!hasBlocksForNote(noteId)) return;

    const storeDefaultBlocks = getDefaultBlocks(noteId);
    const storeCustomBlocks = getCustomBlocks(noteId);

    setDefaultBlocks((prev) =>
      JSON.stringify(prev) === JSON.stringify(storeDefaultBlocks)
        ? prev
        : storeDefaultBlocks
    );

    setCustomBlocks((prev) =>
      JSON.stringify(prev) === JSON.stringify(storeCustomBlocks)
        ? prev
        : storeCustomBlocks
    );
  }, [noteId, hasBlocksForNote, getDefaultBlocks, getCustomBlocks]);

  // 디바운스된 함수들을 useMemo로 메모이제이션
  const debouncedSave = {
    noteTitle: useRef(
      debounce(async (newTitle: string) => {
        if (currentNoteDetails && newTitle !== currentNoteDetails.title) {
          await updateNote(noteId, { title: newTitle });
        }
      }, DEBOUNCE_DELAY)
    ).current,

    blockTitle: useRef(
      debounce(async (id: number, newTitle: string) => {
        try {
          const updated = await updateBlockTitle(id, noteId, newTitle);
          if (updated) updateBlockInStore(updated);
        } catch (error) {
          console.error("블록 제목 저장 실패:", error);
          syncBlocksFromStore();
        }
      }, DEBOUNCE_DELAY)
    ).current,

    blockProperties: useRef(
      debounce(async (id: number, path: (string | number)[], value: any) => {
        try {
          const latestBlocks = getBlocksForNote(noteId);
          const updatedBlock = latestBlocks.find((b) => b.blockId === id);
          if (!updatedBlock) return;

          const updatedProperties = produce(
            updatedBlock.properties,
            (draft) => {
              let curr: any = draft;
              for (let i = 0; i < path.length - 1; i++) {
                curr = curr[path[i]];
              }
              curr[path[path.length - 1]] = value;
            }
          );

          const updated = await updateBlockProperties(
            id,
            updatedBlock.type,
            updatedProperties
          );
          if (updated) updateBlockInStore(updated);
        } catch (error) {
          console.error("블록 속성 저장 실패:", error);
          syncBlocksFromStore();
        }
      }, DEBOUNCE_DELAY)
    ).current,
  };

  return {
    // 상태
    noteTitle,
    defaultBlocks,
    setDefaultBlocks,
    customBlocks,
    setCustomBlocks,
    hasInitialLoad,
    setHasInitialLoad,

    // 계산된 값들
    currentNoteDetails,
    isLoadingBlocks,
    errorBlocks,

    // 함수들
    syncBlocksFromStore,
    debouncedSave,
    fetchBlocksByNote,
    hasBlocksForNote,
    createBlock,
    deleteBlock,
    updateBlockIsCollapsed,
    updateBlockInStore,
  };
};
