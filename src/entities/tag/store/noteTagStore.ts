import { create } from "zustand";
import { tagApi } from "../api/tagApi";

interface NoteTagState {
  noteTags: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;

  loadNoteTags: (noteId: string) => Promise<void>;
  addTagToNote: (noteId: string, tagId: string) => Promise<void>;
  removeTagFromNote: (noteId: string, tagId: string) => Promise<void>;
}

export const useNoteTagStore = create<NoteTagState>((set) => ({
  noteTags: {},
  isLoading: false,
  error: null,

  loadNoteTags: async (noteId) => {
    set({ isLoading: true, error: null });
    try {
      const tagIds = await tagApi.getTagsByNote(noteId); // string[]
      set((state) => ({
        noteTags: { ...state.noteTags, [noteId]: tagIds },
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: "노트 태그를 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  addTagToNote: async (noteId, tagId) => {
    try {
      await tagApi.addTagToNote(noteId, tagId);
      set((state) => {
        const current = state.noteTags[noteId] || [];
        if (current.includes(tagId)) return {};
        return {
          noteTags: {
            ...state.noteTags,
            [noteId]: [...current, tagId],
          },
        };
      });
    } catch (err) {
      console.error("노트에 태그 추가 실패", err);
    }
  },

  removeTagFromNote: async (noteId, tagId) => {
    try {
      await tagApi.removeTagFromNote(noteId, tagId);
      set((state) => ({
        noteTags: {
          ...state.noteTags,
          [noteId]: (state.noteTags[noteId] || []).filter((id) => id !== tagId),
        },
      }));
    } catch (err) {
      console.error("노트에서 태그 제거 실패", err);
    }
  },
}));
