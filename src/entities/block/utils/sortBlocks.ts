import { Block } from "../types/block";

export function sortBlocks(blocks: Block[]): Block[] {
  return blocks.slice().sort((a, b) => a.position - b.position);
}
