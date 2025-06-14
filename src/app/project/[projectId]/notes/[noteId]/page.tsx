"use client";

import { NoteEditor } from "@/widgets/note-editor/ui/note-editor";
import { useParams } from "next/navigation";

export default function Home() {
  const { noteId } = useParams();

  return (
    <div>
      <NoteEditor noteId={noteId as string} />
    </div>
  );
}
