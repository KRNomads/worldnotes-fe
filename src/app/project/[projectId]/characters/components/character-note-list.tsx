"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { Note } from "@/entities/note/types/note";
import { useNoteStore } from "@/entities/note/store/noteStore";
import SearchInput from "@/widgets/serchinput/serchInput";
import styles from "../characters.module.scss";
import { getInitialConsonantsWithEsHangul } from "@/shared/utils/hangul";

interface ProcessedNote extends Note {
  titleChosung?: string;
}

interface CharacterNoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
}

export default function CharacterNoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
}: CharacterNoteListProps) {
  const { updateNote, deleteNote } = useNoteStore();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const processedNotes: ProcessedNote[] = useMemo(() => {
    return notes.map((note) => ({
      ...note,
      titleChosung: getInitialConsonantsWithEsHangul(note.title),
    }));
  }, [notes]);

  // 검색 결과를 직접 계산하여 동기적으로 처리
  const displayedNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return processedNotes;
    }

    // 제목으로 검색
    const titleMatches = processedNotes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 초성으로 검색
    const chosungMatches = processedNotes.filter((note) =>
      note.titleChosung?.includes(searchQuery)
    );

    // 중복 제거하여 결과 합치기
    const allMatches = [...titleMatches];
    chosungMatches.forEach((note) => {
      if (!titleMatches.some((match) => match.id === note.id)) {
        allMatches.push(note);
      }
    });

    return allMatches;
  }, [processedNotes, searchQuery]);

  const fuseOptions = useMemo(
    () => ({
      keys: [
        { name: "title", weight: 0.7 },
        { name: "titleChosung", weight: 0.3 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
    }),
    []
  );

  useEffect(() => {
    if (
      editingNoteId &&
      !processedNotes.find((note) => note.id === editingNoteId)
    ) {
      setEditingNoteId(null);
    }
  }, [processedNotes, editingNoteId]);

  const handleSearchQueryChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // SearchInput 컴포넌트를 위한 빈 핸들러 (실제로는 useMemo로 계산)
  const handleSearchResults = useCallback((results: ProcessedNote[]) => {
    // 이제 사용하지 않음 - useMemo로 동기적으로 계산
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleEditStart = useCallback((note: ProcessedNote) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (editingNoteId && editTitle.trim()) {
      await updateNote(editingNoteId, { title: editTitle.trim() });
      setEditingNoteId(null);
    } else if (editingNoteId) {
      const originalNote = processedNotes.find(
        (note) => note.id === editingNoteId
      );
      if (originalNote) {
        setEditTitle(originalNote.title);
      }
      setEditingNoteId(null);
    }
  }, [editingNoteId, editTitle, processedNotes, updateNote]);

  const handleEditCancel = useCallback(() => {
    setEditingNoteId(null);
  }, []);

  const handleKeyDownOnEdit = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEditSave();
      } else if (e.key === "Escape") {
        handleEditCancel();
      }
    },
    [handleEditSave, handleEditCancel]
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      if (window.confirm("정말로 이 캐릭터를 삭제하시겠습니까?")) {
        const success = await deleteNote(noteId);
        if (success && selectedNoteId === noteId) {
          const remainingOriginalNotes = notes.filter(
            (note) => note.id !== noteId
          );
          if (remainingOriginalNotes.length > 0) {
            onSelectNote(remainingOriginalNotes[0].id);
          } else {
            onSelectNote("");
          }
        }
      }
    },
    [deleteNote, selectedNoteId, notes, onSelectNote]
  );

  return (
    <div className={styles.noteListContainer}>
      <div className={styles.noteListHeader}>
        <h2>캐릭터 목록</h2>
        <button
          className={styles.addNoteButton}
          onClick={onCreateNote}
          aria-label="새 캐릭터 추가"
        >
          +
        </button>
      </div>

      <SearchInput<ProcessedNote>
        placeholder="캐릭터 이름 또는 초성으로 검색..."
        value={searchQuery}
        onChange={handleSearchQueryChange}
        onClear={handleSearchClear}
        data={processedNotes}
        fuseOptions={fuseOptions}
        onSearchResults={handleSearchResults}
        className={styles.customSearchInput}
      />

      <ul className={styles.noteList}>
        {displayedNotes.length === 0 ? (
          <li className={styles.emptyNote}>
            {searchQuery
              ? `"${searchQuery}"에 해당하는 캐릭터가 없습니다.`
              : "캐릭터가 없습니다. 새 캐릭터를 추가해보세요."}
          </li>
        ) : (
          displayedNotes.map((note) => (
            <li
              key={note.id}
              className={`${styles.noteItem} ${
                selectedNoteId === note.id ? styles.selectedNote : ""
              }`}
              onClick={() => {
                if (editingNoteId !== note.id) {
                  console.log("Clicking note:", note.title, note.id); // 디버깅용
                  onSelectNote(note.id);
                }
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
                      aria-label="캐릭터 이름 수정"
                    >
                      ✎
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      aria-label="캐릭터 삭제"
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
          총 {displayedNotes.length}개의 캐릭터가 검색되었습니다.
        </div>
      )}
    </div>
  );
}
