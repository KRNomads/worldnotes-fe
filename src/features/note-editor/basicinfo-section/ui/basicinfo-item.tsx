import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { GripVertical, X } from "lucide-react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block, TextBlockProperties } from "@/entities/block/types/block";
import { findInfoByKeyInTemplate } from "../utils/getTemplateInfoByKey";
import { TemplateMap } from "../type/TemplateMap";

type BasicInfoItemProps = {
  template: TemplateMap;
  block: Block;
  isEditMode: boolean;
  editingField: string | null;
  setEditingField: (key: string | null) => void;
  updateQuickInfoField: (key: string, newValue: string) => void;
  removeQuickInfoField: (key: string) => void;
};

export function BasicinfoItem({
  template,
  block,
  isEditMode,
  editingField,
  setEditingField,
  updateQuickInfoField,
  removeQuickInfoField,
}: BasicInfoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.blockId,
  });

  const textProps = block.properties as TextBlockProperties;

  const info = findInfoByKeyInTemplate(template, block.fieldKey);
  if (!info) return null;
  const IconComponent = info.icon;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {editingField === info.key ? (
        <div className="flex items-center gap-1">
          <div
            className={`px-2 py-1.5 rounded-full text-xs font-medium ${info.color} flex items-center`}
          >
            <IconComponent className="h-3 w-3 mr-1" />
            {info.label}:
          </div>
          <Input
            value={textProps.value}
            onChange={(e) => updateQuickInfoField(info.key, e.target.value)}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape")
                setEditingField(null);
            }}
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
          } ${isDragging ? "opacity-50 scale-95" : ""}`}
          onClick={() => isEditMode && setEditingField(info.key)}
          {...attributes}
          {...listeners}
        >
          {isEditMode && (
            <GripVertical className="h-3 w-3 mr-1 text-gray-400 cursor-grab active:cursor-grabbing" />
          )}
          <IconComponent className="h-3 w-3 mr-1" />
          {info.label}: {textProps.value}
          {isEditMode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                removeQuickInfoField(info.key);
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
