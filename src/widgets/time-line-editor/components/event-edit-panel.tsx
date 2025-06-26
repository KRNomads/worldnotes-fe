"use client";
import { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Link,
  User,
  Package,
  Settings,
  Zap,
  MapPin,
} from "lucide-react";
import { NoteLinkModal } from "./note-link-modal";
import { TimelineEvent } from "../types/timeline-editor-types";
import { NOTE_COLORS, sampleNotes, TYPE_LABELS } from "../lib/note-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";

interface EventEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: TimelineEvent;
  onEventUpdate: (event: TimelineEvent) => void;
  onEventDelete: (eventId: string) => void;
}

const categoryIcons = {
  CHARACTER: User,
  ITEM: Package,
  DETAILS: Settings,
  EVENT: Zap,
  PLACE: MapPin,
};

export function EventEditPanel({
  isOpen,
  onClose,
  event,
  onEventUpdate,
  onEventDelete,
}: EventEditPanelProps) {
  const [editedEvent, setEditedEvent] = useState<TimelineEvent>(event);
  const [showNoteLinkModal, setShowNoteLinkModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setEditedEvent(event);
  }, [event]);

  const handleSave = () => {
    onEventUpdate(editedEvent);
    onClose();
  };

  const handleCancel = () => {
    setEditedEvent(event);
    onClose();
  };

  const handleDelete = () => {
    if (confirm("이 이벤트를 삭제하시겠습니까?")) {
      onEventDelete(event.id);
      onClose();
    }
  };

  const linkedNotes = sampleNotes.filter((note) =>
    editedEvent.linkedNotes?.includes(note.id)
  );

  const unlinkNote = (noteId: string) => {
    setEditedEvent((prev) => ({
      ...prev,
      linkedNotes: prev.linkedNotes?.filter((id) => id !== noteId) || [],
    }));
  };

  const handleNotesUpdate = (noteIds: string[]) => {
    setEditedEvent((prev) => ({
      ...prev,
      linkedNotes: noteIds,
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={`${
            isMobile
              ? "max-w-[95vw] max-h-[95vh] w-full h-full"
              : "max-w-2xl max-h-[90vh]"
          } overflow-hidden flex flex-col p-0 bg-white`}
        >
          {/* Header */}
          <DialogHeader className="p-4 pb-0 border-b border-gray-200">
            <DialogTitle className="flex items-center justify-between text-lg">
              이벤트 편집
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                  기본 정보
                </h3>

                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    제목
                  </Label>
                  <Input
                    id="title"
                    value={editedEvent.title}
                    onChange={(e) =>
                      setEditedEvent((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="mt-1"
                    placeholder="이벤트 제목을 입력하세요"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    설명
                  </Label>
                  <Textarea
                    id="description"
                    value={editedEvent.description}
                    onChange={(e) =>
                      setEditedEvent((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-1"
                    placeholder="이벤트에 대한 자세한 설명을 입력하세요"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">색상</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[
                      "#3b82f6",
                      "#ef4444",
                      "#10b981",
                      "#f59e0b",
                      "#8b5cf6",
                      "#6b7280",
                    ].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          editedEvent.color === color
                            ? "border-gray-900 scale-110"
                            : "border-gray-300 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setEditedEvent((prev) => ({ ...prev, color }))
                        }
                      />
                    ))}
                  </div>
                </div>

              </div>

              {/* Linked Notes Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-semibold text-gray-900">
                    연결된 노트 ({linkedNotes.length}개)
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNoteLinkModal(true)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Link className="h-4 w-4 mr-1" />
                    노트 연결
                  </Button>
                </div>

                <div className="space-y-2">
                  {linkedNotes.map((note) => {
                    const IconComponent = categoryIcons[note.type];
                    return (
                      <div
                        key={note.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <IconComponent className="h-4 w-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {note.title}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{
                                backgroundColor: `${NOTE_COLORS[note.type]}20`,
                                color: NOTE_COLORS[note.type],
                              }}
                            >
                              {TYPE_LABELS[note.type]}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {note.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => unlinkNote(note.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}

                  {linkedNotes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Link className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm">연결된 노트가 없습니다</p>
                      <p className="text-xs text-gray-400 mt-1">
                        노트를 연결하여 이벤트를 더 풍부하게 만들어보세요
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-between p-4 border-t border-gray-200">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className={isMobile ? "flex-1 mr-2" : ""}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
            <div className={`flex gap-2 ${isMobile ? "flex-1" : ""}`}>
              <Button
                variant="outline"
                onClick={handleCancel}
                className={isMobile ? "flex-1" : ""}
              >
                취소
              </Button>
              <Button onClick={handleSave} className={isMobile ? "flex-1" : ""}>
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Link Modal */}
      <NoteLinkModal
        isOpen={showNoteLinkModal}
        onClose={() => setShowNoteLinkModal(false)}
        linkedNoteIds={editedEvent.linkedNotes || []}
        onNotesUpdate={handleNotesUpdate}
      />
    </>
  );
}
