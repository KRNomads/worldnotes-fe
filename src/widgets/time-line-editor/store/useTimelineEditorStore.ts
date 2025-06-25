import { create } from "zustand";
import {
  TimelineEvent,
  Edge,
  ConnectionMode,
} from "../types/timeline-editor-types";
import { generateTimeColumns, TimeColumn } from "../lib/timeline-utils";

interface TimelineSettings {
  columnCount: number;
  columnWidth: number;
  columns: {
    id: string;
    name: string;
    subtitle: string;
    position: number;
  }[];
}

interface PanTransform {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface TimelineState {
  events: TimelineEvent[];
  edges: Edge[];
  selectedEvent: string | null;
  firstSelectedEvent: string | null;
  connectionMode: ConnectionMode;
  showEventEdit: boolean;
  timelineSettings: TimelineSettings;
  timeColumns: TimeColumn[];
  panTransform: PanTransform;
  dimensions: Dimensions;

  setEvents: (events: TimelineEvent[]) => void;
  addEvent: (event: TimelineEvent) => void;
  updateEvent: (event: TimelineEvent) => void;
  deleteEvent: (eventId: string) => void;

  setEdges: (edges: Edge[]) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (edgeId: string) => void;

  setSelectedEvent: (id: string | null) => void;
  setFirstSelectedEvent: (id: string | null) => void;
  setConnectionMode: (mode: ConnectionMode) => void;
  setShowEventEdit: (show: boolean) => void;

  setTimelineSettings: (settings: TimelineSettings) => void;
  setTimeColumns: (columns: TimeColumn[]) => void;

  setPanTransform: (transform: PanTransform) => void;
  setDimensions: (dim: Dimensions) => void;
}

const initialEvents: TimelineEvent[] = [
  {
    id: "event1",
    title: "#1 엘프 왕국의 전성기",
    description: "마지막 황금시대의 시작",
    chapter: "ch1",
    x: 100,
    y: 100,
    color: "#3b82f6",
    linkedNotes: ["note1", "note2"],
  },
  {
    id: "event2",
    title: "#2 어둠의 침입",
    description: "신비한 세력의 등장",
    chapter: "ch3",
    x: 500,
    y: 150,
    color: "#8b5cf6",
    linkedNotes: ["note5"],
  },
  {
    id: "event3",
    title: "#3 마법사의 예언",
    description: "운명을 바꿀 예언의 등장",
    chapter: "ch4",
    x: 700,
    y: 200,
    color: "#ef4444",
    linkedNotes: ["note3"],
  },
  {
    id: "event4",
    title: "#4 멀리 있는 이벤트",
    description: "경계를 벗어날 수 있는 이벤트",
    chapter: "ch8",
    x: 1500,
    y: 250,
    color: "#10b981",
  },
  {
    id: "event5",
    title: "#5 아주 멀리 있는 이벤트",
    description: "확실히 경계를 벗어날 이벤트",
    chapter: "ch10",
    x: 1800,
    y: 300,
    color: "#f59e0b",
  },
];

const defaultSettings: TimelineSettings = {
  columnCount: 10,
  columnWidth: 200,
  columns: Array.from({ length: 10 }).map((_, i) => ({
    id: `ch${i + 1}`,
    name: `${i + 1}챕터`,
    subtitle: `Chapter ${i + 1}`,
    position: i,
  })),
};

export const useTimelineEditorStore = create<TimelineState>((set) => ({
  events: initialEvents,
  edges: [],
  selectedEvent: null,
  firstSelectedEvent: null,
  connectionMode: null,
  showEventEdit: false,

  timelineSettings: defaultSettings,
  timeColumns: generateTimeColumns(defaultSettings),
  panTransform: { x: 0, y: 0 },
  dimensions: { width: 0, height: 0 },

  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (updated) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === updated.id ? updated : e)),
    })),
  deleteEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== eventId),
      edges: state.edges.filter(
        (edge) =>
          edge.sourceEventId !== eventId && edge.targetEventId !== eventId
      ),
      selectedEvent: null,
    })),

  setEdges: (edges) => set({ edges }),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  deleteEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    })),

  setSelectedEvent: (id) => set({ selectedEvent: id }),
  setFirstSelectedEvent: (id) => set({ firstSelectedEvent: id }),
  setConnectionMode: (mode) => set({ connectionMode: mode }),
  setShowEventEdit: (show) => set({ showEventEdit: show }),

  setTimelineSettings: (settings) =>
    set({
      timelineSettings: settings,
      timeColumns: generateTimeColumns(settings),
    }),
  setTimeColumns: (columns) => set({ timeColumns: columns }),

  setPanTransform: (transform) => set({ panTransform: transform }),
  setDimensions: (dim) => set({ dimensions: dim }),
}));
