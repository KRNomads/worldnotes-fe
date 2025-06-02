import { create } from "zustand";
import { Tag } from "@/entities/tag/types/tag";
import { tagApi } from "../api/tagApi";

interface TagState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  loadTags: (projectId: string) => Promise<void>;
  createTag: (projectId: string, name: string, color: string) => Promise<void>;
  updateTag: (
    projectId: string,
    tagId: string,
    name: string,
    color: string
  ) => Promise<void>;
  deleteTag: (projectId: string, tagId: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  isLoading: false,
  error: null,

  loadTags: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const tags = await tagApi.getAllTags(projectId);
      set({ tags });
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: "알 수 없는 오류가 발생했습니다." });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createTag: async (projectId, name, color) => {
    try {
      const newTag = await tagApi.createTag(projectId, {
        name: name,
        color,
      });
      set((state) => ({ tags: [...state.tags, newTag] }));
    } catch (err) {
      console.error(err);
    }
  },

  updateTag: async (projectId, tagId, name, color) => {
    try {
      const updatedTag = await tagApi.updateTag(projectId, tagId, {
        name: name,
        color,
      });
      set((state) => ({
        tags: state.tags.map((tag) => (tag.id === tagId ? updatedTag : tag)),
      }));
    } catch (err) {
      console.error(err);
    }
  },

  deleteTag: async (projectId, tagId) => {
    try {
      await tagApi.deleteTag(projectId, tagId);
      set((state) => ({
        tags: state.tags.filter((tag) => tag.id !== tagId),
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));
