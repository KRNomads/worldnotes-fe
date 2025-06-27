"use client";

import type React from "react";
import { useState, useMemo } from "react";
import {
  X,
  Search,
  SortDesc,
  User,
  Package,
  Settings,
  Zap,
  MapPin,
  GripVertical,
} from "lucide-react";
import { TimelineEvent } from "../types/timeline-editor-types";
import {
  filterNotes,
  NOTE_COLORS,
  sampleNotes,
  sortNotes,
  TYPE_LABELS,
} from "../../../entities/note/lib/note-utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Card, CardContent } from "@/shared/ui/card";
import { Note, NoteType } from "@/entities/note/types/note";

interface EnhancedNotesPanelProps {
  onClose: () => void;
  onEventDelete: (eventId: string) => void;
  selectedEvent: string | null;
  events: TimelineEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>>;
}

const categoryIcons = {
  CHARACTER: User,
  ITEM: Package,
  DETAILS: Settings,
  EVENT: Zap,
  PLACE: MapPin,
};

const sortOptions = [
  { label: "최근수정순", value: "updatedAt" as const },
  { label: "만든날짜순", value: "createdAt" as const },
  { label: "이름순", value: "title" as const },
];

export function EnhancedNotesPanel({
  onClose,
  onEventDelete,
  selectedEvent,
  events,
  setEvents,
}: EnhancedNotesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NoteType | "전체">(
    "전체"
  );
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "title">(
    "updatedAt"
  );
  const [activeTab, setActiveTab] = useState<"notes" | "edit">("notes");
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const selectedEventData = events.find((e) => e.id === selectedEvent);

  // 노트 필터링 및 정렬
  const displayedNotes = useMemo(() => {
    const filtered = filterNotes(sampleNotes, searchQuery, selectedCategory);
    return sortNotes(filtered, sortBy);
  }, [searchQuery, selectedCategory, sortBy]);

  // 카테고리별 노트 개수
  const getCategoryCount = (category: NoteType | "전체") => {
    if (category === "전체") return sampleNotes.length;
    return sampleNotes.filter((note) => note.type === category).length;
  };

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
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
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
      <div className="flex-1 overflow-hidden">
        {activeTab === "notes" ? (
          <div className="h-full flex flex-col">
            {/* Controls */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="노트 검색 (초성 검색 가능)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Tabs */}
              <Tabs
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                  <TabsTrigger
                    value="전체"
                    className="text-xs px-2 py-2 flex flex-col gap-1"
                  >
                    <span>전체</span>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryCount("전체")}
                    </Badge>
                  </TabsTrigger>
                  {(Object.keys(categoryIcons) as NoteType[])
                    .slice(0, 2)
                    .map((category) => {
                      const IconComponent = categoryIcons[category];
                      return (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="text-xs px-1 py-2 flex flex-col gap-1"
                        >
                          <IconComponent className="h-3 w-3" />
                          <span>{TYPE_LABELS[category]}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryCount(category)}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                </TabsList>
              </Tabs>

              {/* More Categories */}
              <Tabs
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                  {(Object.keys(categoryIcons) as NoteType[])
                    .slice(2)
                    .map((category) => {
                      const IconComponent = categoryIcons[category];
                      return (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="text-xs px-1 py-2 flex flex-col gap-1"
                        >
                          <IconComponent className="h-3 w-3" />
                          <span>{TYPE_LABELS[category]}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryCount(category)}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                </TabsList>
              </Tabs>

              {/* Sort and Count */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {displayedNotes.length}개의 노트
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs flex items-center gap-1"
                    >
                      <SortDesc className="h-3 w-3" />
                      {
                        sortOptions.find((option) => option.value === sortBy)
                          ?.label
                      }
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        className="text-xs cursor-pointer"
                        onClick={() => setSortBy(option.value)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Notes List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {displayedNotes.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-8">
                    {searchQuery
                      ? `"${searchQuery}"에 해당하는 노트가 없습니다.`
                      : "노트가 없습니다."}
                  </div>
                ) : (
                  displayedNotes.map((note) => {
                    const IconComponent = categoryIcons[note.type];
                    return (
                      <Card
                        key={note.id}
                        className="cursor-move hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e, note)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <IconComponent
                              className="h-4 w-4 mt-1 flex-shrink-0"
                              style={{ color: NOTE_COLORS[note.type] }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {note.title}
                                </h3>
                                <GripVertical className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {note.summary}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="secondary"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: `${
                                      NOTE_COLORS[note.type]
                                    }20`,
                                    color: NOTE_COLORS[note.type],
                                  }}
                                >
                                  {TYPE_LABELS[note.type]}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    note.updatedAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          // Edit Tab Content (기존 편집 기능 유지)
          <div className="p-4 space-y-4">
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
                  {/* 나머지 편집 필드들... */}
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
                    <X className="h-4 w-4" />
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
              <Settings className="h-3 w-3" />
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
