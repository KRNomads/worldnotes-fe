// src/entities/block/model/blockStore.ts

import { create } from "zustand";
import { Block } from "../types/block";
import { sortBlocks } from "../utils/sortBlocks";

interface BlocksForNote {
  defaultBlocks: Block[];
  customBlocks: Block[];
}

interface BlockState {
  blocksByNoteId: Record<string, BlocksForNote>;
  setBlocks: (noteId: string, blocks: Block[]) => void;
  updateDefaultBlock: (noteId: string, block: Block) => void;
  updateCustomBlock: (noteId: string, block: Block) => void;
}

export const useBlockStore = create<BlockState>((set) => ({
  blocksByNoteId: {},

  setBlocks: (noteId, blocks) => {
    const defaultBlocks = sortBlocks(blocks.filter((b) => b.fieldKey !== null));
    const customBlocks = sortBlocks(blocks.filter((b) => b.fieldKey === null));

    set((state) => ({
      blocksByNoteId: {
        ...state.blocksByNoteId,
        [noteId]: { defaultBlocks, customBlocks },
      },
    }));
  },

  updateDefaultBlock: (noteId, updatedBlock) =>
    set((state) => {
      const prev = state.blocksByNoteId[noteId];
      if (!prev) return state;

      const updatedDefaultBlocks = sortBlocks(
        prev.defaultBlocks.map((b) =>
          b.blockId === updatedBlock.blockId ? updatedBlock : b
        )
      );

      return {
        blocksByNoteId: {
          ...state.blocksByNoteId,
          [noteId]: {
            ...prev,
            defaultBlocks: updatedDefaultBlocks,
          },
        },
      };
    }),

  updateCustomBlock: (noteId, updatedBlock) =>
    set((state) => {
      const prev = state.blocksByNoteId[noteId];
      if (!prev) return state;

      const updatedCustomBlocks = sortBlocks(
        prev.customBlocks.map((b) =>
          b.blockId === updatedBlock.blockId ? updatedBlock : b
        )
      );

      return {
        blocksByNoteId: {
          ...state.blocksByNoteId,
          [noteId]: {
            ...prev,
            customBlocks: updatedCustomBlocks,
          },
        },
      };
    }),
}));
