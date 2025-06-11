import { Block } from "@/entities/block/types/block";
import RenderBlockContent from "@/features/block/ui/render-block-content";
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

type BlockContainerProps = {
  block: Block;
  index: number;
  totalBlocks: number;
  onMoveBlock: (blockId: number, direction: "up" | "down") => void;
  onDuplicateBlock: (blockId: number) => void;
  onDeleteBlock: (blockId: number) => void;
  onUpdateBlockTitle: (id: number, title: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPropChange: (id: number, path: (string | number)[], value: any) => void;
  onFocus: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
};

export function BlockContainer({
  block,
  index,
  totalBlocks,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onUpdateBlockTitle,
  onPropChange,
  onFocus,
  onKeyDown,
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
      key={block.blockId}
      value={block.blockId.toString()}
      className="border border-gray-200 rounded-lg bg-white shadow-sm group relative"
      id={`block-${block.blockId}`}
    >
      {/* 트리거는 block.title만 포함 */}
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 rounded-t-lg data-[state=open]:rounded-b-none">
        {isEditingTitle ? (
          <Input
            ref={inputRef}
            value={block.title || ""}
            onChange={(e) => onUpdateBlockTitle(block.blockId, e.target.value)}
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
          <DropdownMenuContent align="end" className="w-48">
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
                onMoveBlock(block.blockId, "up");
              }}
              disabled={index === 0}
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              위로 이동
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMoveBlock(block.blockId, "down");
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
                onDuplicateBlock(block.blockId);
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              복제
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBlock(block.blockId);
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
          <RenderBlockContent
            block={block}
            onPropChange={(path, value) =>
              onPropChange(block.blockId, path, value)
            }
            onFocus={onFocus}
            onKeyDown={onKeyDown}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
