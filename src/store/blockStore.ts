// src/store/blockStore.ts

import { create } from "zustand";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Block,
  BlockCreateRequest,
  BlocksCreateRequest,
  BlockUpdateRequest,
  BlockResponse,
} from "@/types/block"; // 위에서 정의한 타입 사용

// API 기본 URL 설정 (실제 환경에 맞게 .env 파일 등에서 관리)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://localhost:3573";

interface BlockState {
  blocksByNoteId: Record<string, Block[]>; // Key: noteId, Value: 해당 노트의 블록 배열
  isLoading: boolean; // 전역 로딩 상태 (단순화됨)
  error: string | null; // 전역 에러 상태 (단순화됨)

  // 액션 함수들
  fetchBlocksByNote: (noteId: string) => Promise<void>;
  createBlock: (blockData: BlockCreateRequest) => Promise<Block | null>;
  createBlocks: (blocksData: BlocksCreateRequest) => Promise<Block[] | null>;
  updateBlock: (
    blockId: number,
    noteId: string, // 상태 업데이트 및 올바른 API 호출을 위해 필요
    updateData: BlockUpdateRequest
  ) => Promise<Block | null>;
  deleteBlock: (blockId: number, noteId: string) => Promise<boolean>;

  // 셀렉터 (컴포넌트에서 상태를 쉽게 가져오기 위함)
  getBlocksForNote: (noteId: string) => Block[];
  getBlockById: (noteId: string, blockId: number) => Block | undefined;

  // 유틸리티 함수
  clearBlocksForNote: (noteId: string) => void; // 특정 노트의 블록 데이터만 스토어에서 제거
  clearAllBlocks: () => void; // 스토어의 모든 블록 데이터 제거
}

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 기반 인증 시 필요
  headers: { "Content-Type": "application/json" },
});

// 블록 배열을 position 기준으로 정렬하는 헬퍼 함수
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
        "[BlockStore] fetchBlocksByNote: 유효하지 않은 노트 ID입니다.",
        noteId
      );
      // 특정 노트의 블록만 비우거나, 에러 상태를 설정할 수 있습니다.
      // set(state => ({ blocksByNoteId: { ...state.blocksByNoteId, [noteId]: [] }, isLoading: false }));
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<BlockResponse[]> = await api.get(
        `/api/v1/blocks/note/${noteId}`
      );
      // API 응답 데이터를 Block 타입으로 변환 (이미 일치한다면 그대로 사용)
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
        `[BlockStore] 노트 (${noteId})의 블록 목록 가져오기 실패:`,
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
        "/api/v1/blocks/block", // API 명세에 따름
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
      console.error("[BlockStore] 블록 생성 실패:", error.message);
      set({ error: "블록 생성에 실패했습니다.", isLoading: false });
      return null;
    }
  },

  createBlocks: async (blocksData) => {
    if (!blocksData.blocks || blocksData.blocks.length === 0) {
      return [];
    }
    set({ isLoading: true, error: null });
    const noteId = blocksData.blocks[0].noteId; // 모든 블록이 같은 노트 ID를 가진다고 가정
    try {
      const response: AxiosResponse<BlockResponse[]> = await api.post(
        "/api/v1/blocks/blocks", // API 명세에 따름
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
      console.error(
        `[BlockStore] 노트 (${noteId})에 여러 블록 생성 실패:`,
        error.message
      );
      set({
        error: `노트 (${noteId})에 여러 블록을 생성하는데 실패했습니다.`,
        isLoading: false,
      });
      return null;
    }
  },

  updateBlock: async (blockId, noteId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<BlockResponse> = await api.put(
        `/api/v1/blocks/${blockId}`,
        updateData // BlockUpdateRequest 타입의 객체
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
      console.error(
        `[BlockStore] 블록 (ID: ${blockId}) 업데이트 실패:`,
        error.message
      );
      set({
        error: `블록 (ID: ${blockId}) 업데이트에 실패했습니다.`,
        isLoading: false,
      });
      return null;
    }
  },

  deleteBlock: async (blockId, noteId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/blocks/${blockId}`);
      set((state) => {
        const currentBlocks = state.blocksByNoteId[noteId] || [];
        // 삭제 후 새 배열 생성 및 정렬
        const newBlocks = currentBlocks.filter(
          (block) => block.blockId !== blockId
        );
        return {
          blocksByNoteId: {
            ...state.blocksByNoteId,
            [noteId]: sortBlocksByPosition(newBlocks), // 필터링 후에도 정렬된 상태 유지 (이미 정렬되어 있었다면 이중 정렬 불필요)
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
