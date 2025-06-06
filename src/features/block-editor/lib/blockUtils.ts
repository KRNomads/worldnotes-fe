import {
  BlockType,
  BlockPropertiesUnion,
  TextBlockProperties,
  ImageBlockProperties,
  TagsBlockProperties,
  ParagraphBlockProperties,
} from "@/entities/block/types/block"; // 타입 정의가 있는 경로로 변경

export function getDefaultProperties(type: BlockType): BlockPropertiesUnion {
  switch (type) {
    case "TEXT":
      return {
        type: "TEXT",
        value: "",
      } as TextBlockProperties;
    case "IMAGE":
      return {
        type: "IMAGE",
        url: "",
        caption: "",
      } as ImageBlockProperties;
    case "TAGS":
      return {
        type: "TAGS",
        tags: [],
      } as TagsBlockProperties;
    case "PARAGRAPH":
      return {
        type: "PARAGRAPH",
        content: {},
      } as ParagraphBlockProperties;

    default:
      throw new Error(`Unsupported block type: ${type}`);
  }
}
