import { useCallback, Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import {
  Block,
  BlockCreateRequest,
  BlockType,
} from "@/entities/block/types/block";
import { getDefaultProperties } from "@/entities/block/lib/blockUtils";

interface UseBlockHandlersProps {
  noteId: string;
  noteTitle: string;
  setNoteTitle: Dispatch<SetStateAction<string>>;
  customBlocks: Block[];
  setCustomBlocks: Dispatch<SetStateAction<Block[]>>;
  setDefaultBlocks: Dispatch<SetStateAction<Block[]>>;
  setFocusedBlockId: Dispatch<SetStateAction<number | null>>;
  setIsDragging: Dispatch<SetStateAction<number | null>>;
  setDragOverId: Dispatch<SetStateAction<number | null>>;
  isDragging: number | null;
  debouncedSave: {
    noteTitle: (newTitle: string) => void;
    blockTitle: (id: number, newTitle: string) => void;
    blockProperties: (
      id: number,
      path: (string | number)[],
      value: any
    ) => void;
  };
  syncBlocksFromStore: () => void;
  createBlock: (data: BlockCreateRequest) => Promise<Block | null>;
  deleteBlock: (id: number, noteId: string) => Promise<boolean>;
  updateBlockIsCollapsed: (
    id: number,
    noteId: string,
    isCollapsed: boolean
  ) => Promise<Block | null>;
  updateBlockInStore: (block: Block) => void;
}

export const useBlockHandlers = ({
  noteId,
  setNoteTitle,
  customBlocks,
  setCustomBlocks,
  setDefaultBlocks,
  setFocusedBlockId,
  setIsDragging,
  setDragOverId,
  isDragging,
  debouncedSave,
  syncBlocksFromStore,
  createBlock,
  deleteBlock,
  updateBlockIsCollapsed,
  updateBlockInStore,
}: UseBlockHandlersProps) => {
  const handleNoteTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setNoteTitle(newTitle);
      debouncedSave.noteTitle(newTitle);
    },
    [setNoteTitle, debouncedSave.noteTitle]
  );

  const handleUpdateBlockTitle = useCallback(
    (id: number, newTitle: string) => {
      setCustomBlocks((prev) =>
        prev.map((b) => (b.blockId === id ? { ...b, title: newTitle } : b))
      );
      debouncedSave.blockTitle(id, newTitle);
    },
    [setCustomBlocks, debouncedSave.blockTitle]
  );

  const handleUpdateBlockProperties = useCallback(
    (
      id: number,
      path: (string | number)[],
      value: string,
      isDefaultBlock: boolean
    ) => {
      const updater = isDefaultBlock ? setDefaultBlocks : setCustomBlocks;

      updater((prev) =>
        produce(prev, (draft) => {
          const block = draft.find((b) => b.blockId === id);
          if (!block) return;

          let curr: any = block.properties;
          for (let i = 0; i < path.length - 1; i++) {
            curr = curr[path[i]];
          }
          curr[path[path.length - 1]] = value;
        })
      );

      debouncedSave.blockProperties(id, path, value);
    },
    [setDefaultBlocks, setCustomBlocks, debouncedSave.blockProperties]
  );

  const handleAddBlock = useCallback(
    async (type: BlockType) => {
      const newBlockData = {
        noteId,
        title: "새 블럭",
        type,
        properties: getDefaultProperties(type),
      };

      try {
        const createdBlock = await createBlock(newBlockData);
        if (createdBlock) {
          setCustomBlocks((prev) => [...prev, createdBlock]);
          setTimeout(() => setFocusedBlockId(createdBlock.blockId), 0);
        }
      } catch (error) {
        console.error("블록 생성 실패:", error);
      }
    },
    [noteId, createBlock, setCustomBlocks, setFocusedBlockId]
  );

  const handleDeleteBlock = useCallback(
    async (id: number) => {
      setCustomBlocks((prev) => prev.filter((b) => b.blockId !== id));

      try {
        await deleteBlock(id, noteId);
      } catch (error) {
        console.error("블록 삭제 실패:", error);
        syncBlocksFromStore();
      }
    },
    [setCustomBlocks, deleteBlock, noteId, syncBlocksFromStore]
  );

  const handleToggleCollapse = useCallback(
    async (id: number) => {
      const targetBlock = customBlocks.find((b) => b.blockId === id);
      if (!targetBlock) return;

      const newIsCollapsed = !targetBlock.isCollapsed;

      setCustomBlocks((prev) =>
        prev.map((b) =>
          b.blockId === id ? { ...b, isCollapsed: newIsCollapsed } : b
        )
      );

      try {
        const updated = await updateBlockIsCollapsed(
          id,
          noteId,
          newIsCollapsed
        );
        if (updated) updateBlockInStore(updated);
      } catch (error) {
        console.error("블록 접기/펼치기 저장 실패:", error);
        syncBlocksFromStore();
      }
    },
    [
      customBlocks,
      setCustomBlocks,
      updateBlockIsCollapsed,
      noteId,
      updateBlockInStore,
      syncBlocksFromStore,
    ]
  );

  // 드래그 핸들러들
  const dragHandlers = {
    handleDragStart: useCallback(
      (id: number) => setIsDragging(id),
      [setIsDragging]
    ),
    handleDragOver: useCallback(
      (e: React.DragEvent, id: number) => {
        e.preventDefault();
        setDragOverId(id);
      },
      [setDragOverId]
    ),
    handleDrop: useCallback(
      (targetId: number) => {
        if (!isDragging || isDragging === targetId) {
          setIsDragging(null);
          setDragOverId(null);
          return;
        }

        setCustomBlocks((prev) => {
          const result = [...prev];
          const sourceIndex = result.findIndex((b) => b.blockId === isDragging);
          const targetIndex = result.findIndex((b) => b.blockId === targetId);
          if (sourceIndex === -1) return prev;

          const [removed] = result.splice(sourceIndex, 1);
          result.splice(targetIndex, 0, removed);
          return result;
        });

        setIsDragging(null);
        setDragOverId(null);
      },
      [isDragging, setIsDragging, setDragOverId, setCustomBlocks]
    ),
  };

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (e: KeyboardEvent, blockId: number) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const direction = e.key === "ArrowUp" ? -1 : 1;
        const index = customBlocks.findIndex((b) => b.blockId === blockId);
        const nextBlock = customBlocks[index + direction];
        if (nextBlock) {
          setFocusedBlockId(nextBlock.blockId);
        }
      }
    },
    [customBlocks, setFocusedBlockId]
  );

  return {
    handleNoteTitleChange,
    handleUpdateBlockTitle,
    handleUpdateBlockProperties,
    handleAddBlock,
    handleDeleteBlock,
    handleToggleCollapse,
    handleKeyDown,
    handleFocus: setFocusedBlockId,
    ...dragHandlers,
  };
};
