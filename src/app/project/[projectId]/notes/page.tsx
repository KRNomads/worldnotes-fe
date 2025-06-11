"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useNoteStore } from "@/entities/note/store/noteStore";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";
import styles from "./page.module.scss";
import GenericBlockEditor from "@/widgets/generic-block-editor/generic-block-editor";
import GenericNoteList from "@/widgets/generic-note-list/generic-note-list";
import { NOTE_TYPES, NoteType } from "@/entities/note/types/note";

const NEW_NOTE_TITLES: Record<NoteType, string> = {
  CHARACTER: "새 캐릭터",
  EVENT: "새 사건",
  PLACE: "새 장소",
  DETAILS: "새 설정",
};

export default function NotePage() {
  const { projectId } = useParams();
  const {
    notes,
    isLoading,
    error,
    setCurrentNote,
    fetchNotesByProject,
    createNote,
    getNotesByType,
  } = useNoteStore();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNoteType, setSelectedNoteType] =
    useState<NoteType>("CHARACTER");

  const typedNotes = getNotesByType(selectedNoteType, projectId as string);

  useEffect(() => {
    if (projectId) {
      fetchNotesByProject(projectId as string);
    }
  }, [projectId, fetchNotesByProject]);

  useEffect(() => {
    if (typedNotes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(typedNotes[0].id);
      setCurrentNote(typedNotes[0].id);
    } else if (typedNotes.length === 0 && selectedNoteId) {
      setSelectedNoteId(null);
      setCurrentNote(null);
    }
  }, [typedNotes, selectedNoteId]);

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setCurrentNote(noteId);
  };

  const handleCreateNote = async () => {
    if (!projectId) return;

    const newNote = await createNote({
      projectId: projectId as string,
      title: NEW_NOTE_TITLES[selectedNoteType] || "새 노트",
      type: selectedNoteType,
    });

    if (newNote) {
      setSelectedNoteId(newNote.id);
      setCurrentNote(newNote.id);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* <Sidebar
        activeItem="notes"
        isProjectSidebar={true}
        projectId={projectId as string}
      /> */}

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.typeSelector}>
            <div className="flex gap-2 mb-4">
              {Object.entries(NOTE_TYPES).map(([typeKey, typeLabel]) => (
                <button
                  key={typeKey}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition 
        ${
          selectedNoteType === typeKey
            ? "bg-blue-100 border-blue-500 text-blue-700"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
                  onClick={() => {
                    setSelectedNoteType(typeKey as NoteType);
                    setSelectedNoteId(null);
                  }}
                >
                  {typeLabel}
                </button>
              ))}
            </div>
          </div>

          {isLoading && notes.length === 0 ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
              <p>노트를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>오류가 발생했습니다: {error}</p>
              <button
                className={styles.retryButton}
                onClick={() => fetchNotesByProject(projectId as string)}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className={styles.characterPageLayout}>
              <GenericNoteList
                notes={typedNotes}
                selectedNoteId={selectedNoteId}
                onSelectNote={handleSelectNote}
                onCreateNote={handleCreateNote}
                type={selectedNoteType}
              />

              <div className={styles.editorContainer}>
                {selectedNoteId ? (
                  <GenericBlockEditor
                    key={selectedNoteId}
                    noteId={selectedNoteId}
                    type={selectedNoteType}
                  />
                ) : (
                  <div className={styles.noNoteSelected}>
                    <p>
                      {NOTE_TYPES[selectedNoteType]}를 선택하거나 새로운 노트를
                      생성해주세요.
                    </p>
                    <button
                      className={styles.createButton}
                      onClick={handleCreateNote}
                    >
                      새 노트 생성
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
