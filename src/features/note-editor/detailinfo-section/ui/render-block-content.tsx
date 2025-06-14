import { Textarea } from "@/shared/ui/textarea";
import { Block, TextBlockProperties } from "@/entities/block/types/block";
import ParagraphBlockContent from "./paragraph-block-content";
import { BlockService } from "@/entities/block/service/blockService";

interface RenderBlockContentProps {
  block: Block;
  blockService: BlockService;
}

export default function RenderBlockContent({
  block,
  blockService,
}: RenderBlockContentProps) {
  if (block.isCollapsed) return null;

  switch (block.type) {
    case "TEXT":
      const textProps = block.properties as TextBlockProperties;
      return (
        <Textarea
          value={textProps.value}
          onChange={(e) =>
            blockService.updateBlockProperties(
              block.blockId,
              ["value"],
              e.target.value
            )
          }
          className="min-h-[100px] border-none focus-visible:ring-0 px-10 resize-none"
          placeholder="텍스트를 입력하세요"
        />
      );
    case "IMAGE":
      //const imageProps = block.properties as ImageBlockProperties;
      return <div className="space-y-2">{"이미지 블록"}</div>;
    case "TAGS":
      //const tagProps = block.properties as TagsBlockProperties;
      return <div className="space-y-2">{"태그 블록"}</div>;
    case "PARAGRAPH":
      //const tagProps = block.properties as TagsBlockProperties;
      return (
        <ParagraphBlockContent block={block} blockService={blockService} />
      );
  }
}
