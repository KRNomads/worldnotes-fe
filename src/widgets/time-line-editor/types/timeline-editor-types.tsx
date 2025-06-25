export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  chapter: string;
  x: number;
  y: number;
  color: string;
  linkedNotes?: string[]; // 연결된 노트 ID들
}

export interface Edge {
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
