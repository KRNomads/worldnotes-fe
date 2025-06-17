// src/entities/block/model/blockStore.ts

import { create } from "zustand";
import { Block } from "../types/block";
import { sortBlocks } from "../utils/sortBlocks";

interface BlockState {
  blocksByNoteId: Record<string, Block[]>;
  setBlocks: (noteId: string, blocks: Block[]) => void;
  addBlock: (noteId: string, block: Block) => void;
  updateBlock: (noteId: string, block: Block) => void;
  deleteBlock: (noteId: string, blockId: number) => void;
}

export const useBlockStore = create<BlockState>((set) => ({
  blocksByNoteId: {},

  setBlocks: (noteId, blocks) => {
    set((state) => ({
      blocksByNoteId: {
        ...state.blocksByNoteId,
        [noteId]: sortBlocks(blocks),
      },
    }));
  },

  addBlock: (noteId, block) =>
    set((state) => ({
      blocksByNoteId: {
        ...state.blocksByNoteId,
        [noteId]: sortBlocks([...(state.blocksByNoteId[noteId] ?? []), block]),
      },
    })),

  updateBlock: (noteId, updatedBlock) =>
    set((state) => ({
      blocksByNoteId: {
        ...state.blocksByNoteId,
        [noteId]: sortBlocks(
          (state.blocksByNoteId[noteId] ?? []).map((b) =>
            b.id === updatedBlock.id ? updatedBlock : b
          )
        ),
      },
    })),

  deleteBlock: (noteId, blockId) =>
    set((state) => ({
      blocksByNoteId: {
        ...state.blocksByNoteId,
        [noteId]: (state.blocksByNoteId[noteId] ?? []).filter(
          (b) => b.id !== blockId
        ),
      },
    })),
}));
