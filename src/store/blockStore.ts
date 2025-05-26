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
} from "@/types/block"; // 실제 타입 경로 확인

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
import { BlockPayload, WebSocketMessage } from "@/types/socketMessage";
import {
  mapBlockPayloadToBlock,
  mapBlockResponseToBlock,
} from "@/utils/mappers";
import api from "@/lib/api";

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
    updateData: Partial<BlockUpdateRequest>
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

  handleBlockSocketEvent: (msg: WebSocketMessage<BlockPayload>) => void;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const mapBlockResponseToBlock = (dto: BlockResponse): Block => {
  return {
    blockId: dto.blockId,
    noteId: dto.noteId,
    title: dto.title,
    fieldKey: dto.fieldKey,
    type: dto.type,
    properties: dto.properties,
    position: dto.position,
  };
};

const sortBlocksByPosition = (blocks: Block[]): Block[] => {
  if (!Array.isArray(blocks)) return [];
  return [...blocks].sort((a, b) => a.position - b.position);
};

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
        `[BlockStore] fetchBlocksByNote FAILED for noteId (${noteId}):`,
        error.message
      ); // 에러 로그 유지
      set({
        error: `노트 (${noteId})의 블록 목록 로딩 실패.`,
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
      const response: AxiosResponse<BlockResponse> = await api.post(
        "/api/v1/blocks/block",
        blockData
      );
      const newBlock = mapBlockResponseToBlock(response.data);
      set((state) => {
        const currentBlocks = state.blocksByNoteId[blockData.noteId] || [];
        const updatedBlocks = sortBlocksByPosition([
          ...currentBlocks,
          newBlock,
        ]);
        return {
          blocksByNoteId: {
            ...state.blocksByNoteId,
            [blockData.noteId]: updatedBlocks,
          },
          isLoading: false,
        };
      });
      return newBlock;
    } catch (err) {
      const error = err as Error | AxiosError;
      let errorMessage = "블록 생성 실패.";
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage += ` 서버: ${
          (error.response.data as any)?.message ||
          JSON.stringify(error.response.data)
        }`;
      }
      console.error("[BlockStore] createBlock FAILED:", errorMessage, error); // 에러 로그 유지
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  createBlocks: async (blocksData: BlocksCreateRequest) => {
    if (!blocksData.blocks || blocksData.blocks.length === 0) return null;
    const noteId = blocksData.blocks[0].noteId;
    set({ isLoading: true, error: null });
    try {
      const response: AxiosResponse<BlockResponse[]> = await api.post(
        "/api/v1/blocks/blocks",
        blocksData
      );
      const newBlocks: Block[] = response.data.map(mapBlockResponseToBlock);
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
    } catch (err) {
      const error = err as Error | AxiosError;
      let errorMessage = `노트 (${noteId}) 여러 블록 생성 실패.`;
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage += ` 서버: ${
          (error.response.data as any)?.message ||
          JSON.stringify(error.response.data)
        }`;
      }
      console.error(
        `[BlockStore] createBlocks FAILED for noteId (${noteId}):`,
        errorMessage,
        error
      ); // 에러 로그 유지
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateBlock: async (
    blockId: number,
    noteId: string,
    updateData: Partial<BlockUpdateRequest>
  ): Promise<Block | null> => {
    if (Object.keys(updateData).length === 0) {
      const currentBlock = get().getBlockById(noteId, blockId);
      return currentBlock || null;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/v1/blocks/${blockId}`, updateData);
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
      console.error(
        `[BlockStore updateBlock] FAILED for blockId: ${blockId}. Error:`,
        error.message,
        "Server response:",
        error.response?.data
      ); // 에러 로그 유지
      set({
        error:
          "블록 업데이트 실패: " +
          ((error.response?.data as any)?.message || error.message),
        isLoading: false,
      });
      return null;
    }
  },

  updateBlockTitle: async (
    blockId: number,
    noteId: string,
    title: string
  ): Promise<Block | null> => {
    return get().updateBlock(blockId, noteId, { title });
  },

  updateBlockProperties: async (
    blockId: number,
    noteId: string,
    type: BlockType,
    properties: BlockPropertiesUnion
  ): Promise<Block | null> => {
    return get().updateBlock(blockId, noteId, { properties, type });
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
        `[BlockStore] deleteBlock FAILED for blockId (${blockId}):`,
        error.message
      ); // 에러 로그 유지
      set({ error: `블록 (ID: ${blockId}) 삭제 실패.`, isLoading: false });
      return false;
    }
  },

  getBlocksForNote: (noteId: string) => {
    return get().blocksByNoteId[noteId] || [];
  },

  getBlockById: (noteId: string, blockId: number) => {
    const blocksForNote = get().blocksByNoteId[noteId] || [];
    return blocksForNote.find((block) => block.blockId === blockId);
  },

  getDefaultBlocks: (noteId: string) => {
    const blocks = get().blocksByNoteId[noteId];
    if (!blocks) return [];
    return blocks.filter(
      (b) => b.fieldKey !== null && b.fieldKey !== undefined
    );
  },

  getCustomBlocks: (noteId: string) => {
    const blocks = get().blocksByNoteId[noteId];
    if (!blocks) return [];
    return blocks
      .filter((b) => b.fieldKey === null || b.fieldKey === undefined)
      .sort((a, b) => a.position - b.position);
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
    set({ blocksByNoteId: {}, isLoading: false, error: null });
  },

  handleBlockSocketEvent: (msg: WebSocketMessage<Partial<BlockPayload>>) => {
    const { type, payload } = msg;

    switch (type) {
      case "BLOCK_CREATED":
        const newBlock = mapBlockPayloadToBlock(payload as BlockPayload);
        set((state) => {
          const currentBlocks = state.blocksByNoteId[newBlock.noteId] || [];
          return {
            blocksByNoteId: {
              ...state.blocksByNoteId,
              [newBlock.noteId]: [...currentBlocks, newBlock].sort(
                (a, b) => a.position - b.position
              ),
            },
          };
        });
        break;

      case "BLOCK_UPDATED":
        const updatedBlock = mapBlockPayloadToBlock(payload as BlockPayload);
        set((state) => {
          const currentBlocks = state.blocksByNoteId[updatedBlock.noteId] || [];
          return {
            blocksByNoteId: {
              ...state.blocksByNoteId,
              [updatedBlock.noteId]: currentBlocks
                .map((b) =>
                  b.blockId === updatedBlock.blockId ? updatedBlock : b
                )
                .sort((a, b) => a.position - b.position),
            },
          };
        });
        break;

      case "BLOCK_DELETED":
        set((state) => {
          const currentBlocks = state.blocksByNoteId[payload.noteId] || [];
          return {
            blocksByNoteId: {
              ...state.blocksByNoteId,
              [payload.noteId]: currentBlocks.filter(
                (b) => b.blockId !== payload.blockId
              ),
            },
          };
        });
        break;
    }
  },
}));
