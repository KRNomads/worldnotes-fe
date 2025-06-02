// src/entities/block/api/blockApi.ts
import api from "@/shared/lib/api";
import {
  BlockCreateRequest,
  BlockResponse,
  BlocksCreateRequest,
  BlockUpdateRequest,
} from "../types/block";

export const blockApi = {
  fetchBlocksByNote: (noteId: string): Promise<BlockResponse[]> =>
    api.get(`/api/v1/blocks/note/${noteId}`).then((res) => res.data),

  createBlock: (data: BlockCreateRequest): Promise<BlockResponse> =>
    api.post("/api/v1/blocks/block", data).then((res) => res.data),

  createBlocks: (data: BlocksCreateRequest): Promise<BlockResponse[]> =>
    api.post("/api/v1/blocks/blocks", data).then((res) => res.data),

  updateBlock: (
    blockId: number,
    data: Partial<BlockUpdateRequest>
  ): Promise<BlockResponse> =>
    api.put(`/api/v1/blocks/${blockId}`, data).then((res) => res.data),

  deleteBlock: (blockId: number): Promise<void> =>
    api.delete(`/api/v1/blocks/${blockId}`).then(() => {}),
};
