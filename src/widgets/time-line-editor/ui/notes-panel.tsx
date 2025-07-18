"use client";

import type React from "react";
import { useState } from "react";
import { X, GripVertical, Trash2, Edit3 } from "lucide-react";
import { TimelineEvent } from "../types/timeline-editor-types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Note } from "@/entities/note/types/note";
import { sampleNotes2, TYPE_LABELS } from "@/entities/note/lib/note-utils";

interface NotesPanelProps {
  onClose: () => void;
  onEventDelete: (eventId: string) => void;
  selectedEvent: string | null;
  events: TimelineEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>>;
}

export function NotesPanel({
  onClose,
  onEventDelete,
  selectedEvent,
  events,
  setEvents,
}: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "edit">("notes");
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const selectedEventData = events.find((e) => e.id === selectedEvent);

  const handleDragStart = (e: React.DragEvent, note: Note) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(note));
  };

  const handleEventEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setActiveTab("edit");
  };

  const handleEventUpdate = () => {
    if (!editingEvent) return;

    setEvents((prev) =>
      prev.map((event) => (event.id === editingEvent.id ? editingEvent : event))
    );
    setEditingEvent(null);
    setActiveTab("notes");
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === "notes" ? "노트 라이브러리" : "이벤트 편집"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === "notes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("notes")}
          >
            노트
          </Button>
          <Button
            variant={activeTab === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("edit")}
            disabled={!selectedEvent}
          >
            편집
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "notes" ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              노트를 타임라인으로 드래그하여 이벤트를 생성하세요
            </p>

            {sampleNotes2.map((note) => (
              <Card
                key={note.id}
                className="cursor-move hover:shadow-md transition-shadow"
                draggable
                onDragStart={(e) => handleDragStart(e, note)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: note.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {note.title}
                        </h3>
                        <GripVertical className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {note.summary}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {TYPE_LABELS[note.type]}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedEventData ? (
              <div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제목
                    </label>
                    <Input
                      value={editingEvent?.title || selectedEventData.title}
                      onChange={(e) =>
                        setEditingEvent((prev) =>
                          prev
                            ? { ...prev, title: e.target.value }
                            : { ...selectedEventData, title: e.target.value }
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      설명
                    </label>
                    <Textarea
                      value={
                        editingEvent?.description ||
                        selectedEventData.description
                      }
                      onChange={(e) =>
                        setEditingEvent((prev) =>
                          prev
                            ? { ...prev, description: e.target.value }
                            : {
                                ...selectedEventData,
                                description: e.target.value,
                              }
                        )
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      색상
                    </label>
                    <div className="flex gap-2">
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
                          className={`w-8 h-8 rounded-full border-2 ${
                            (editingEvent?.color || selectedEventData.color) ===
                            color
                              ? "border-gray-900"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            setEditingEvent((prev) =>
                              prev
                                ? { ...prev, color }
                                : { ...selectedEventData, color }
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={handleEventUpdate} className="flex-1">
                    저장
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onEventDelete(selectedEventData.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                편집할 이벤트를 선택하세요
              </p>
            )}
          </div>
        )}
      </div>

      {/* Selected Event Info */}
      {selectedEventData && activeTab === "notes" && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">선택된 이벤트</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEventEdit(selectedEventData)}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-gray-600 truncate">
            {selectedEventData.title}
          </p>
        </div>
      )}
    </div>
  );
}
