// src/entities/block/service/blockService.ts

import { debounce } from "lodash";
import { produce } from "immer";
import { blockApi } from "../api/blockApi";
import { getDefaultProperties } from "../lib/blockUtils";
import { mapBlockResponseToBlock } from "../lib/mappers";
import { BlockType } from "../types/block";
import { useBlockStore } from "../store/blockStore";

const DEBOUNCE_DELAY = 500;

export class BlockService {
  private blockStore = useBlockStore.getState();

  constructor(private readonly noteId: string) {}

  async fetchBlocks() {
    const data = await blockApi.fetchBlocksByNote(this.noteId);
    const blocks = data.map(mapBlockResponseToBlock);
    this.blockStore.setBlocks(this.noteId, blocks);
  }

  async addDefaultBlock(title: string, fieldKey: string) {
    const request = {
      noteId: this.noteId,
      title: title,
      fieldKey: fieldKey,
      type: "TEXT" as BlockType,
      properties: getDefaultProperties("TEXT"),
    };
    const response = await blockApi.createBlock(request);
    const newBlock = mapBlockResponseToBlock(response);
    this.blockStore.addBlock(this.noteId, newBlock);
  }

  async addCustomBlock(type: BlockType) {
    const request = {
      noteId: this.noteId,
      title: "새 블록",
      type: type,
      properties: getDefaultProperties(type),
    };
    const response = await blockApi.createBlock(request);
    const newBlock = mapBlockResponseToBlock(response);
    this.blockStore.addBlock(this.noteId, newBlock);
  }

  async deleteBlock(blockId: number) {
    await blockApi.deleteBlock(blockId);
    this.blockStore.deleteBlock(this.noteId, blockId);
  }

  private debouncedUpdateTitle = debounce(
    async (blockId: number, title: string) => {
      const response = await blockApi.updateBlock(blockId, { title });
      const updated = mapBlockResponseToBlock(response);
      this.blockStore.updateBlock(this.noteId, updated);
    },
    DEBOUNCE_DELAY
  );

  updateBlockTitle(blockId: number, title: string) {
    this.debouncedUpdateTitle(blockId, title);
  }

  private debouncedUpdateProperties = debounce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (blockId: number, path: (string | number)[], value: any) => {
      const blocks = this.blockStore.blocksByNoteId[this.noteId];
      if (!blocks) return;

      const target = blocks.find((b) => b.blockId === blockId);
      if (!target) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedProperties = produce(target.properties, (draft: any) => {
        let curr = draft;
        for (let i = 0; i < path.length - 1; i++) {
          curr = curr[path[i]];
        }
        curr[path[path.length - 1]] = value;
      });

      const response = await blockApi.updateBlock(blockId, {
        type: target.type,
        properties: updatedProperties,
      });

      const updated = mapBlockResponseToBlock(response);
      this.blockStore.updateBlock(this.noteId, updated);
    },
    DEBOUNCE_DELAY
  );

  updateBlockProperties(
    blockId: number,
    path: (string | number)[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) {
    this.debouncedUpdateProperties(blockId, path, value);
  }

  async updateBlockIsCollapsed(blockId: number, isCollapsed: boolean) {
    const response = await blockApi.updateBlock(blockId, { isCollapsed });
    const updated = mapBlockResponseToBlock(response);
    this.blockStore.updateBlock(this.noteId, updated);
  }

  // 블록 이동 함수
  moveBlock = (blockId: number, direction: "up" | "down") => {
    // const currentIndex = blocks.findIndex((block) => block.id === blockId);
    // if (
    //   (direction === "up" && currentIndex === 0) ||
    //   (direction === "down" && currentIndex === blocks.length - 1)
    // ) {
    //   return; // 이동할 수 없는 경우
    // }
    // const newBlocks = [...blocks];
    // const targetIndex =
    //   direction === "up" ? currentIndex - 1 : currentIndex + 1;
    // // 배열 요소 교환
    // [newBlocks[currentIndex], newBlocks[targetIndex]] = [
    //   newBlocks[targetIndex],
    //   newBlocks[currentIndex],
    // ];
    // setBlocks(newBlocks);
  };

  // 블록 복제 함수
  duplicateBlock = (blockId: number) => {
    // const blockIndex = blocks.findIndex((block) => block.id === blockId);
    // const blockToDuplicate = blocks[blockIndex];
    // const newBlock = {
    //   ...blockToDuplicate,
    //   id: ${blockToDuplicate.id}_copy_${Date.now()},
    //   title: ${blockToDuplicate.title} (복사본),
    // };
    // const newBlocks = [...blocks];
    // newBlocks.splice(blockIndex + 1, 0, newBlock);
    // setBlocks(newBlocks);
  };
}
