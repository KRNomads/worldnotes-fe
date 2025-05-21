"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useNoteStore } from "@/store/noteStore";
import Sidebar from "@/components/sidebar/sidebar";
import CharacterNoteList from "./components/character-note-list";
import StructuredCharacterEditor from "./components/structured-character-editor";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import styles from "./characters.module.scss";

export default function CharactersPage() {
  const { projectId } = useParams();
  const {
    notes,
    isLoading,
    error,
    fetchNotesByProject,
    createNote,
    getNotesByType,
  } = useNoteStore();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const characterNotes = getNotesByType("CHARACTER", projectId as string);

  useEffect(() => {
    if (projectId) {
      fetchNotesByProject(projectId as string);
    }
  }, [projectId, fetchNotesByProject]);

  useEffect(() => {
    // 노트가 로드되고, 아직 선택된 노트가 없으며, 캐릭터 노트가 존재할 경우 첫번째 노트를 선택
    if (characterNotes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(characterNotes[0].id);
    } else if (characterNotes.length === 0 && selectedNoteId) {
      // 만약 캐릭터 노트가 모두 삭제되어 비어있게 되면 선택된 ID도 초기화
      setSelectedNoteId(null);
    }
  }, [characterNotes, selectedNoteId]);

  const handleCreateCharacter = async () => {
    if (!projectId) return;

    // NoteCreateRequest의 title은 string 타입이므로 "새 캐릭터"는 유효합니다.
    const newNote = await createNote({
      projectId: projectId as string,
      title: "새 캐릭터", // NoteCreateRequest.title은 string
      type: "CHARACTER",
    });

    if (newNote) {
      setSelectedNoteId(newNote.id);
    }
  };

  // JSX 구조 및 클래스명은 원본과 동일하게 유지
  return (
    <div className={styles.pageContainer}>
      <Sidebar
        activeItem="characters"
        isProjectSidebar={true}
        projectId={projectId as string}
      />

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {isLoading && notes.length === 0 ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
              <p>캐릭터 노트를 불러오는 중...</p>
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
              <CharacterNoteList
                notes={characterNotes}
                selectedNoteId={selectedNoteId}
                onSelectNote={setSelectedNoteId}
                onCreateNote={handleCreateCharacter}
              />

              <div className={styles.editorContainer}>
                {selectedNoteId ? (
                  <StructuredCharacterEditor
                    noteId={selectedNoteId}
                    projectId={projectId as string}
                  />
                ) : (
                  <div className={styles.noNoteSelected}>
                    <p>캐릭터를 선택하거나 새로운 캐릭터를 생성해주세요.</p>
                    <button
                      className={styles.createButton}
                      onClick={handleCreateCharacter}
                    >
                      새 캐릭터 생성
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
