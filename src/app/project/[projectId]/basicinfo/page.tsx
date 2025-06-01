"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import styles from "./basicinfo.module.scss";
import Sidebar from "@/components/sidebar/sidebar";
import { useProjectStore } from "@/store/projectStore";
import { useNoteStore } from "@/store/noteStore";
import { useBlockStore } from "@/store/blockStore";
import { NOTE_TYPES } from "@/shared/types/note";
import type { TextBlockProperties, Block } from "@/shared/types/block";

export function useDebounceCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return debounced;
}

const BasicInfoPage = () => {
  const { projectId } = useParams() as { projectId: string };

  const { currentProject, fetchProject, updateProject } = useProjectStore();
  const { getNotesByType, fetchNotesByProject, createNote } = useNoteStore();
  const { fetchBlocksByNote, createBlock, updateBlock, blocksByNoteId } =
    useBlockStore();

  const [formData, setFormData] = useState({ projectTitle: "", genre: "" });
  const [saving, setSaving] = useState<null | "title" | "genre">(null);
  const [error, setError] = useState<string | null>(null);

  const basicInfoNote = useMemo(
    () => getNotesByType(NOTE_TYPES.BASIC_INFO, projectId)[0],
    [projectId, getNotesByType]
  );
  const blocks = basicInfoNote ? blocksByNoteId[basicInfoNote.id] || [] : [];

  const genreBlock = blocks.find(
    (b) => (b.fieldKey === "genre" || b.title === "genre") && b.type === "TEXT"
  );

  // 초기 데이터 로드
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchNotesByProject(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (basicInfoNote?.id) fetchBlocksByNote(basicInfoNote.id);
  }, [basicInfoNote?.id]);

  useEffect(() => {
    if (currentProject?.title) {
      setFormData((prev) => ({ ...prev, projectTitle: currentProject.title }));
    }
  }, [currentProject?.title]);

  useEffect(() => {
    const genre = (genreBlock?.properties as TextBlockProperties)?.value || "";
    setFormData((prev) => ({ ...prev, genre }));
  }, [genreBlock]);

  // 자동 저장
  const debouncedSaveTitle = useDebounceCallback(async (title: string) => {
    if (!projectId || title === currentProject?.title) return;
    try {
      setSaving("title");
      await updateProject(projectId, { title });
    } catch (e) {
      setError("작품 제목 저장 실패");
    } finally {
      setSaving(null);
    }
  }, 1000);

  const debouncedSaveGenre = useDebounceCallback(async (genre: string) => {
    if (!projectId) return;

    try {
      setSaving("genre");

      let noteId = basicInfoNote?.id;
      if (!noteId) {
        const newNote = await createNote({
          projectId,
          title: "기본 정보",
          type: NOTE_TYPES.BASIC_INFO,
        });
        if (!newNote) throw new Error("노트 생성 실패");
        noteId = newNote.id;
      }

      const props: TextBlockProperties = { type: "TEXT", value: genre };

      if (genreBlock) {
        await updateBlock(genreBlock.blockId, noteId, {
          title: "genre",
          type: "TEXT",
          properties: props,
        });
      } else {
        await createBlock({
          noteId,
          title: "genre",
          type: "TEXT",
          fieldKey: "genre",
          properties: props,
        });
      }
    } catch (e) {
      setError("장르 저장 실패");
    } finally {
      setSaving(null);
    }
  }, 1000);

  useEffect(() => {
    if (formData.projectTitle) debouncedSaveTitle(formData.projectTitle);
  }, [formData.projectTitle]);

  useEffect(() => {
    debouncedSaveGenre(formData.genre);
  }, [formData.genre]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <Sidebar
        activeItem="basicinfo"
        isProjectSidebar={true}
        projectId={projectId}
      />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>기본정보</h1>
          {saving && (
            <span>{saving === "title" ? "제목" : "장르"} 저장 중...</span>
          )}
        </div>

        <form
          className={styles.formContainer}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.formField}>
            <label htmlFor="projectTitle" className={styles.fieldLabel}>
              작품 제목
            </label>
            <input
              id="projectTitle"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              className={styles.inputField}
              placeholder="작품 제목을 입력하세요"
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="genre" className={styles.fieldLabel}>
              장르
            </label>
            <input
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className={styles.inputField}
              placeholder="장르를 입력하세요 (예: 판타지)"
            />
          </div>
        </form>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

export default BasicInfoPage;
