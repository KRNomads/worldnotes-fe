// src/entities/block/model/blockSelectors.ts

import { useMemo } from "react";
import { Block } from "../types/block";
import { useBlockStore } from "../store/blockStore";

const EMPTY_BLOCK_ARRAY: Block[] = [];

export function useBlocks(noteId: string): Block[] {
  return useBlockStore((state) => {
    const blocks = state.blocksByNoteId;
    if (!blocks.hasOwnProperty(noteId)) return EMPTY_BLOCK_ARRAY;
    return blocks[noteId];
  });
}

export function useDefaultBlocks(noteId: string): Block[] {
  const blocks = useBlocks(noteId);
  return useMemo(() => blocks.filter((b) => b.fieldKey !== null), [blocks]);
}

export function useCustomBlocks(noteId: string): Block[] {
  const blocks = useBlocks(noteId);
  return useMemo(() => blocks.filter((b) => b.fieldKey === null), [blocks]);
}
