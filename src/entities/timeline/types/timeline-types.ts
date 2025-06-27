export interface Timeline {
  id: string;
  title: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  x: number;
  y: number;
  color: string;
  linkedNotes?: string[]; // 연결된 노트 ID들
}

export interface TimelineEdge {
  id: string;
  type: "sequence" | "causality" | "hint" | "foreshadowing";
  sourceEventId: string;
  targetEventId: string;
}

export interface TimeColumn {
  id: string;
  name: string;
  subtitle: string;
  position: number;
}

export interface TimelineSettings {
  columnCount: number;
  columnWidth: number;
  columns: TimeColumn[];
}
