"use client";

import { useState, useEffect } from "react";
import {
  X,
  GripVertical,
  Plus,
  Trash2,
  RotateCcw,
  Palette,
  AlertTriangle,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  COLUMN_TEMPLATES,
  TimeColumn,
  TimelineSettings,
} from "../lib/timeline-utils";
import { TimelineEvent } from "../types/timeline-editor-types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Slider } from "@/shared/ui/slider";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { TemplateSelectionModal } from "./template-selection-modal";
import { BoundaryWarningDialog } from "./boundary-warning-dialog";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimelineSettings;
  onSettingsChange: (settings: TimelineSettings) => void;
  events: TimelineEvent[];
  onEventsChange: (events: TimelineEvent[]) => void;
}

interface SortableColumnItemProps {
  column: TimeColumn;
  index: number;
  onUpdate: (index: number, field: "name" | "subtitle", value: string) => void;
  onDelete: (index: number) => void;
  canDelete: boolean;
  isMobile: boolean;
}

function SortableColumnItem({
  column,
  index,
  onUpdate,
  onDelete,
  canDelete,
  isMobile,
}: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-white border rounded-lg ${
        isDragging ? "shadow-lg opacity-50" : "shadow-sm"
      }`}
    >
      <div className={`flex items-center gap-3 ${isMobile ? "flex-col" : ""}`}>
        <div className={`flex items-center gap-3 ${isMobile ? "w-full" : ""}`}>
          <div
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          <Badge variant="secondary" className="min-w-[50px] text-center">
            {index + 1}
          </Badge>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(index)}
              className="text-gray-400 hover:text-red-500 ml-auto"
              disabled={!canDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div
          className={`${
            isMobile
              ? "w-full grid grid-cols-1 gap-2"
              : "flex-1 grid grid-cols-2 gap-3"
          }`}
        >
          <div>
            <Label className="text-xs text-gray-500">제목</Label>
            <Input
              value={column.name}
              onChange={(e) => onUpdate(index, "name", e.target.value)}
              className="mt-1"
              placeholder="컬럼 제목"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">부제목</Label>
            <Input
              value={column.subtitle}
              onChange={(e) => onUpdate(index, "subtitle", e.target.value)}
              className="mt-1"
              placeholder="컬럼 부제목"
            />
          </div>
        </div>

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index)}
            className="text-gray-400 hover:text-red-500"
            disabled={!canDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  events,
  onEventsChange,
}: SettingsDialogProps) {
  const [localSettings, setLocalSettings] =
    useState<TimelineSettings>(settings);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showBoundaryWarning, setShowBoundaryWarning] = useState(false);
  const [outOfBoundsEvents, setOutOfBoundsEvents] = useState<TimelineEvent[]>(
    []
  );
  const [pendingSettings, setPendingSettings] =
    useState<TimelineSettings | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // 경계를 벗어나는 이벤트들을 확인하는 함수
  const checkOutOfBoundsEvents = (newSettings: TimelineSettings) => {
    const newBoundary = newSettings.columnCount * newSettings.columnWidth;
    const currentBoundary = settings.columnCount * settings.columnWidth;

    // 경계가 줄어들었을 때만 체크
    if (newBoundary >= currentBoundary) {
      return [];
    }

    return events.filter((event) => event.x > newBoundary - 100); // 100px 여유 공간
  };

  const handleSave = () => {
    const outOfBounds = checkOutOfBoundsEvents(localSettings);

    if (outOfBounds.length > 0) {
      setOutOfBoundsEvents(outOfBounds);
      setPendingSettings(localSettings);
      setShowBoundaryWarning(true);
      return;
    }

    // 경계를 벗어나는 이벤트가 없으면 바로 적용
    onSettingsChange(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  const handleBoundaryResolve = (
    action: "relocate" | "compress" | "delete" | "cancel",
    resolvedEvents?: TimelineEvent[]
  ) => {
    if (action === "cancel" || !pendingSettings) {
      setShowBoundaryWarning(false);
      setPendingSettings(null);
      return;
    }

    const newBoundary =
      pendingSettings.columnCount * pendingSettings.columnWidth;
    let updatedEvents = [...events];

    switch (action) {
      case "relocate":
        // 경계를 벗어난 이벤트들을 마지막 컬럼으로 이동
        updatedEvents = events.map((event) => {
          if (outOfBoundsEvents.find((e) => e.id === event.id)) {
            return {
              ...event,
              x: newBoundary - 100, // 마지막 컬럼 근처
              chapter:
                pendingSettings.columns[pendingSettings.columns.length - 1]
                  ?.id || "ch1",
            };
          }
          return event;
        });
        break;

      case "compress":
        // 모든 이벤트를 비례적으로 재배치
        const maxCurrentX = Math.max(...events.map((e) => e.x));
        if (maxCurrentX > 0) {
          const compressionRatio = (newBoundary - 100) / maxCurrentX;
          updatedEvents = events.map((event) => ({
            ...event,
            x: Math.max(50, event.x * compressionRatio), // 최소 50px 여유
          }));
        }
        break;

      case "delete":
        // 경계를 벗어난 이벤트들 삭제
        updatedEvents = events.filter(
          (event) => !outOfBoundsEvents.find((e) => e.id === event.id)
        );
        break;
    }

    onEventsChange(updatedEvents);
    onSettingsChange(pendingSettings);
    setShowBoundaryWarning(false);
    setPendingSettings(null);
    onClose();
  };

  const handleColumnCountChange = (count: number) => {
    const newColumns = [...localSettings.columns];

    if (count > newColumns.length) {
      // 컬럼 추가
      for (let i = newColumns.length; i < count; i++) {
        newColumns.push({
          id: `col${i + 1}`,
          name: `컬럼 ${i + 1}`,
          subtitle: `Column ${i + 1}`,
          position: i,
        });
      }
    } else if (count < newColumns.length) {
      // 컬럼 제거
      newColumns.splice(count);
    }

    setLocalSettings((prev) => ({
      ...prev,
      columnCount: count,
      columns: newColumns,
    }));
  };

  const handleTemplateApply = (templateId: string) => {
    const template = COLUMN_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      const newColumns = template.generator(localSettings.columnCount);
      setLocalSettings((prev) => ({
        ...prev,
        columns: newColumns,
      }));
    }
  };

  const handleColumnUpdate = (
    index: number,
    field: "name" | "subtitle",
    value: string
  ) => {
    const newColumns = [...localSettings.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setLocalSettings((prev) => ({
      ...prev,
      columns: newColumns,
    }));
  };

  const handleColumnAdd = () => {
    const newColumn: TimeColumn = {
      id: `col${localSettings.columns.length + 1}`,
      name: `컬럼 ${localSettings.columns.length + 1}`,
      subtitle: `Column ${localSettings.columns.length + 1}`,
      position: localSettings.columns.length,
    };

    setLocalSettings((prev) => ({
      ...prev,
      columnCount: prev.columnCount + 1,
      columns: [...prev.columns, newColumn],
    }));
  };

  const handleColumnDelete = (index: number) => {
    const newColumns = localSettings.columns
      .filter((_, i) => i !== index)
      .map((col, i) => ({ ...col, position: i }));

    setLocalSettings((prev) => ({
      ...prev,
      columnCount: prev.columnCount - 1,
      columns: newColumns,
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localSettings.columns.findIndex(
        (col) => col.id === active.id
      );
      const newIndex = localSettings.columns.findIndex(
        (col) => col.id === over.id
      );

      const newColumns = arrayMove(
        localSettings.columns,
        oldIndex,
        newIndex
      ).map((col, i) => ({
        ...col,
        position: i,
      }));

      setLocalSettings((prev) => ({
        ...prev,
        columns: newColumns,
      }));
    }
  };

  // 현재 설정과 새 설정 비교해서 경고 표시 여부 결정
  const willCauseBoundaryIssues = () => {
    const newBoundary = localSettings.columnCount * localSettings.columnWidth;
    const currentBoundary = settings.columnCount * settings.columnWidth;
    return (
      newBoundary < currentBoundary &&
      checkOutOfBoundsEvents(localSettings).length > 0
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={`${
            isMobile
              ? "max-w-[95vw] max-h-[95vh] w-full h-full"
              : "max-w-4xl max-h-[90vh]"
          } overflow-hidden flex flex-col p-0 bg-white`}
        >
          <DialogHeader className="p-4 pb-0 border-b border-gray-200">
            <DialogTitle className="flex items-center justify-between">
              타임라인 설정
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div
            className={`flex-1 overflow-hidden ${
              isMobile ? "flex flex-col" : "flex gap-6"
            } p-4`}
          >
            {/* 기본 설정 섹션 */}
            <div
              className={`${isMobile ? "flex-none mb-6" : "w-1/3"} space-y-4`}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">기본 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">컬럼 개수</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[localSettings.columnCount]}
                        onValueChange={([value]) =>
                          handleColumnCountChange(value)
                        }
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1개</span>
                        <span className="font-medium">
                          {localSettings.columnCount}개
                        </span>
                        <span>50개</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">컬럼 간격</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[localSettings.columnWidth]}
                        onValueChange={([value]) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            columnWidth: value,
                          }))
                        }
                        max={400}
                        min={100}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>100px</span>
                        <span className="font-medium">
                          {localSettings.columnWidth}px
                        </span>
                        <span>400px</span>
                      </div>
                    </div>
                  </div>

                  {/* 경계 초과 경고 */}
                  {willCauseBoundaryIssues() && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800">경고</p>
                          <p className="text-amber-700 mt-1">
                            설정 변경으로{" "}
                            {checkOutOfBoundsEvents(localSettings).length}개의
                            이벤트가 경계를 벗어납니다. 저장 시 처리 방법을
                            선택할 수 있습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowTemplateModal(true)}
                      className="w-full"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      템플릿 선택
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 컬럼 편집 섹션 */}
            <div
              className={`${
                isMobile ? "flex-1" : "flex-1"
              } flex flex-col min-h-0`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold">컬럼 편집</h3>
                  <p className="text-sm text-gray-600">
                    각 컬럼의 제목과 부제목을 편집하세요
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleColumnAdd}>
                    <Plus className="h-4 w-4 mr-1" />
                    {isMobile ? "" : "추가"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateApply("custom")}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    {isMobile ? "" : "초기화"}
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 pr-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localSettings.columns.map((col) => col.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {localSettings.columns.map((column, index) => (
                        <SortableColumnItem
                          key={column.id}
                          column={column}
                          index={index}
                          onUpdate={handleColumnUpdate}
                          onDelete={handleColumnDelete}
                          canDelete={localSettings.columns.length > 1}
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </ScrollArea>
            </div>
          </div>

          <div
            className={`flex gap-3 p-4 border-t ${isMobile ? "flex-col" : ""}`}
          >
            <Button onClick={handleSave} className="flex-1">
              적용
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 템플릿 선택 모달 */}
      <TemplateSelectionModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onTemplateSelect={(templateId) => {
          handleTemplateApply(templateId);
          setShowTemplateModal(false);
        }}
        currentColumnCount={localSettings.columnCount}
      />

      {/* 경계 초과 경고 다이얼로그 */}
      <BoundaryWarningDialog
        isOpen={showBoundaryWarning}
        onClose={() => setShowBoundaryWarning(false)}
        outOfBoundsEvents={outOfBoundsEvents}
        newBoundary={
          pendingSettings
            ? pendingSettings.columnCount * pendingSettings.columnWidth
            : 0
        }
        timeColumns={pendingSettings?.columns || []}
        onResolve={handleBoundaryResolve}
      />
    </>
  );
}
