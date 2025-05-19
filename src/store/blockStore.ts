// src/store/blockStore.ts

import { create } from "zustand";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Block,
  BlockCreateRequest,
  BlocksCreateRequest,
  BlockUpdateRequest,
  BlockResponse,
} from "@/types/block";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface BlockState {
  blocksByNoteId: Record<string, Block[]>;
  isLoading: boolean;
  error: string | null;

  fetchBlocksByNote: (noteId: string) => Promise<void>;
  createBlock: (blockData: BlockCreateRequest) => Promise<Block | null>;
  createBlocks: (blocksData: BlocksCreateRequest) => Promise<Block[] | null>;
  updateBlock: (
    blockId: number,
    noteId: string,
    updateData: BlockUpdateRequest
  ) => Promise<Block | null>;
  deleteBlock: (blockId: number, noteId: string) => Promise<boolean>;

  getBlocksForNote: (noteId: string) => Block[];
  getBlockById: (noteId: string, blockId: number) => Block | undefined;
  clearBlocksForNote: (noteId: string) => void;
  clearAllBlocks: () => void;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const sortBlocksByPosition = (blocks: Block[]): Block[] => {
  return [...blocks].sort((a, b) => a.position - b.position);
};

export const useBlockStore = create<BlockState>((set, get) => ({
  blocksByNoteId: {},
  isLoading: false,
  error: null,

  fetchBlocksByNote: async (noteId) => {
    if (!noteId || noteId === "undefined") {
      console.warn(
        "[BlockStore] fetchBlocksByNote: 유효하지 않은 노트 ID:",
        noteId
      );
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<BlockResponse[]> = await api.get(
        `/api/v1/blocks/note/${noteId}`
      );
      const fetchedBlocks: Block[] = response.data;
      set((state) => ({
        blocksByNoteId: {
          ...state.blocksByNoteId,
          [noteId]: sortBlocksByPosition(fetchedBlocks),
        },
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error | AxiosError;
      console.error(
        `[BlockStore] 노트 (${noteId}) 블록 목록 가져오기 실패:`,
        error.message
      );
      set({
        error: `노트 (${noteId})의 블록 목록을 불러오는데 실패했습니다.`,
        isLoading: false,
      });
    }
  },

  createBlock: async (blockData) => {
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<BlockResponse> = await api.post(
        "/api/v1/blocks/block",
        blockData
      );
      const newBlock: Block = response.data;
      set((state) => {
        const currentBlocks = state.blocksByNoteId[blockData.noteId] || [];
        return {
          blocksByNoteId: {
            ...state.blocksByNoteId,
            [blockData.noteId]: sortBlocksByPosition([
              ...currentBlocks,
              newBlock,
            ]),
          },
          isLoading: false,
        };
      });
      return newBlock;
    } catch (err) {
      const error = err as Error | AxiosError;
      let errorMessage = "블록 생성에 실패했습니다.";
      if (axios.isAxiosError(error) && error.response?.data) {
        const serverMessage =
          (error.response.data as any)?.message ||
          (error.response.data as any)?.error ||
          JSON.stringify(error.response.data);
        if (serverMessage) errorMessage += ` 서버 응답: ${serverMessage}`;
      } else if (error.message) {
        errorMessage += ` (${error.message})`;
      }
      console.error("[BlockStore] 블록 생성 실패:", error);
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  createBlocks: async (blocksData) => {
    if (!blocksData.blocks || blocksData.blocks.length === 0) return [];
    set({ isLoading: true, error: null });
    const noteId = blocksData.blocks[0].noteId;
    try {
      const response: AxiosResponse<BlockResponse[]> = await api.post(
        "/api/v1/blocks/blocks",
        blocksData
      );
      const newBlocks: Block[] = response.data;
      set((state) => {
        const currentBlocks = state.blocksByNoteId[noteId] || [];
        return {
          blocksByNoteId: {
            ...state.blocksByNoteId,
            [noteId]: sortBlocksByPosition([...currentBlocks, ...newBlocks]),
          },
          isLoading: false,
        };
      });
      return newBlocks;
    } catch (err) {
      const error = err as Error | AxiosError;
      let errorMessage = `노트 (${noteId})에 여러 블록을 생성하는데 실패했습니다.`;
      if (axios.isAxiosError(error) && error.response?.data) {
        const serverMessage =
          (error.response.data as any)?.message ||
          (error.response.data as any)?.error ||
          JSON.stringify(error.response.data);
        if (serverMessage) errorMessage += ` 서버 응답: ${serverMessage}`;
      } else if (error.message) {
        errorMessage += ` (${error.message})`;
      }
      console.error(
        `[BlockStore] 노트 (${noteId}) 여러 블록 생성 실패:`,
        error
      );
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateBlock: async (blockId, noteId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<BlockResponse> = await api.put(
        `/api/v1/blocks/${blockId}`,
        updateData
      );
      const updatedBlock: Block = response.data;
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
    } catch (err) {
      const error = err as Error | AxiosError;
      let errorMessage = `블록 (ID: ${blockId}) 업데이트에 실패했습니다.`;
      if (axios.isAxiosError(error) && error.response?.data) {
        const serverMessage =
          (error.response.data as any)?.message ||
          (error.response.data as any)?.error ||
          JSON.stringify(error.response.data);
        if (serverMessage) errorMessage += ` 서버 응답: ${serverMessage}`;
      } else if (error.message) {
        errorMessage += ` (${error.message})`;
      } else {
        errorMessage += ` (알 수 없는 오류)`;
      }
      console.error(`[BlockStore] 블록 (ID: ${blockId}) 업데이트 실패:`, error); // 전체 에러 객체 로깅
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deleteBlock: async (blockId, noteId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/blocks/${blockId}`);
      set((state) => {
        const currentBlocks = state.blocksByNoteId[noteId] || [];
        const newBlocks = currentBlocks.filter(
          (block) => block.blockId !== blockId
        );
        return {
          blocksByNoteId: {
            ...state.blocksByNoteId,
            [noteId]: sortBlocksByPosition(newBlocks),
          },
          isLoading: false,
        };
      });
      return true;
    } catch (err) {
      const error = err as Error | AxiosError;
      console.error(
        `[BlockStore] 블록 (ID: ${blockId}) 삭제 실패:`,
        error.message
      );
      set({
        error: `블록 (ID: ${blockId}) 삭제에 실패했습니다.`,
        isLoading: false,
      });
      return false;
    }
  },

  getBlocksForNote: (noteId: string) => {
    const state = get();
    return state.blocksByNoteId[noteId] || [];
  },

  getBlockById: (noteId: string, blockId: number) => {
    const blocksForNote = get().blocksByNoteId[noteId] || [];
    return blocksForNote.find((block) => block.blockId === blockId);
  },

  clearBlocksForNote: (noteId: string) => {
    set((state) => {
      const newBlocksByNoteId = { ...state.blocksByNoteId };
      if (newBlocksByNoteId[noteId]) {
        delete newBlocksByNoteId[noteId];
      }
      return { blocksByNoteId: newBlocksByNoteId };
    });
  },

  clearAllBlocks: () => {
    set({
      blocksByNoteId: {},
      isLoading: false,
      error: null,
    });
  },
}));
