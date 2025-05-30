import { create } from "zustand";
import axios from "axios";
import { Entry, NoteGroup } from "@/types/noteGroup";

interface NoteGroupStore {
  groups: NoteGroup[];
  entriesByGroupId: Record<number, Entry[]>;
  currentGroupId: number | null;

  // === API 메소드 ===
  fetchGroups: (projectId: string) => Promise<void>;
  createGroup: (
    projectId: string,
    title: string,
    type: string
  ) => Promise<void>;
  deleteGroup: (groupId: number) => Promise<void>;

  fetchEntries: (groupId: number) => Promise<void>;
  addEntry: (
    groupId: number,
    noteId: string,
    positionX: number,
    positionY: number
  ) => Promise<void>;
  updateEntryPosition: (
    entryId: number,
    positionX: number,
    positionY: number
  ) => Promise<void>;
  removeEntry: (entryId: number) => Promise<void>;

  setCurrentGroup: (groupId: number) => void;
}

// === Zustand 스토어 ===
export const useNoteGroupStore = create<NoteGroupStore>((set, get) => ({
  groups: [],
  entriesByGroupId: {},
  currentGroupId: null,

  async fetchGroups(projectId) {
    const res = await axios.get(`/api/v1/groups/project/${projectId}`);
    set({ groups: res.data });
  },

  async createGroup(projectId, title, type) {
    const res = await axios.post(`/api/v1/groups`, {
      projectId,
      title,
      type,
    });
    set((state) => ({ groups: [...state.groups, res.data] }));
  },

  async deleteGroup(groupId) {
    await axios.delete(`/api/v1/groups/${groupId}`);
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      entriesByGroupId: Object.fromEntries(
        Object.entries(state.entriesByGroupId).filter(
          ([id]) => Number(id) !== groupId
        )
      ),
    }));
  },

  async fetchEntries(groupId) {
    const res = await axios.get(`/api/v1/group-entries/group/${groupId}`);
    set((state) => ({
      entriesByGroupId: {
        ...state.entriesByGroupId,
        [groupId]: res.data,
      },
    }));
  },

  async addEntry(groupId, noteId, positionX, positionY) {
    const res = await axios.post(`/api/v1/group-entries?groupId=${groupId}`, {
      noteId,
      positionX,
      positionY,
    });
    set((state) => ({
      entriesByGroupId: {
        ...state.entriesByGroupId,
        [groupId]: [...(state.entriesByGroupId[groupId] || []), res.data],
      },
    }));
  },

  async updateEntryPosition(entryId, positionX, positionY) {
    const res = await axios.put(`/api/v1/group-entries/${entryId}/position`, {
      positionX,
      positionY,
    });
    const updatedEntry = res.data;
    set((state) => {
      const groupId = Object.keys(state.entriesByGroupId).find((gid) =>
        state.entriesByGroupId[Number(gid)]?.some((e) => e.id === entryId)
      );
      if (!groupId) return state;
      return {
        entriesByGroupId: {
          ...state.entriesByGroupId,
          [groupId]: state.entriesByGroupId[Number(groupId)].map((e) =>
            e.id === entryId ? updatedEntry : e
          ),
        },
      };
    });
  },

  async removeEntry(entryId) {
    await axios.delete(`/api/v1/group-entries/${entryId}`);
    set((state) => {
      const groupId = Object.keys(state.entriesByGroupId).find((gid) =>
        state.entriesByGroupId[Number(gid)]?.some((e) => e.id === entryId)
      );
      if (!groupId) return state;
      return {
        entriesByGroupId: {
          ...state.entriesByGroupId,
          [groupId]: state.entriesByGroupId[Number(groupId)].filter(
            (e) => e.id !== entryId
          ),
        },
      };
    });
  },

  setCurrentGroup(groupId) {
    set({ currentGroupId: groupId });
  },
}));
