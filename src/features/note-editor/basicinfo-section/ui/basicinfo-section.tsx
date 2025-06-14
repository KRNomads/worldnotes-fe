import { Button } from "@/shared/ui/button";
import { Edit3, Plus } from "lucide-react";
import { BasicinfoTemplateSelector } from "./basicinfo-template-selector";
import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { BasicinfoItem } from "./basicinfo-item";
import { BlockService } from "@/entities/block/service/blockService";
import { TEMPLATE_MAP } from "../lib/available-templates";
import { useNoteStore } from "@/entities/note/store/noteStore";

type BasicinfoSectionProps = {
  noteId: string;
};

export function BasicinfoSection({ noteId }: BasicinfoSectionProps) {
  const blockService = useMemo(() => new BlockService(noteId), [noteId]);
  const { currentNote } = useNoteStore();

  const defaultBlocks = blockService.defaultBlocks;

  const template = currentNote?.type
    ? TEMPLATE_MAP[currentNote.type] ?? {}
    : {};

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  // 필드 삭제
  const removeQuickInfoField = (key: string) => {
    // setQuickInfo(quickInfo.filter((info) => info.key !== key));
  };

  // 필드 값 업데이트 왜 안씀>??
  const updateQuickInfoField = (key: string, newValue: string) => {
    // setQuickInfo(
    //   quickInfo.map((info) =>
    //     info.key === key ? { ...info, value: newValue } : info
    //   )
    // );
    // setEditingField(null);
  };

  // 드래그 앤 드롭
  const handleDragEnd = (event: any) => {
    // const { active, over } = event;
    // if (!over) return;
    // if (active.id !== over.id) {
    //   const oldIndex = quickInfo.findIndex((item) => item.key === active.id);
    //   const newIndex = quickInfo.findIndex((item) => item.key === over.id);
    //   setQuickInfo(arrayMove(quickInfo, oldIndex, newIndex));
    // }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">기본 정보</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-gray-500 hover:text-mint-600"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Edit3 className="h-3 w-3 mr-1" />
            {isEditMode ? "완료" : "편집"}
          </Button>
          {isEditMode && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-mint-600 hover:text-mint-700"
                onClick={() => setShowTemplateSelector(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                추가
              </Button>
              <BasicinfoTemplateSelector
                template={template}
                defaultBlocks={defaultBlocks}
                showTemplateSelector={showTemplateSelector}
                setShowTemplateSelector={setShowTemplateSelector}
              />
            </>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={defaultBlocks.map((block) => block.blockId)}
          strategy={rectSortingStrategy}
        >
          <div className="flex gap-2 flex-wrap">
            {defaultBlocks.map((block) => (
              <BasicinfoItem
                key={block.blockId}
                template={template}
                block={block}
                isEditMode={isEditMode}
                editingField={editingField}
                setEditingField={setEditingField}
                updateQuickInfoField={updateQuickInfoField}
                removeQuickInfoField={removeQuickInfoField}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
