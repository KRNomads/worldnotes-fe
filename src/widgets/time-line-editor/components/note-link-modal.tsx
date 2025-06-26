"use client";

import React from "react";
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
  Link,
  Unlink,
} from "lucide-react";
import {
  filterNotes,
  NOTE_COLORS,
  NoteType,
  sampleNotes,
  sortNotes,
  TYPE_LABELS,
} from "../lib/note-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Card, CardContent } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";

interface NoteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedNoteIds: string[];
  onNotesUpdate: (noteIds: string[]) => void;
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

export function NoteLinkModal({
  isOpen,
  onClose,
  linkedNoteIds,
  onNotesUpdate,
}: NoteLinkModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NoteType | "전체">(
    "전체"
  );
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "title">(
    "updatedAt"
  );
  const [tempLinkedIds, setTempLinkedIds] = useState<string[]>(linkedNoteIds);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    setTempLinkedIds(linkedNoteIds);
  }, [linkedNoteIds]);

  // 노트 필터링 및 정렬
  const displayedNotes = useMemo(() => {
    const filtered = filterNotes(sampleNotes, searchQuery, selectedCategory);
    return sortNotes(filtered, sortBy);
  }, [searchQuery, selectedCategory, sortBy]);

  const linkedNotes = sampleNotes.filter((note) =>
    tempLinkedIds.includes(note.id)
  );

  // 카테고리별 노트 개수
  const getCategoryCount = (category: NoteType | "전체") => {
    if (category === "전체") return sampleNotes.length;
    return sampleNotes.filter((note) => note.type === category).length;
  };

  const handleNoteToggle = (noteId: string) => {
    setTempLinkedIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleSave = () => {
    onNotesUpdate(tempLinkedIds);
    onClose();
  };

  const handleCancel = () => {
    setTempLinkedIds(linkedNoteIds);
    onClose();
  };

  const handleSelectAll = () => {
    const allIds = displayedNotes.map((note) => note.id);
    const newLinkedIds = [...new Set([...tempLinkedIds, ...allIds])];
    setTempLinkedIds(newLinkedIds);
  };

  const handleDeselectAll = () => {
    const displayedIds = displayedNotes.map((note) => note.id);
    setTempLinkedIds((prev) => prev.filter((id) => !displayedIds.includes(id)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isMobile
            ? "max-w-[95vw] max-h-[95vh] w-full h-full"
            : "max-w-5xl max-h-[90vh]"
        } overflow-hidden flex flex-col p-0 bg-white`}
      >
        {/* Header */}
        <DialogHeader className="p-4 pb-0 border-b border-gray-200">
          <DialogTitle className="flex items-center justify-between text-lg">
            노트 연결 관리
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div
          className={`flex-1 overflow-hidden ${
            isMobile ? "flex flex-col" : "flex"
          }`}
        >
          {/* Left Panel - Linked Notes */}
          <div
            className={`${
              isMobile ? "flex-none" : "w-1/3"
            } border-r border-gray-200 flex flex-col`}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                연결된 노트 ({linkedNotes.length}개)
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {linkedNotes.map((note) => {
                  const IconComponent = categoryIcons[note.type];
                  return (
                    <div
                      key={note.id}
                      className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <IconComponent
                        className="h-4 w-4"
                        style={{ color: NOTE_COLORS[note.type] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {note.title}
                          </span>
                        </div>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleNoteToggle(note.id)}
                        className="h-6 w-6 text-blue-600 hover:text-red-500"
                      >
                        <Unlink className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
                {linkedNotes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Link className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">연결된 노트가 없습니다</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Available Notes */}
          <div className={`${isMobile ? "flex-1" : "w-2/3"} flex flex-col`}>
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  노트 라이브러리
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    전체 선택
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="text-xs"
                  >
                    선택 해제
                  </Button>
                </div>
              </div>

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
                <TabsList
                  className={`grid w-full ${
                    isMobile ? "grid-cols-3" : "grid-cols-6"
                  } h-auto p-1`}
                >
                  <TabsTrigger
                    value="전체"
                    className={`text-xs ${
                      isMobile ? "px-2 py-1" : "px-3 py-2"
                    }`}
                  >
                    전체
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {getCategoryCount("전체")}
                    </Badge>
                  </TabsTrigger>
                  {Object.entries(categoryIcons).map(
                    ([category, IconComponent]) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className={`text-xs ${
                          isMobile ? "px-1 py-1 flex-col gap-1" : "px-2 py-2"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-1 ${
                            isMobile ? "flex-col" : ""
                          }`}
                        >
                          <IconComponent className="h-3 w-3" />
                          {!isMobile && (
                            <span>{TYPE_LABELS[category as NoteType]}</span>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryCount(category as NoteType)}
                          </Badge>
                        </div>
                        {isMobile && (
                          <span className="text-xs">
                            {TYPE_LABELS[category as NoteType]}
                          </span>
                        )}
                      </TabsTrigger>
                    )
                  )}
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
                {displayedNotes.map((note) => {
                  const IconComponent = categoryIcons[note.type];
                  const isLinked = tempLinkedIds.includes(note.id);
                  return (
                    <Card
                      key={note.id}
                      className={`cursor-pointer transition-all ${
                        isLinked
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => handleNoteToggle(note.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isLinked}
                            onChange={() => handleNoteToggle(note.id)}
                          />
                          <IconComponent
                            className="h-4 w-4 mt-1"
                            style={{ color: NOTE_COLORS[note.type] }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {note.title}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {note.description}
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
                                {new Date(note.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {displayedNotes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">
                      {searchQuery
                        ? "검색 결과가 없습니다"
                        : selectedCategory === "전체"
                        ? "노트가 없습니다"
                        : `${
                            TYPE_LABELS[selectedCategory as NoteType]
                          } 카테고리에 노트가 없습니다`}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {tempLinkedIds.length}개의 노트가 연결됩니다
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button onClick={handleSave}>연결 저장</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
