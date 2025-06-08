import { GripVertical, ChevronDown, X, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { Block } from "@/entities/block/types/block";
import RenderBlockContent from "./render-block-content";
import { useRef } from "react";

interface BlockContainerProps {
  block: Block;
  isDragging: number | null;
  dragOverId: number | null;
  onDragStart: (id: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, id: number) => void;
  onDrop: (targetId: number) => void;
  onDragEnd: () => void;
  onToggleCollapse: (id: number) => void;
  onDeleteBlock: (id: number) => void;
  onUpdateBlockTitle: (id: number, title: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPropChange: (id: number, path: (string | number)[], value: any) => void;
  onFocus: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

export const BlockContainer: React.FC<BlockContainerProps> = ({
  block,
  isDragging,
  dragOverId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onToggleCollapse,
  onDeleteBlock,
  onUpdateBlockTitle,
  onPropChange,
  onFocus,
  onKeyDown,
}) => {
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    id: number
  ) => {
    if (dragRef.current) {
      // 임시로 opacity 제거
      dragRef.current.style.opacity = "1";

      const rect = dragRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        dragRef.current,
        rect.width / 2,
        rect.height / 2
      );

      // 원래 상태로 복원
      setTimeout(() => {
        dragRef.current!.style.opacity = "";
      }, 0);
    }

    onDragStart(id);
  };

  return (
    <div
      ref={dragRef}
      className={cn(
        "p-3 rounded-lg border border-transparent hover:border-gray-200 transition-all group",
        isDragging === block.blockId && "opacity-50",
        dragOverId === block.blockId && "border-blue-300 bg-blue-50"
      )}
      onDragOver={(e) => onDragOver(e, block.blockId)}
      onDrop={() => onDrop(block.blockId)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="transition-opacity cursor-pointer"
            onClick={() => onToggleCollapse(block.blockId)}
          >
            {block.isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <input
            type="text"
            className={cn(
              "text-lg font-medium bg-transparent focus:outline-none w-full",
              "text-muted-foreground", // 기본 색상
              block.isCollapsed && "opacity-60" // 접혔을 때만 연하게
            )}
            value={block.title || ""}
            onChange={(e) => onUpdateBlockTitle(block.blockId, e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
            draggable
            onDragStart={(e) => handleDragStart(e, block.blockId)}
            onDragEnd={onDragEnd}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => onDeleteBlock(block.blockId)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 줄 추가 */}
      <div className="border-b border-gray-300 mb-3" />

      {!block.isCollapsed && (
        <RenderBlockContent
          block={block}
          onPropChange={(path, value) =>
            onPropChange(block.blockId, path, value)
          }
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />
      )}
    </div>
  );
};
