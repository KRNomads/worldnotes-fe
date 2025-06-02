"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useNoteStore } from "@/entities/note/store/noteStore";
import Sidebar from "@/widgets/sidebar/sidebar";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";
import styles from "./characters.module.scss";
import TimeLineEditor from "./components/time-line-editor";

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

  const characterNotes = getNotesByType("EVENT", projectId as string);

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
          <TimeLineEditor />
        </div>
      </main>
    </div>
  );
}
