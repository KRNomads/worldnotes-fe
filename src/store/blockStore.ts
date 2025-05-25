// src/store/blockStore.ts
import { create } from "zustand";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Block,
  BlockCreateRequest,
  BlocksCreateRequest,
  BlockUpdateRequest,
  BlockResponse,
  BlockType,
  BlockPropertiesUnion,
} from "@/types/block";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface BlockState {
  blocksByNoteId: Record<string, Block[]>;
  isLoading: boolean;
  error: string | null;

  fetchBlocksByNote: (noteId: string) => Promise<void>;

  hasBlocksForNote: (noteId: string) => boolean;

  createBlock: (blockData: BlockCreateRequest) => Promise<Block | null>;
  createBlocks: (blocksData: BlocksCreateRequest) => Promise<Block[] | null>;

  updateBlock: (
    blockId: number,
    noteId: string,
    updateData: BlockUpdateRequest
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

  deleteBlock: (blockId: number, noteId: string) => Promise<boolean>;

  getBlocksForNote: (noteId: string) => Block[];
  getBlockById: (noteId: string, blockId: number) => Block | undefined;

  getDefaultBlocks: (noteId: string) => Block[];
  getCustomBlocks: (noteId: string) => Block[];

  clearBlocksForNote: (noteId: string) => void;
  clearAllBlocks: () => void;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// BlockResponse (Block DTO)를 클라이언트 Block 타입으로 변환.
// block.ts에서 BlockResponse = Block 이므로, 이 함수는 DTO가 Block 타입임을 보장.
const mapBlockResponseToBlock = (dto: BlockResponse): Block => {
  // dto는 이미 block.ts의 Block 타입과 호환되는 구조여야 합니다.
  return {
    blockId: dto.blockId,
    noteId: dto.noteId,
    title: dto.title, // string | null
    fieldKey: dto.fieldKey, // string | null | undefined
    type: dto.type,
    properties: dto.properties, // BlockPropertiesUnion
    position: dto.position,
  };
};

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
      set((state) => ({
        blocksByNoteId: { ...state.blocksByNoteId, [noteId]: [] },
        isLoading: false,
      }));
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<BlockResponse[]> = await api.get(
        `/api/v1/blocks/note/${noteId}`
      );
      const fetchedBlocks: Block[] = response.data.map(mapBlockResponseToBlock);
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

  hasBlocksForNote: (noteId: string) => {
    const blocks = get().blocksByNoteId[noteId];
    return Array.isArray(blocks) && blocks.length > 0;
  },

  createBlock: async (blockData: BlockCreateRequest) => {
    set({ isLoading: true, error: null });
    try {
      // blockData는 BlockCreateRequest 타입이므로, API가 요구하는 필드만 포함합니다.
      // (block.ts의 BlockCreateRequest에 position 필드가 없음)
      const response: AxiosResponse<BlockResponse> = await api.post(
        "/api/v1/blocks/block",
        blockData
      );
      const newBlock = mapBlockResponseToBlock(response.data);
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
          JSON.stringify(error.response.data);
        errorMessage += ` 서버 응답: ${serverMessage}`;
      }
      console.error("[BlockStore] 블록 생성 실패:", error);
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  createBlocks: async (blocksData: BlocksCreateRequest) => {
    if (!blocksData.blocks || blocksData.blocks.length === 0) return [];
    set({ isLoading: true, error: null });
    const noteId = blocksData.blocks[0].noteId;
    try {
      // blocksData는 BlocksCreateRequest 타입이므로, API가 요구하는 필드만 포함합니다.
      const response: AxiosResponse<BlockResponse[]> = await api.post(
        "/api/v1/blocks/blocks",
        blocksData
      );
      const newBlocks: Block[] = response.data.map(mapBlockResponseToBlock);
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
          JSON.stringify(error.response.data);
        errorMessage += ` 서버 응답: ${serverMessage}`;
      }
      console.error(
        `[BlockStore] 노트 (${noteId}) 여러 블록 생성 실패:`,
        error
      );
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateBlock: async (
    blockId: number,
    noteId: string,
    updateData: Partial<BlockUpdateRequest>
  ): Promise<Block | null> => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/v1/blocks/${blockId}`, {
        title: updateData.title ?? null,
        type: updateData.type ?? null,
        properties: updateData.properties ?? null,
      });

      const updatedBlock = mapBlockResponseToBlock(response.data);
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
      const error = err as AxiosError;
      set({ error: "블록 업데이트 실패", isLoading: false });
      return null;
    }
  },

  updateBlockTitle: async (
    blockId: number,
    noteId: string,
    title: string
  ): Promise<Block | null> => {
    return await get().updateBlock(blockId, noteId, { title });
  },

  updateBlockProperties: async (
    blockId: number,
    noteId: string,
    type: BlockType,
    properties: BlockPropertiesUnion
  ): Promise<Block | null> => {
    return await get().updateBlock(blockId, noteId, { type, properties });
  },

  deleteBlock: async (blockId: number, noteId: string) => {
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

  getDefaultBlocks: (noteId: string) =>
    get().blocksByNoteId[noteId].filter((b) => b.fieldKey !== null),

  getCustomBlocks: (noteId: string) =>
    get()
      .blocksByNoteId[noteId].filter((b) => b.fieldKey === null)
      .sort((a, b) => a.position - b.position),

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
    set({ blocksByNoteId: {}, isLoading: false, error: null });
  },
}));
