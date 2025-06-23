import { Block } from "@/entities/block/types/block";
import RenderBlockContent from "./render-block-content";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Edit3,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BlockService } from "@/entities/block/model/blockService";

type BlockContainerProps = {
  block: Block;
  index: number;
  totalBlocks: number;
  blockService: BlockService;
};

export function BlockContainer({
  block,
  index,
  totalBlocks,
  blockService,
}: BlockContainerProps) {
  const [isEditingTitle, setIsEditingTitle] = useState<boolean | null>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingTitle]);

  return (
    <AccordionItem
      key={block.id}
      value={block.id.toString()}
      className="border border-gray-200 rounded-lg bg-white shadow-sm group relative"
      id={`block-${block.id}`}
    >
      {/* 트리거는 block.title만 포함 */}
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 rounded-t-lg data-[state=open]:rounded-b-none">
        {isEditingTitle ? (
          <Input
            ref={inputRef}
            value={block.title || ""}
            onChange={(e) =>
              blockService.updateBlockTitle(block.id, e.target.value)
            }
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                setIsEditingTitle(false);
              }
            }}
            className="text-sm font-medium flex-1 h-6 border-mint-300 focus:border-mint-500 mr-8"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="text-sm font-medium text-gray-700 flex-1 text-left cursor-pointer hover:text-mint-600 transition-colors"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            title="더블클릭하여 제목 편집"
          >
            {block.title}
          </span>
        )}
      </AccordionTrigger>

      {/* 메뉴는 트리거 바깥에 분리! */}
      <div className="absolute top-2.5 right-10 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              제목 편집
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                blockService.moveBlock(block.id, "up");
              }}
              disabled={index === 0}
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              위로 이동
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                blockService.moveBlock(block.id, "down");
              }}
              disabled={index === totalBlocks - 1}
            >
              <ArrowDown className="h-4 w-4 mr-2" />
              아래로 이동
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                blockService.duplicateBlock(block.id);
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              복제
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                blockService.deleteBlock(block.id);
              }}
              className="text-red-600 focus:text-red-600"
              disabled={totalBlocks <= 1}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!block.isCollapsed && <div className="border-b border-gray-300 " />}

      <AccordionContent className="px-4 pb-4">
        <div className="pt-2">
          <RenderBlockContent block={block} blockService={blockService} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
