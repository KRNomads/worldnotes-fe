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
  return (
    <div className="group relative">
      <Badge
        className="text-sm font-medium px-3 py-1 rounded-full border-2 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105 hover:brightness-95"
        style={{
          backgroundColor: tag.color,
          color: "white",
          borderColor: tag.color,
        }}
        onClick={onClick}
      >
        {tag.name}
        {removable && (
          <span className="inline-flex items-center justify-center ml-1 transition-transform duration-300 ease-in-out group-hover:rotate-90">
            <X className="h-3 w-3" />
          </span>
        )}
      </Badge>

      {removable && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
          클릭하여 제거
        </div>
      )}
    </div>
  );
}
