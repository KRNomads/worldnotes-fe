import { GripVertical, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { Block } from "@/shared/types/block";
import RenderBlockContent from "./render-block-content";

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
  onPropChange: (id: number, path: (string | number)[], value: any) => void;
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
}) => {
  return (
    <div
      key={block.blockId}
      className={cn(
        "p-4 rounded-lg border border-transparent hover:border-gray-200 transition-all group",
        isDragging === block.blockId && "opacity-50",
        dragOverId === block.blockId && "border-blue-300 bg-blue-50",
        block.isCollapsed && "bg-gray-50"
      )}
      draggable
      onDragStart={() => onDragStart(block.blockId)}
      onDragOver={(e) => onDragOver(e, block.blockId)}
      onDrop={() => onDrop(block.blockId)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="transition-opacity"
            onClick={() => onToggleCollapse(block.blockId)}
          >
            {block.isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <input
            type="text"
            className="text-sm font-medium text-muted-foreground bg-transparent focus:outline-none w-full"
            value={block.title || ""}
            onChange={(e) => onUpdateBlockTitle(block.blockId, e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDeleteBlock(block.blockId)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <RenderBlockContent
        block={block}
        onPropChange={(path, value) => onPropChange(block.blockId, path, value)}
      />
    </div>
  );
};
