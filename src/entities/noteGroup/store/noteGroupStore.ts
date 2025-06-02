import { create } from "zustand";
import { noteGroupApi } from "@/entities/noteGroup/api/noteGroupApi";
import type { Entry, NoteGroup } from "@/entities/noteGroup/types/noteGroup";

interface NoteGroupStore {
  groups: NoteGroup[];
  entriesByGroupId: Record<number, Entry[]>;
  currentGroupId: number | null;

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

export const useNoteGroupStore = create<NoteGroupStore>((set, get) => ({
  groups: [],
  entriesByGroupId: {},
  currentGroupId: null,

  async fetchGroups(projectId) {
    const groups = await noteGroupApi.fetchGroups(projectId);
    set({ groups });
  },

  async createGroup(projectId, title, type) {
    const newGroup = await noteGroupApi.createGroup(projectId, title, type);
    set((state) => ({ groups: [...state.groups, newGroup] }));
  },

  async deleteGroup(groupId) {
    await noteGroupApi.deleteGroup(groupId);
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
    const entries = await noteGroupApi.fetchEntries(groupId);
    set((state) => ({
      entriesByGroupId: {
        ...state.entriesByGroupId,
        [groupId]: entries,
      },
    }));
  },

  async addEntry(groupId, noteId, positionX, positionY) {
    const newEntry = await noteGroupApi.addEntry(
      groupId,
      noteId,
      positionX,
      positionY
    );
    set((state) => ({
      entriesByGroupId: {
        ...state.entriesByGroupId,
        [groupId]: [...(state.entriesByGroupId[groupId] || []), newEntry],
      },
    }));
  },

  async updateEntryPosition(entryId, positionX, positionY) {
    const updatedEntry = await noteGroupApi.updateEntryPosition(
      entryId,
      positionX,
      positionY
    );
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
    await noteGroupApi.removeEntry(entryId);
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
