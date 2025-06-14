import { debounce } from "lodash";
import { produce } from "immer";
import { blockApi } from "../api/blockApi";
import { getDefaultProperties } from "../lib/blockUtils";
import { mapBlockResponseToBlock } from "../lib/mappers";
import { Block, BlockType } from "../types/block";
import { useBlockStore } from "../store/blockStore";

const DEBOUNCE_DELAY = 500;

export class BlockService {
  private blockStore = useBlockStore.getState();

  constructor(private readonly noteId: string) {}

  /**
   * 블록 불러오기
   */
  async fetchBlocks() {
    const data = await blockApi.fetchBlocksByNote(this.noteId);
    const blocks = data.map(mapBlockResponseToBlock);
    this.blockStore.setBlocks(this.noteId, blocks);
  }

  /**
   * 블록 추가
   */
  async addBlock(type: BlockType) {
    const request = {
      noteId: this.noteId,
      title: "새 블록",
      type,
      properties: getDefaultProperties(type),
    };
    const response = await blockApi.createBlock(request);
    const newBlock = mapBlockResponseToBlock(response);

    if (newBlock.fieldKey !== null) {
      this.blockStore.updateDefaultBlock(this.noteId, newBlock);
    } else {
      this.blockStore.updateCustomBlock(this.noteId, newBlock);
    }
  }

  /**
   * 블록 삭제
   */
  async deleteBlock(blockId: number) {
    await blockApi.deleteBlock(blockId);

    const blocks = this.blockStore.blocksByNoteId[this.noteId];
    if (!blocks) return;

    // defaultBlocks에서 삭제
    const defaultBlocks = blocks.defaultBlocks.filter(
      (b) => b.blockId !== blockId
    );
    const customBlocks = blocks.customBlocks.filter(
      (b) => b.blockId !== blockId
    );

    this.blockStore.setBlocks(this.noteId, [...defaultBlocks, ...customBlocks]);
  }

  /**
   * 디바운스된 타이틀 업데이트
   */
  private debouncedUpdateTitle = debounce(
    async (blockId: number, title: string) => {
      const response = await blockApi.updateBlock(blockId, { title });
      const updated = mapBlockResponseToBlock(response);
      if (updated.fieldKey !== null) {
        this.blockStore.updateDefaultBlock(this.noteId, updated);
      } else {
        this.blockStore.updateCustomBlock(this.noteId, updated);
      }
    },
    DEBOUNCE_DELAY
  );

  updateBlockTitle(blockId: number, title: string) {
    this.debouncedUpdateTitle(blockId, title);
  }

  /**
   * 디바운스된 프로퍼티 업데이트
   */
  private debouncedUpdateProperties = debounce(
    async (blockId: number, path: (string | number)[], value: any) => {
      const blocks = this.blockStore.blocksByNoteId[this.noteId];
      if (!blocks) return;

      const allBlocks = [...blocks.defaultBlocks, ...blocks.customBlocks];
      const target = allBlocks.find((b) => b.blockId === blockId);
      if (!target) return;

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
      if (updated.fieldKey !== null) {
        this.blockStore.updateDefaultBlock(this.noteId, updated);
      } else {
        this.blockStore.updateCustomBlock(this.noteId, updated);
      }
    },
    DEBOUNCE_DELAY
  );

  updateBlockProperties(
    blockId: number,
    path: (string | number)[],
    value: any
  ) {
    this.debouncedUpdateProperties(blockId, path, value);
  }

  /**
   * 접힘여부 업데이트 (디바운스 없음)
   */
  async updateBlockIsCollapsed(blockId: number, isCollapsed: boolean) {
    const response = await blockApi.updateBlock(blockId, { isCollapsed });
    const updated = mapBlockResponseToBlock(response);
    if (updated.fieldKey !== null) {
      this.blockStore.updateDefaultBlock(this.noteId, updated);
    } else {
      this.blockStore.updateCustomBlock(this.noteId, updated);
    }
  }

  /**
   * 현재 defaultBlocks 조회
   */
  get defaultBlocks(): Block[] {
    return this.blockStore.blocksByNoteId[this.noteId]?.defaultBlocks ?? [];
  }

  /**
   * 현재 customBlocks 조회
   */
  get customBlocks(): Block[] {
    return this.blockStore.blocksByNoteId[this.noteId]?.customBlocks ?? [];
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
    //   id: `${blockToDuplicate.id}_copy_${Date.now()}`,
    //   title: `${blockToDuplicate.title} (복사본)`,
    // };
    // const newBlocks = [...blocks];
    // newBlocks.splice(blockIndex + 1, 0, newBlock);
    // setBlocks(newBlocks);
  };
}
