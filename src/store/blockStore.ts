// src/store/blockStore.ts
import { create } from "zustand";
import {
  Block,
  BlockCreateRequest,
  BlockUpdateRequest,
  BlockResponse,
  BlocksCreateRequest,
} from "@/types/block";
import axios, { AxiosResponse } from "axios";

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface BlockState {
  blocks: Block[];
  currentBlock: Block | null;
  isLoading: boolean;
  error: string | null;

  fetchBlocksByNote: (noteId: string) => Promise<void>;
  setCurrentBlock: (blockId: number) => void;
  createBlock: (blockData: BlockCreateRequest) => Promise<Block>;
  createBlocks: (blocksData: BlocksCreateRequest) => Promise<Block[]>;
  updateBlock: (
    blockId: number,
    updateData: BlockUpdateRequest
  ) => Promise<Block>;
  deleteBlock: (blockId: number) => Promise<void>;
}

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useBlockStore = create<BlockState>((set, get) => ({
  blocks: [],
  currentBlock: null,
  isLoading: false,
  error: null,

  fetchBlocksByNote: async (noteId) => {
    if (!noteId || noteId === "undefined") {
      set({
        error: "유효하지 않은 노트 ID입니다",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse = await api.get(
        `/api/v1/blocks/note/${noteId}`
      );

      // API 응답 데이터를 Block[] 타입으로 변환
      const fetchedBlocks: Block[] = response.data.map((blockData: any) => ({
        id: blockData.blockId,
        noteId: blockData.noteId,
        projectId: blockData.projectId,
        title: blockData.title || "제목 없음",
        type: blockData.type,
        isDefault: blockData.isDefault,
        properties: blockData.properties || {},
        position: blockData.position,
      }));

      set({ blocks: fetchedBlocks, isLoading: false });
    } catch (err) {
      set({
        error: "블록을 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  setCurrentBlock: (blockId) => {
    const { blocks } = get();
    const block = blocks.find((b) => b.id === blockId) || null;
    set({ currentBlock: block });
  },

  createBlock: async (blockData) => {
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<BlockResponse> = await api.post(
        "/api/v1/blocks/block",
        blockData
      );

      // 응답에서 받은 데이터를 Block 타입에 맞게 변환
      const newBlock: Block = {
        id: response.data.blockId,
        noteId: response.data.noteId,
        projectId: response.data.projectId,
        title: response.data.title,
        type: response.data.type,
        isDefault: response.data.isDefault,
        properties: response.data.properties,
        position: response.data.position,
      };

      set((state) => ({
        blocks: [...state.blocks, newBlock],
        currentBlock: newBlock,
        isLoading: false,
      }));

      return newBlock;
    } catch (err) {
      set({
        error: "블록 생성에 실패했습니다",
        isLoading: false,
      });
      throw err;
    }
  },

  createBlocks: async (blocksData) => {
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<BlockResponse[]> = await api.post(
        "/api/v1/blocks/blocks",
        blocksData
      );

      // 응답에서 받은 데이터를 Block[] 타입에 맞게 변환
      const newBlocks: Block[] = response.data.map((blockData) => ({
        id: blockData.blockId,
        noteId: blockData.noteId,
        projectId: blockData.projectId,
        title: blockData.title,
        type: blockData.type,
        isDefault: blockData.isDefault,
        properties: blockData.properties,
        position: blockData.position,
      }));

      set((state) => ({
        blocks: [...state.blocks, ...newBlocks],
        isLoading: false,
      }));

      return newBlocks;
    } catch (err) {
      set({
        error: "블록 일괄 생성에 실패했습니다",
        isLoading: false,
      });
      throw err;
    }
  },

  updateBlock: async (blockId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/v1/blocks/${blockId}`, updateData);

      // 응답에서 받은 데이터를 Block 타입에 맞게 변환
      const updatedBlock: Block = {
        id: response.data.blockId,
        noteId: response.data.noteId,
        projectId: response.data.projectId,
        title: response.data.title,
        type: response.data.type,
        isDefault: response.data.isDefault,
        properties: response.data.properties,
        position: response.data.position,
      };

      // 블록 목록과 현재 블록 상태 업데이트
      set((state) => ({
        blocks: state.blocks.map((block) =>
          block.id === blockId ? updatedBlock : block
        ),
        currentBlock:
          state.currentBlock?.id === blockId
            ? updatedBlock
            : state.currentBlock,
        isLoading: false,
      }));

      return updatedBlock;
    } catch (err) {
      set({
        error: "블록 업데이트에 실패했습니다",
        isLoading: false,
      });
      throw err;
    }
  },

  deleteBlock: async (blockId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/blocks/${blockId}`);

      // 삭제된 블록을 상태에서 제거
      set((state) => ({
        blocks: state.blocks.filter((block) => block.id !== blockId),
        currentBlock:
          state.currentBlock?.id === blockId ? null : state.currentBlock,
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: "블록 삭제에 실패했습니다",
        isLoading: false,
      });
      throw err;
    }
  },
}));
