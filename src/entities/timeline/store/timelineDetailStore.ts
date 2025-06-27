import { create } from "zustand";
import {
  TimelineEdge,
  TimelineEvent,
  TimelineSettings,
} from "../types/timeline-types";

interface TimelineDetailStore {
  events: TimelineEvent[];
  edges: TimelineEdge[];
  settings: TimelineSettings;
  setEvents: (events: TimelineEvent[]) => void;
  updateEvent: (id: string, update: Partial<TimelineEvent>) => void;
  setSettings: (settings: TimelineSettings) => void;
  reset: () => void;
}

export const useTimelineDetailStore = create<TimelineDetailStore>((set) => ({
  events: [],
  edges: [],
  settings: {
    columnCount: 5,
    columnWidth: 200,
    columns: [],
  },
  setEvents: (events) => set({ events }),
  updateEvent: (id, update) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...update } : e)),
    })),
  setSettings: (settings) => set({ settings }),
  reset: () =>
    set({
      events: [],
      edges: [],
      settings: {
        columnCount: 5,
        columnWidth: 200,
        columns: [],
      },
    }),
}));
