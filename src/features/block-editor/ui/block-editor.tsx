// src/features/block-editor/ui/block-editor.tsx

"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { produce } from "immer";
import { PlusCircle, Type } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useBlockStore } from "@/entities/block/store/blockStore";
import { useNoteStore } from "@/entities/note/store/noteStore";
import {
  Block,
  BlockCreateRequest,
  BlockType,
} from "@/entities/block/types/block";
import { debounce } from "lodash";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";
import { getDefaultProperties } from "@/shared/utils/blockUtils";
import { BlockContainer } from "@/features/block-editor/ui/block-container";
import { EditorTagSection } from "./editor-tag-section";
import styles from "@/features/block-editor/ui/block-editor.module.scss";

const DEBOUNCE_DELAY = 1000;

interface BlockEditorProps {
  noteId: string;
  placeholder?: string;
  renderDefaultBlocks?: (
    defaultBlocks: Block[],
    onPropChange: (id: number, path: (string | number)[], value: string) => void
  ) => React.ReactNode;
}

export default function BlockEditor({
  noteId,
  placeholder,
  renderDefaultBlocks,
}: BlockEditorProps) {
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
    deleteBlock,
  } = useBlockStore();

  const [noteTitle, setNoteTitle] = useState("");
  const [defaultBlocks, setDefaultBlocks] = useState<Block[]>([]);
  const [customBlocks, setCustomBlocks] = useState<Block[]>([]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const currentNoteDetails =
    activeNoteFromNoteStore?.id === noteId
      ? activeNoteFromNoteStore
      : notes.find((note) => note.id === noteId);

  // ==== 공통 블록 새로고침 ====
  const refreshBlocks = useCallback(() => {
    setDefaultBlocks(getDefaultBlocks(noteId));
    setCustomBlocks(getCustomBlocks(noteId));
  }, [noteId, getDefaultBlocks, getCustomBlocks]);

  // ==== 디바운스된 자동저장 ====
  const autosaveNoteTitle = useRef(
    debounce(async (newTitle: string) => {
      if (currentNoteDetails && newTitle !== currentNoteDetails.title) {
        await updateNote(noteId, { title: newTitle });
      }
    }, DEBOUNCE_DELAY)
  ).current;

  const autosaveBlockTitle = useRef(
    debounce(async (id: number, newTitle: string) => {
      const updated = await updateBlockTitle(id, noteId, newTitle);
      if (updated) refreshBlocks();
    }, DEBOUNCE_DELAY)
  ).current;

  const autosaveBlockProperties = useRef(
    debounce(async (id, path, value) => {
      const latestBlocks = getBlocksForNote(noteId);
      const updatedBlock = latestBlocks.find((b) => b.blockId === id);
      if (!updatedBlock) return;

      const updatedProperties = produce(updatedBlock.properties, (draft) => {
        let curr: any = draft;
        for (let i = 0; i < path.length - 1; i++) {
          curr = curr[path[i]];
        }
        curr[path[path.length - 1]] = value;
      });

      const updated = await updateBlockProperties(
        id,
        noteId,
        updatedBlock.type,
        updatedProperties
      );
      if (updated) refreshBlocks();
    }, DEBOUNCE_DELAY)
  ).current;

  // ==== 핸들러 ====
  const handleNoteTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setNoteTitle(newTitle);
    autosaveNoteTitle(newTitle);
  };

  const handleUpdateBlockTitle = (id: number, newTitle: string) => {
    setCustomBlocks((prev) =>
      prev.map((b) => (b.blockId === id ? { ...b, title: newTitle } : b))
    );
    autosaveBlockTitle(id, newTitle);
  };

  const handleUpdateBlockProperties = (
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

    autosaveBlockProperties(id, path, value);
  };

  const handleAddBlock = async (type: BlockType) => {
    const newBlockData: BlockCreateRequest = {
      noteId,
      title: "새 블럭",
      type,
      properties: getDefaultProperties(type),
    };
    const createdBlock = await createBlock(newBlockData);
    if (createdBlock) refreshBlocks();
  };

  const handleDeleteBlock = async (id: number) => {
    const success = await deleteBlock(id, noteId);
    if (success) refreshBlocks();
  };

  const handleToggleCollapse = (id: number) => {
    setCustomBlocks((prev) =>
      prev.map((b) =>
        b.blockId === id ? { ...b, isCollapsed: !b.isCollapsed } : b
      )
    );
  };

  const handleDragStart = (id: number) => setIsDragging(id);
  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = (targetId: number) => {
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
  };

  // ==== 초기 데이터 로드 ====
  useEffect(() => {
    if (noteId) fetchBlocksByNote(noteId);
  }, [noteId, fetchBlocksByNote]);

  useEffect(() => {
    if (currentNoteDetails?.title) {
      setNoteTitle(currentNoteDetails.title);
    }
  }, [currentNoteDetails]);

  useEffect(() => {
    if (noteId && !isLoadingBlocks && hasBlocksForNote(noteId)) {
      refreshBlocks();
    }
  }, [noteId, isLoadingBlocks, hasBlocksForNote, refreshBlocks]);

  // ==== 로딩 처리 ====
  if (isLoadingBlocks) {
    return (
      <div className="p-4 text-center">
        <LoadingSpinner />
        <p>정보 구성 중...</p>
      </div>
    );
  }

  if (errorBlocks) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>오류: {errorBlocks}</p>
        <button onClick={() => fetchBlocksByNote(noteId)}>재시도</button>
      </div>
    );
  }

  // ==== UI ====
  return (
    <div>
      {/* 노트 Title */}
      <div className={styles.TitleformSection}>
        <input
          type="text"
          className={styles.titleInput}
          value={noteTitle}
          onChange={handleNoteTitleChange}
          placeholder={placeholder ?? ""}
        />
        <div className={styles.gradientline}></div>
      </div>

      <EditorTagSection />

      {/* 기본 블록 */}
      {renderDefaultBlocks &&
        renderDefaultBlocks(defaultBlocks, (id, path, value) =>
          handleUpdateBlockProperties(id, path, value, true)
        )}

      {/* 커스텀 블록 */}
      <div className="space-y-6">
        {customBlocks.map((block) => (
          <BlockContainer
            key={block.blockId}
            block={block}
            isDragging={isDragging}
            dragOverId={dragOverId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={() => {
              setIsDragging(null);
              setDragOverId(null);
            }}
            onToggleCollapse={handleToggleCollapse}
            onDeleteBlock={handleDeleteBlock}
            onUpdateBlockTitle={handleUpdateBlockTitle}
            onPropChange={(id, path, value) =>
              handleUpdateBlockProperties(id, path, value, false)
            }
          />
        ))}
      </div>

      {/* 블록 추가 버튼 */}
      <div className="mt-8 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-dashed border-muted-foreground/50 bg-background/50 hover:bg-muted/50 hover:border-muted-foreground transition-all duration-200 rounded-full px-4 shadow-sm"
            >
              <PlusCircle className="h-4 w-4 text-primary" />
              <span className="font-medium">블록 추가</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            side="top"
            sideOffset={6}
            className="w-56 backdrop-blur-sm bg-background/95 border-muted-foreground/20 shadow-lg rounded-lg p-2"
          >
            <DropdownMenuItem
              onClick={() => handleAddBlock("TEXT")}
              className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-primary/10 rounded-md transition-colors"
            >
              <Type className="h-4 w-4 text-primary" />
              <span>텍스트</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
