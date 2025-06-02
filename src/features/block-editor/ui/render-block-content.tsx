import { Textarea } from "@/shared/ui/textarea";
import { Block, TextBlockProperties } from "@/entities/block/types/block";

interface RenderBlockContentProps {
  block: Block;
  onPropChange: (path: (string | number)[], value: string) => void;
}

export default function RenderBlockContent({
  block,
  onPropChange,
}: RenderBlockContentProps) {
  if (block.isCollapsed) return null;

  switch (block.type) {
    case "TEXT":
      const textProps = block.properties as TextBlockProperties;
      return (
        <Textarea
          value={textProps.value}
          onChange={(e) => onPropChange(["value"], e.target.value)}
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
  }
}
