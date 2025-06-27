import { create } from "zustand";
import { Timeline } from "../types/timeline-types";

interface TimelineListStore {
  timelines: Timeline[];
  selectedTimelineId: string | null;
  setSelectedTimelineId: (id: string) => void;
  addTimeline: (meta: Timeline) => void;
  removeTimeline: (id: string) => void;
}

export const useTimelineListStore = create<TimelineListStore>((set) => ({
  timelines: [],
  selectedTimelineId: null,
  setSelectedTimelineId: (id) => set({ selectedTimelineId: id }),
  addTimeline: (meta) =>
    set((state) => ({ timelines: [...state.timelines, meta] })),
  removeTimeline: (id) =>
    set((state) => ({
      timelines: state.timelines.filter((t) => t.id !== id),
    })),
}));
