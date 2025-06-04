"use client";

import { Tag } from "@/entities/tag/types/tag";
import { Badge } from "@/shared/ui/badge";
import { X } from "lucide-react";

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  removable?: boolean;
}

export function TagBadge({ tag, onClick, removable = false }: TagBadgeProps) {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    onClick?.();
  };

  return (
    <div className="relative">
      <Badge
        className="text-sm font-medium px-3 py-1 rounded-full border-2 cursor-default hover:shadow-md hover:scale-105 hover:brightness-95 transition-all duration-300 ease-in-out flex items-center"
        style={{
          backgroundColor: tag.color,
          color: "white",
          borderColor: tag.color,
        }}
      >
        {tag.name}
        {removable && (
          <span className="relative group ml-1 cursor-pointer">
            <X
              className="h-3 w-3 transition-transform duration-300 ease-in-out group-hover:rotate-90"
              onClick={handleRemoveClick}
            />
            {/* 툴팁 - X 위에만 표시 */}
            <div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-3 
             opacity-0 group-hover:opacity-100 
             transition-opacity duration-300 
             bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-[100]
             pointer-events-none"
            >
              클릭하여 제거
            </div>
          </span>
        )}
      </Badge>
    </div>
  );
}
