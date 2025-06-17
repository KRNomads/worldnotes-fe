"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { GripVertical, X } from "lucide-react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block, TextBlockProperties } from "@/entities/block/types/block";
import { findInfoByKeyInTemplate } from "../utils/getTemplateInfoByKey";
import { AnyTemplate } from "../type/TemplateMap";
import { BlockService } from "@/entities/block/model/blockService";
import { useState, useEffect } from "react";

type BasicInfoItemProps = {
  template: AnyTemplate | undefined;
  block: Block;
  isEditMode: boolean;
  editingField: string | null;
  setEditingField: (key: string | null) => void;
  blockService: BlockService;
};

export function BasicinfoItem({
  template,
  block,
  isEditMode,
  editingField,
  setEditingField,
  blockService,
}: BasicInfoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
  });

  const textProps = block.properties as TextBlockProperties;
  const [localValue, setLocalValue] = useState(textProps.value);

  useEffect(() => {
    setLocalValue(textProps.value);
  }, [textProps.value]);

  const info = template
    ? findInfoByKeyInTemplate(template, block.fieldKey)
    : null;
  if (!info) return null;
  const IconComponent = info.icon;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    const path: (string | number)[] = ["value"];
    if (localValue !== textProps.value) {
      blockService.updateBlockProperties(block.id, path, localValue);
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      handleBlur();
    }
  };

  const removeField = () => {
    blockService.deleteBlock(block.id);
  };

  const displayValue = textProps.value?.trim() || "미입력";
  const isPlaceholder = !textProps.value?.trim();

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {editingField === info.key ? (
        <div className="flex items-center gap-1">
          <div
            className={`px-2 py-1.5 rounded-full text-xs font-medium ${info.color} flex items-center min-w-[80px]`}
          >
            <IconComponent className="h-3 w-3 mr-1" />
            {info.label}:
          </div>
          <Input
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-20 h-6 text-xs border-mint-300 focus:border-mint-500"
            autoFocus
          />
        </div>
      ) : (
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            info.color
          } flex items-center cursor-pointer transition-all ${
            isEditMode
              ? "hover:ring-2 hover:ring-mint-300 hover:ring-offset-1"
              : ""
          } ${isDragging ? "opacity-50 scale-95" : ""} min-w-[80px]`}
          onClick={() => isEditMode && setEditingField(info.key)}
          {...attributes}
          {...listeners}
        >
          {isEditMode && (
            <GripVertical className="h-3 w-3 mr-1 text-gray-400 cursor-grab active:cursor-grabbing" />
          )}
          <IconComponent className="h-3 w-3 mr-1" />
          {info.label}:{" "}
          <span className={isPlaceholder ? "text-gray-400 ml-1" : "ml-1"}>
            {displayValue}
          </span>
          {isEditMode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                removeField();
              }}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
