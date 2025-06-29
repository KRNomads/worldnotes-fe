// stores/timeline-detail-store.ts
import { create } from "zustand";
import {
  TimelineEvent,
  TimelineEdge,
  TimelineSettings,
  TimeColumn,
} from "../types/timeline-types";

interface TimelineDetailStore {
  events: TimelineEvent[];
  edges: TimelineEdge[];
  timelineSettings: TimelineSettings;

  setEvents: (events: TimelineEvent[]) => void;
  addEvent: (event: TimelineEvent) => void;
  deleteEvent: (eventId: string) => void;

  setEdges: (edges: TimelineEdge[]) => void;
  addEdge: (edge: TimelineEdge) => void;
  deleteEdge: (edgeId: string) => void;

  setTimelineSettings: (settings: TimelineSettings) => void;
  updateTimelineSettings: (partial: Partial<TimelineSettings>) => void;

  updateColumns: (columns: TimeColumn[]) => void;
}

export const useTimelineDetailStore = create<TimelineDetailStore>((set) => ({
  events: [],
  edges: [],
  timelineSettings: {
    columnCount: 4,
    columnWidth: 240,
    columns: [
      { id: "ch1", name: "Chapter 1", subtitle: "Start", position: 0 },
      { id: "ch2", name: "Chapter 2", subtitle: "", position: 1 },
      { id: "ch3", name: "Chapter 3", subtitle: "", position: 2 },
      { id: "ch4", name: "Chapter 4", subtitle: "End", position: 3 },
    ],
  },

  // Event methods
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
      edges: state.edges.filter(
        (edge) => edge.sourceEventId !== id && edge.targetEventId !== id
      ),
    })),

  // Edge methods
  setEdges: (edges) => set({ edges }),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),

  // Timeline settings
  setTimelineSettings: (settings) => set({ timelineSettings: settings }),
  updateTimelineSettings: (partial) =>
    set((state) => ({
      timelineSettings: {
        ...state.timelineSettings,
        ...partial,
      },
    })),

  updateColumns: (columns) =>
    set((state) => ({
      timelineSettings: {
        ...state.timelineSettings,
        columns,
        columnCount: columns.length,
      },
    })),
}));
