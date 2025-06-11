"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Notebook, Plus, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useParams, useRouter } from "next/navigation";
import { Note, NoteType } from "@/entities/note/types/note";
import SearchInput from "@/widgets/serchinput/serchInput";
import { getInitialConsonantsWithEsHangul } from "@/shared/utils/hangul";
import styles from "./note-list.module.scss";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────

interface ProcessedNote extends Note {
  titleChosung?: string;
}

const NOTE_TYPES: NoteType[] = ["CHARACTER", "PLACE", "EVENT", "DETAILS"];

const NEW_NOTE_TITLES: Record<NoteType, string> = {
  CHARACTER: "새 캐릭터",
  EVENT: "새 사건",
  PLACE: "새 장소",
  DETAILS: "새 설정",
};

const TYPE_LABELS: Record<NoteType, string> = {
  CHARACTER: "캐릭터",
  EVENT: "사건",
  PLACE: "장소",
  DETAILS: "설정",
};

function getTypeColorClass(type: string): string {
  return (
    {
      CHARACTER: "text-teal-600",
      PLACE: "text-emerald-600",
      DETAILS: "text-purple-600",
      EVENT: "text-orange-600",
    }[type as NoteType] || "text-gray-600"
  );
}

function getTypeName(type: string): string {
  return TYPE_LABELS[type as NoteType] || "뭘까요";
}

// ─────────────────────────────────────────────
// NoteCreateButton 컴포넌트
// ─────────────────────────────────────────────

function NoteCreateButton({
  onSelectType,
}: {
  onSelectType: (type: NoteType) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="text-mint-600 hover:text-mint-700 hover:bg-mint-50"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Plus className="h-4 w-4 mr-1" /> 새 노트
      </Button>
      {open && (
        <div className="absolute z-10 mt-2 w-40 bg-white border rounded-md shadow-md">
          {NOTE_TYPES.map((type) => (
            <button
              key={type}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              onClick={() => {
                setOpen(false);
                onSelectType(type);
              }}
            >
              {getTypeName(type)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// NoteList 메인 컴포넌트
// ─────────────────────────────────────────────

export function NoteList() {
  const { projectId } = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { notes, setCurrentNote, createNote } = useNoteStore();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType | "ALL">(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNote = async (type: NoteType) => {
    if (!projectId) return;
    const newNote = await createNote({
      projectId: projectId as string,
      title: NEW_NOTE_TITLES[type],
      type,
    });
    if (newNote) {
      setSelectedNoteId(newNote.id);
      setCurrentNote(newNote.id);
      router.push(`/project/${projectId}/note/${newNote.id}`);
    }
  };

  const processedNotes = useMemo(() => {
    return notes.map((note) => ({
      ...note,
      titleChosung: getInitialConsonantsWithEsHangul(note.title),
    }));
  }, [notes]);

  const displayedNotes = useMemo(() => {
    const typedNotes =
      selectedNoteType === "ALL"
        ? processedNotes
        : processedNotes.filter((note) => note.type === selectedNoteType);

    if (!searchQuery.trim()) return typedNotes;

    const lowerQuery = searchQuery.toLowerCase();
    const titleMatches = typedNotes.filter((note) =>
      note.title.toLowerCase().includes(lowerQuery)
    );

    const chosungMatches = typedNotes.filter((note) =>
      note.titleChosung?.includes(searchQuery)
    );

    const merged = [...titleMatches];
    chosungMatches.forEach((note) => {
      if (!titleMatches.some((m) => m.id === note.id)) merged.push(note);
    });

    return merged;
  }, [processedNotes, selectedNoteType, searchQuery]);

  return (
    <>
      {/* 모바일 메뉴 토글 */}
      <button
        className="lg:hidden fixed top-24 left-4 z-30 bg-teal-500 text-white p-2 rounded-md shadow-lg"
        onClick={() => setIsOpen(true)}
        style={{ width: "30px", height: "30px" }}
      >
        <Notebook className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          lg:relative lg:translate-x-0 lg:shadow-none lg:bg-transparent lg:z-auto
          fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-4 space-y-4 h-full overflow-y-auto">
          {/* 헤더 - 모바일 */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">노트 목록</h2>
            <NoteCreateButton onSelectType={handleCreateNote} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 헤더 - 데스크탑 */}
          <div className="hidden lg:flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-800">노트 목록</h2>
            <NoteCreateButton onSelectType={handleCreateNote} />
          </div>

          {/* 노트 타입 필터 */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {["ALL", ...NOTE_TYPES].map((type) => (
              <Button
                key={type}
                variant={selectedNoteType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedNoteType(type as NoteType | "ALL")}
              >
                {type === "ALL" ? "전체" : getTypeName(type)}
              </Button>
            ))}
          </div>

          {/* 검색 */}
          <SearchInput<ProcessedNote>
            placeholder={`노트 이름 또는 초성으로 검색...`}
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            data={processedNotes}
            fuseOptions={{
              keys: [
                { name: "title", weight: 0.7 },
                { name: "titleChosung", weight: 0.3 },
              ],
              threshold: 0.4,
              ignoreLocation: true,
            }}
            onSearchResults={() => {}}
            className={styles.customSearchInput}
          />

          {/* 노트 카드 목록 */}
          <div className="space-y-2">
            {displayedNotes.length === 0 ? (
              <div className="text-sm text-gray-400 px-2">
                {searchQuery
                  ? `"${searchQuery}"에 해당하는 노트가 없습니다.`
                  : "노트가 없습니다."}
              </div>
            ) : (
              displayedNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`hover:border-mint-200 cursor-pointer transition-colors ${
                    selectedNoteId === note.id
                      ? "border-mint-400 bg-mint-50"
                      : ""
                  }`}
                  onClick={() => {
                    router.push(`/project/${projectId}/note/${note.id}`);
                    setIsOpen(false);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {note.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          업데이트 날짜 설정 필요
                        </span>
                      </div>
                      <span
                        className={`text-xs ${getTypeColorClass(
                          note.type
                        )} mt-1`}
                      >
                        {getTypeName(note.type)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
