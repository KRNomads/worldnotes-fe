"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { Note } from "@/entities/note/types/note";
import { useNoteStore } from "@/entities/note/store/noteStore";
import styles from "../characters.module.scss";

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

  // 선택된 노트가 변경되거나 편집 중인 노트가 사라지면 편집 상태 초기화
  useEffect(() => {
    if (editingNoteId && !notes.find((note) => note.id === editingNoteId)) {
      setEditingNoteId(null);
    }
  }, [notes, editingNoteId]);

  const handleEditStart = (note: Note) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title); // Note.title은 string
  };

  const handleEditSave = async () => {
    if (editingNoteId && editTitle.trim()) {
      // NoteUpdateRequest.title은 string
      await updateNote(editingNoteId, { title: editTitle.trim() });
      setEditingNoteId(null);
    } else if (editingNoteId) {
      // 제목이 비어있다면 편집 취소 (혹은 기존 제목으로 복원)
      const originalNote = notes.find((note) => note.id === editingNoteId);
      if (originalNote) {
        setEditTitle(originalNote.title);
      }
      setEditingNoteId(null);
    }
  };

  const handleEditCancel = () => {
    setEditingNoteId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm("정말로 이 캐릭터를 삭제하시겠습니까?")) {
      const success = await deleteNote(noteId);
      if (success && selectedNoteId === noteId) {
        if (notes.length > 0) {
          // 삭제 후 남은 노트가 있다면
          const firstValidNote = notes.find((note) => note.id !== noteId);
          onSelectNote(firstValidNote ? firstValidNote.id : ""); // 다른 노트 선택 또는 초기화
        } else {
          onSelectNote(""); // 모든 노트 삭제 시 선택 초기화
        }
      }
    }
  };

  // JSX 구조 및 클래스명은 원본과 동일하게 유지
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
      <ul className={styles.noteList}>
        {notes.length === 0 ? (
          <li className={styles.emptyNote}>
            캐릭터가 없습니다. 새 캐릭터를 추가해보세요.
          </li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className={`${styles.noteItem} ${
                selectedNoteId === note.id ? styles.selectedNote : ""
              }`}
              onClick={() => {
                if (editingNoteId !== note.id) {
                  // 현재 다른 노트를 편집 중이 아니라면 노트 선택
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
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={styles.editTitleInput}
                    onClick={(e) => e.stopPropagation()} // li의 onClick 방지
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
    </div>
  );
}
