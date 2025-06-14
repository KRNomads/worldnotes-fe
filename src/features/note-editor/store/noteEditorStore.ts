import { create } from "zustand";

interface NoteEditorState {
  isLoading: boolean;
  error: string | null;
  focusedBlockId: number | null;
  isDragging: boolean;
  dragOverId: number | null;

  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFocusedBlockId: (id: number | null) => void;
  setIsDragging: (dragging: boolean) => void;
  setDragOverId: (id: number | null) => void;
}

export const useNoteEditorStore = create<NoteEditorState>((set) => ({
  isLoading: false,
  error: null,
  focusedBlockId: null,
  isDragging: false,
  dragOverId: null,

  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFocusedBlockId: (focusedBlockId) => set({ focusedBlockId }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setDragOverId: (dragOverId) => set({ dragOverId }),
}));
