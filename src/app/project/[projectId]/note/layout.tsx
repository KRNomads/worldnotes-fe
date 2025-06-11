"use client";

import { NoteList } from "./[noteId]/compnents/note-list";

export default function NoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex justify-center min-h-screen p-4 lg:p-6">
      <div className="h-[400px]"> </div>

      {/* 모바일 전용 NoteList */}
      <div className="lg:hidden">
        <NoteList />
      </div>

      {/* 데스크탑 레이아웃 */}
      <div className="flex w-full gap-6 mt-8">
        <div className="hidden lg:block w-80 shrink-0">
          <NoteList />
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </main>
  );
}
