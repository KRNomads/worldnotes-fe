"use client"

import type React from "react"

import { useState } from "react"
import type { Note } from "@/types/note"
import { useNoteStore } from "@/store/noteStore"
import styles from "../characters.module.scss"

interface CharacterNoteListProps {
  notes: Note[]
  selectedNoteId: string | null
  onSelectNote: (noteId: string) => void
  onCreateNote: () => void
}

export default function CharacterNoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
}: CharacterNoteListProps) {
  const { updateNote, deleteNote } = useNoteStore()
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const handleEditStart = (note: Note) => {
    setEditingNoteId(note.id)
    setEditTitle(note.title)
  }

  const handleEditSave = async () => {
    if (editingNoteId && editTitle.trim()) {
      await updateNote(editingNoteId, { title: editTitle.trim() })
      setEditingNoteId(null)
    }
  }

  const handleEditCancel = () => {
    setEditingNoteId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave()
    } else if (e.key === "Escape") {
      handleEditCancel()
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm("정말로 이 캐릭터를 삭제하시겠습니까?")) {
      const success = await deleteNote(noteId)
      if (success && selectedNoteId === noteId) {
        // 삭제된 노트가 현재 선택된 노트라면 다른 노트 선택
        if (notes.length > 1) {
          const nextNote = notes.find((note) => note.id !== noteId)
          if (nextNote) {
            onSelectNote(nextNote.id)
          }
        } else {
          onSelectNote("") // 선택 초기화
        }
      }
    }
  }

  return (
    <div className={styles.noteListContainer}>
      <div className={styles.noteListHeader}>
        <h2>캐릭터 목록</h2>
        <button className={styles.addNoteButton} onClick={onCreateNote} aria-label="새 캐릭터 추가">
          +
        </button>
      </div>

      <ul className={styles.noteList}>
        {notes.length === 0 ? (
          <li className={styles.emptyNote}>캐릭터가 없습니다. 새 캐릭터를 추가해보세요.</li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className={`${styles.noteItem} ${selectedNoteId === note.id ? styles.selectedNote : ""}`}
              onClick={() => onSelectNote(note.id)}
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
                  />
                </div>
              ) : (
                <div className={styles.noteTitleContainer}>
                  <span className={styles.noteTitle}>{note.title}</span>
                  <div className={styles.noteActions}>
                    <button
                      className={styles.editButton}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditStart(note)
                      }}
                      aria-label="캐릭터 이름 수정"
                    >
                      ✎
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNote(note.id)
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
  )
}
