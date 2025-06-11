"use client";

import { BlockEditor } from "./compnents/block-editor";
import { useParams } from "next/navigation";

export default function Home() {
  const { noteId } = useParams();

  return (
    <div>
      <BlockEditor />
    </div>
  );
}
