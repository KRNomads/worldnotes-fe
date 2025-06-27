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

export type ConnectionMode =
  | "sequence"
  | "causality"
  | "hint"
  | "foreshadowing"
  | "delete"
  | null;

export interface TimeColumn {
  id: string;
  name: string; // 단위날짜 (1일, 2일, 3일...)
  subtitle: string; // 실제 날짜 (1시대 200년, 1시대 201년...)
  position: number;
}

export interface TimelineSettings {
  columnCount: number;
  columnWidth: number;
  columns: TimeColumn[];
}
