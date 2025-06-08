"use client";

import type { Note } from "@/entities/note/types/note";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useState, useMemo, useEffect, useCallback } from "react";
import SearchInput from "@/widgets/serchinput/serchInput";
import { getInitialConsonantsWithEsHangul } from "@/shared/utils/hangul";
import styles from "./generic-note-list.module.scss"; // 필요시 이름 변경 가능

interface ProcessedNote extends Note {
  titleChosung?: string;
}

interface GenericNoteListProps {
  type: "CHARACTER" | "EVENT" | "PLACE" | "DETAILS";
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
}

export default function GenericNoteList({
  type,
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
}: GenericNoteListProps) {
  const { updateNote, deleteNote } = useNoteStore();

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const typeLabelMap = {
    CHARACTER: "캐릭터",
    EVENT: "사건",
    PLACE: "장소",
    DETAILS: "설정",
  };

  const label = typeLabelMap[type] || "노트";

  const processedNotes: ProcessedNote[] = useMemo(() => {
    return notes.map((note) => ({
      ...note,
      titleChosung: getInitialConsonantsWithEsHangul(note.title),
    }));
  }, [notes]);

  const displayedNotes = useMemo(() => {
    if (!searchQuery.trim()) return processedNotes;

    const titleMatches = processedNotes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const chosungMatches = processedNotes.filter((note) =>
      note.titleChosung?.includes(searchQuery)
    );

    const allMatches = [...titleMatches];
    chosungMatches.forEach((note) => {
      if (!titleMatches.some((match) => match.id === note.id)) {
        allMatches.push(note);
      }
    });

    return allMatches;
  }, [processedNotes, searchQuery]);

  useEffect(() => {
    if (
      editingNoteId &&
      !processedNotes.find((note) => note.id === editingNoteId)
    ) {
      setEditingNoteId(null);
    }
  }, [processedNotes, editingNoteId]);

  const handleEditStart = useCallback((note: ProcessedNote) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (editingNoteId && editTitle.trim()) {
      await updateNote(editingNoteId, { title: editTitle.trim() });
      setEditingNoteId(null);
    } else if (editingNoteId) {
      const originalNote = processedNotes.find((n) => n.id === editingNoteId);
      if (originalNote) setEditTitle(originalNote.title);
      setEditingNoteId(null);
    }
  }, [editingNoteId, editTitle, updateNote, processedNotes]);

  const handleEditCancel = useCallback(() => {
    setEditingNoteId(null);
  }, []);

  const handleKeyDownOnEdit = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleEditSave();
      if (e.key === "Escape") handleEditCancel();
    },
    [handleEditSave, handleEditCancel]
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      if (window.confirm(`정말로 이 ${label}을 삭제하시겠습니까?`)) {
        const success = await deleteNote(noteId);
        if (success && selectedNoteId === noteId) {
          const remaining = notes.filter((n) => n.id !== noteId);
          onSelectNote(remaining.length > 0 ? remaining[0].id : "");
        }
      }
    },
    [deleteNote, selectedNoteId, notes, onSelectNote, label]
  );

  return (
    <div className={styles.noteListContainer}>
      <div className={styles.noteListHeader}>
        <h2>{label} 목록</h2>
        <button
          className={styles.addNoteButton}
          onClick={onCreateNote}
          aria-label={`${label} 추가`}
        >
          +
        </button>
      </div>

      <SearchInput<ProcessedNote>
        placeholder={`${label} 이름 또는 초성으로 검색...`}
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

      <ul className={styles.noteList}>
        {displayedNotes.length === 0 ? (
          <li className={styles.emptyNote}>
            {searchQuery
              ? `"${searchQuery}"에 해당하는 ${label}이 없습니다.`
              : `${label}이 없습니다. 새 ${label}을 추가해보세요.`}
          </li>
        ) : (
          displayedNotes.map((note) => (
            <li
              key={note.id}
              className={`${styles.noteItem} ${
                selectedNoteId === note.id ? styles.selectedNote : ""
              }`}
              onClick={() => {
                if (editingNoteId !== note.id) onSelectNote(note.id);
              }}
            >
              {editingNoteId === note.id ? (
                <div className={styles.editTitleContainer}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleEditSave}
                    onKeyDown={handleKeyDownOnEdit}
                    autoFocus
                    className={styles.editTitleInput}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <div className={styles.noteTitleContainer}>
                  <span className={styles.noteTitle}>{note.title}</span>
                  <div className={styles.noteActions}>
                    <button
                      className={styles.editButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(note);
                      }}
                      aria-label={`${label} 이름 수정`}
                    >
                      ✎
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      aria-label={`${label} 삭제`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>

      {searchQuery && (
        <div className={styles.searchResultInfo}>
          총 {displayedNotes.length}개의 {label}이 검색되었습니다.
        </div>
      )}
    </div>
  );
}
