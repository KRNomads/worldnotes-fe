"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, RotateCcw, Trash2 } from "lucide-react";
import { TimelineEvent } from "../types/timeline-editor-types";
import { TimeColumn } from "../lib/timeline-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Button } from "@/shared/ui/button";

interface BoundaryWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  outOfBoundsEvents: TimelineEvent[];
  newBoundary: number;
  timeColumns: TimeColumn[];
  onResolve: (
    action: "relocate" | "compress" | "delete" | "cancel",
    events?: TimelineEvent[]
  ) => void;
}

export function BoundaryWarningDialog({
  isOpen,
  onClose,
  outOfBoundsEvents,
  newBoundary,
  timeColumns,
  onResolve,
}: BoundaryWarningDialogProps) {
  const [selectedAction, setSelectedAction] = useState<
    "relocate" | "compress" | "delete"
  >("relocate");

  const handleResolve = () => {
    onResolve(selectedAction);
    onClose();
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case "relocate":
        return "경계를 벗어난 이벤트들을 마지막 컬럼으로 이동합니다.";
      case "compress":
        return "모든 이벤트들을 새로운 경계 내에 비례적으로 재배치합니다.";
      case "delete":
        return "경계를 벗어난 이벤트들을 삭제합니다. (복구 불가능)";
      default:
        return "";
    }
  };

  const getPreviewEvents = () => {
    switch (selectedAction) {
      case "relocate":
        return outOfBoundsEvents.map((event) => ({
          ...event,
          x: newBoundary - 100, // 마지막 컬럼 근처로 이동
          chapter: timeColumns[timeColumns.length - 1]?.id || "ch1",
        }));
      case "compress":
        // 비례적 압축 계산
        const maxCurrentX = Math.max(...outOfBoundsEvents.map((e) => e.x));
        return outOfBoundsEvents.map((event) => ({
          ...event,
          x: (event.x / maxCurrentX) * (newBoundary - 100),
        }));
      case "delete":
        return [];
      default:
        return outOfBoundsEvents;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                이벤트 경계 초과 경고
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                컬럼 설정 변경으로 인해 {outOfBoundsEvents.length}개의 이벤트가
                새로운 경계를 벗어납니다.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* 왼쪽: 처리 방법 선택 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                처리 방법을 선택하세요
              </h3>

              <div className="space-y-3">
                {/* 재배치 옵션 */}
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedAction === "relocate"
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedAction("relocate")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ArrowRight className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          마지막 컬럼으로 이동
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          경계를 벗어난 이벤트들을 마지막 컬럼으로 이동합니다.
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          추천
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 압축 옵션 */}
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedAction === "compress"
                      ? "ring-2 ring-green-500 bg-green-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedAction("compress")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <RotateCcw className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          비례적 재배치
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          모든 이벤트를 새로운 경계 내에 비례적으로
                          재배치합니다.
                        </p>
                        <Badge variant="outline" className="mt-2">
                          고급
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 삭제 옵션 */}
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedAction === "delete"
                      ? "ring-2 ring-red-500 bg-red-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedAction("delete")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          이벤트 삭제
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          경계를 벗어난 이벤트들을 완전히 삭제합니다.
                        </p>
                        <Badge variant="destructive" className="mt-2">
                          위험
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>선택된 방법:</strong>{" "}
                  {getActionDescription(selectedAction)}
                </p>
              </div>
            </div>

            {/* 오른쪽: 영향받는 이벤트 목록 및 미리보기 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  영향받는 이벤트
                </h3>
                <Badge variant="outline">{outOfBoundsEvents.length}개</Badge>
              </div>

              <div className="text-sm text-gray-600 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p>
                  <strong>현재 경계:</strong> {newBoundary}px
                </p>
                <p>
                  <strong>최대 이벤트 위치:</strong>{" "}
                  {Math.max(...outOfBoundsEvents.map((e) => e.x))}px
                </p>
              </div>

              <ScrollArea className="h-80 border border-gray-200 rounded-lg">
                <div className="p-4 space-y-3">
                  {outOfBoundsEvents.map((event, index) => {
                    const previewEvent = getPreviewEvents()[index];
                    return (
                      <div
                        key={event.id}
                        className="p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {event.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">현재:</span>
                                <Badge variant="outline" className="text-xs">
                                  X: {Math.round(event.x)}
                                </Badge>
                              </div>
                              {selectedAction !== "delete" && previewEvent && (
                                <div className="flex items-center gap-1">
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-500">
                                    변경 후:
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      selectedAction === "relocate"
                                        ? "bg-blue-100 text-blue-700"
                                        : selectedAction === "compress"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    X: {Math.round(previewEvent.x)}
                                  </Badge>
                                </div>
                              )}
                              {selectedAction === "delete" && (
                                <div className="flex items-center gap-1">
                                  <ArrowRight className="h-3 w-3 text-red-400" />
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    삭제됨
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <Button variant="outline" onClick={() => onResolve("cancel")}>
            설정 변경 취소
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              나중에 처리
            </Button>
            <Button
              onClick={handleResolve}
              variant={selectedAction === "delete" ? "destructive" : "default"}
            >
              {selectedAction === "relocate" && "이동 적용"}
              {selectedAction === "compress" && "재배치 적용"}
              {selectedAction === "delete" && "삭제 적용"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
