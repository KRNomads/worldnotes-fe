// src/entities/block/model/blockStore.ts
import { create } from "zustand";
import { mapBlockResponseToBlock } from "@/entities/block/lib/mappers";
import { blockApi } from "../api/blockApi";
import {
  Block,
  BlockCreateRequest,
  BlockPropertiesUnion,
  BlocksCreateRequest,
  BlockType,
  BlockUpdateRequest,
} from "../types/block";

interface BlockState {
  blocksByNoteId: Record<string, Block[]>;
  isLoading: boolean;
  error: string | null;

  fetchBlocksByNote: (noteId: string) => Promise<void>;
  hasBlocksForNote: (noteId: string) => boolean;
  createBlock: (data: BlockCreateRequest) => Promise<Block | null>;
  createBlocks: (data: BlocksCreateRequest) => Promise<Block[] | null>;
  updateBlock: (
    blockId: number,
    noteId: string,
    data: Partial<BlockUpdateRequest>
  ) => Promise<Block | null>;
  updateBlockTitle: (
    blockId: number,
    noteId: string,
    title: string
  ) => Promise<Block | null>;
  updateBlockProperties: (
    blockId: number,
    noteId: string,
    type: BlockType,
    properties: BlockPropertiesUnion
  ) => Promise<Block | null>;
  updateBlockIsCollapsed: (
    blockId: number,
    noteId: string,
    isCollapsed: boolean
  ) => Promise<Block | null>;
  deleteBlock: (blockId: number, noteId: string) => Promise<boolean>;
  getBlocksForNote: (noteId: string) => Block[];
  getBlockById: (noteId: string, blockId: number) => Block | undefined;
  getDefaultBlocks: (noteId: string) => Block[];
  getCustomBlocks: (noteId: string) => Block[];
  clearBlocksForNote: (noteId: string) => void;
  clearAllBlocks: () => void;

  createBlockInStore: (block: Block) => void;
  updateBlockInStore: (block: Block) => void;
  deleteBlockInStore: (blockId: number, noteId: string) => void;
}

const sortBlocksByPosition = (blocks: Block[]): Block[] =>
  [...blocks].sort((a, b) => a.position - b.position);

export const useBlockStore = create<BlockState>((set, get) => ({
  blocksByNoteId: {},
  isLoading: false,
  error: null,

  fetchBlocksByNote: async (noteId) => {
    if (!noteId || noteId === "undefined") {
      set((state) => ({
        blocksByNoteId: { ...state.blocksByNoteId, [noteId]: [] },
        isLoading: false,
        error: "유효하지 않은 노트 ID로 블록 조회 시도",
      }));
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const data = await blockApi.fetchBlocksByNote(noteId);
      const fetchedBlocks: Block[] = data.map(mapBlockResponseToBlock);
      set((state) => ({
        blocksByNoteId: {
          ...state.blocksByNoteId,
          [noteId]: sortBlocksByPosition(fetchedBlocks),
        },
        isLoading: false,
      }));
    } catch (err: any) {
      console.error(
        `[BlockStore] fetchBlocksByNote FAILED for noteId (${noteId}):`,
        err.message
      );
      set({
        error: `노트 (${noteId})의 블록 목록 로딩 실패.`,
        isLoading: false,
      });
    }
  },

  hasBlocksForNote: (noteId) => {
    const blocks = get().blocksByNoteId[noteId];
    return Array.isArray(blocks) && blocks.length > 0;
  },

  createBlock: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await blockApi.createBlock(data);
      const newBlock = mapBlockResponseToBlock(response);
      set((state) => {
        const currentBlocks = state.blocksByNoteId[data.noteId] || [];
        const updatedBlocks = sortBlocksByPosition([
          ...currentBlocks,
          newBlock,
        ]);
        return {
          blocksByNoteId: {
            ...state.blocksByNoteId,
            [data.noteId]: updatedBlocks,
          },
          isLoading: false,
        };
      });
      return newBlock;
    } catch (err: any) {
      console.error("[BlockStore] createBlock FAILED:", err.message);
      set({ error: "블록 생성 실패.", isLoading: false });
      return null;
    }
  },

  createBlocks: async (data) => {
    if (!data.blocks || data.blocks.length === 0) return null;
    const noteId = data.blocks[0].noteId;
    set({ isLoading: true, error: null });
    try {
      const response = await blockApi.createBlocks(data);
      const newBlocks: Block[] = response.map(mapBlockResponseToBlock);
      set((state) => {
        const currentBlocks = state.blocksByNoteId[noteId] || [];
        const updatedBlocks = sortBlocksByPosition([
          ...currentBlocks,
          ...newBlocks,
        ]);
        return {
          blocksByNoteId: { ...state.blocksByNoteId, [noteId]: updatedBlocks },
          isLoading: false,
        };
      });
      return newBlocks;
    } catch (err: any) {
      console.error(
        `[BlockStore] createBlocks FAILED for noteId (${noteId}):`,
        err.message
      );
      set({ error: `노트 (${noteId}) 여러 블록 생성 실패.`, isLoading: false });
      return null;
    }
  },

  updateBlock: async (blockId, noteId, data) => {
    if (Object.keys(data).length === 0) {
      const currentBlock = get().getBlockById(noteId, blockId);
      return currentBlock || null;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await blockApi.updateBlock(blockId, data);
      const updatedBlock = mapBlockResponseToBlock(response);
      set((state) => {
        const currentBlocks = state.blocksByNoteId[noteId] || [];
        const newBlocks = currentBlocks.map((block) =>
          block.blockId === blockId ? updatedBlock : block
        );
        return {
          blocksByNoteId: {
            ...state.blocksByNoteId,
            [noteId]: sortBlocksByPosition(newBlocks),
          },
          isLoading: false,
        };
      });
      return updatedBlock;
    } catch (err: any) {
      console.error(
        `[BlockStore updateBlock] FAILED for blockId: ${blockId}`,
        err.message
      );
      set({ error: "블록 업데이트 실패: " + err.message, isLoading: false });
      return null;
    }
  },

  updateBlockTitle: (blockId, noteId, title) =>
    get().updateBlock(blockId, noteId, { title }),

  updateBlockProperties: (blockId, noteId, type, properties) =>
    get().updateBlock(blockId, noteId, { type, properties }),

  updateBlockIsCollapsed: (blockId, noteId, isCollapsed) =>
    get().updateBlock(blockId, noteId, { isCollapsed }),

  deleteBlock: async (blockId, noteId) => {
    set({ isLoading: true, error: null });
    try {
      await blockApi.deleteBlock(blockId);
      set((state) => {
        const currentBlocks = state.blocksByNoteId[noteId] || [];
        const newBlocks = currentBlocks.filter((b) => b.blockId !== blockId);
        return {
          blocksByNoteId: {
            ...state.blocksByNoteId,
            [noteId]: sortBlocksByPosition(newBlocks),
          },
          isLoading: false,
        };
      });
      return true;
    } catch (err: any) {
      console.error(
        `[BlockStore] deleteBlock FAILED for blockId (${blockId}):`,
        err.message
      );
      set({ error: `블록 (ID: ${blockId}) 삭제 실패.`, isLoading: false });
      return false;
    }
  },

  getBlocksForNote: (noteId) => get().blocksByNoteId[noteId] || [],
  getBlockById: (noteId, blockId) => {
    const blocksForNote = get().blocksByNoteId[noteId] || [];
    return blocksForNote.find((b) => b.blockId === blockId);
  },
  getDefaultBlocks: (noteId) =>
    (get().blocksByNoteId[noteId] || []).filter(
      (b) => b.fieldKey !== null && b.fieldKey !== undefined
    ),
  getCustomBlocks: (noteId) =>
    (get().blocksByNoteId[noteId] || [])
      .filter((b) => b.fieldKey === null || b.fieldKey === undefined)
      .sort((a, b) => a.position - b.position),

  clearBlocksForNote: (noteId) => {
    set((state) => {
      const newBlocksByNoteId = { ...state.blocksByNoteId };
      delete newBlocksByNoteId[noteId];
      return { blocksByNoteId: newBlocksByNoteId };
    });
  },
  clearAllBlocks: () =>
    set({ blocksByNoteId: {}, isLoading: false, error: null }),

  createBlockInStore: (block) => {
    set((state) => {
      const currentBlocks = state.blocksByNoteId[block.noteId] || [];
      const updatedBlocks = sortBlocksByPosition([...currentBlocks, block]);
      return {
        blocksByNoteId: {
          ...state.blocksByNoteId,
          [block.noteId]: updatedBlocks,
        },
      };
    });
  },
  updateBlockInStore: (block) => {
    set((state) => {
      const currentBlocks = state.blocksByNoteId[block.noteId] || [];
      const updatedBlocks = currentBlocks.map((b) =>
        b.blockId === block.blockId ? block : b
      );
      return {
        blocksByNoteId: {
          ...state.blocksByNoteId,
          [block.noteId]: sortBlocksByPosition(updatedBlocks),
        },
      };
    });
  },
  deleteBlockInStore: (blockId, noteId) => {
    set((state) => {
      const currentBlocks = state.blocksByNoteId[noteId] || [];
      const updatedBlocks = currentBlocks.filter((b) => b.blockId !== blockId);
      return {
        blocksByNoteId: {
          ...state.blocksByNoteId,
          [noteId]: updatedBlocks,
        },
      };
    });
  },
}));
