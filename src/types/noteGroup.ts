export interface NoteGroup {
  id: number;
  title: string;
  type: string;
  parentId: number | null;
}

export interface Entry {
  id: number;
  noteId: string;
  positionX: number;
  positionY: number;
}
