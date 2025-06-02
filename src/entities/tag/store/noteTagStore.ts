import { create } from "zustand";
import { Tag } from "@/entities/tag/types/tag";
import { tagApi } from "@/shared/api/tagApi";
import { useTagStore } from "./tagStore";

interface NoteTagState {
  noteTags: Record<string, Tag[]>; // noteId별 태그 목록
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
      const tags = await tagApi.getTagsByNote(noteId);
      set((state) => ({
        noteTags: { ...state.noteTags, [noteId]: tags },
        isLoading: false,
      }));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

      const allTags = useTagStore.getState().tags; // tagStore 참조
      const newTag = allTags.find((t) => t.id === tagId);
      if (!newTag) return;

      set((state) => {
        const currentTags = state.noteTags[noteId] || [];
        return {
          noteTags: { ...state.noteTags, [noteId]: [...currentTags, newTag] },
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
          [noteId]:
            state.noteTags[noteId]?.filter((tag) => tag.id !== tagId) || [],
        },
      }));
    } catch (err) {
      console.error("노트에서 태그 제거 실패", err);
    }
  },
}));
