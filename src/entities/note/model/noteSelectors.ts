// src/entities/note/model/noteSelectors.ts

import { useNoteStore } from "../store/noteStore";

// Notes 전체
export const useNotes = () => useNoteStore((state) => state.notes);

// 현재 선택된 노트
export const useCurrentNote = () => useNoteStore((state) => state.currentNote);

// 로딩 여부
export const useNoteLoading = () => useNoteStore((state) => state.isLoading);

// 에러 메시지
export const useNoteError = () => useNoteStore((state) => state.error);

// 특정 타입 노트 리스트
export const useNotesByType = (type: string, projectId?: string) =>
  useNoteStore((state) =>
    state.notes
      .filter(
        (n) => n.type === type && (!projectId || n.projectId === projectId)
      )
      .sort((a, b) => a.position - b.position)
  );
