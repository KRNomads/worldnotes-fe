"use client";

import { BasicHeader } from "@/widgets/basic-header/basic-header";
import { NoteList } from "../../../../widgets/note-list/note-list";

export default function NoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <BasicHeader />

      <main className="flex justify-center items-start px-4 lg:px-8 py-6 w-full">
        <div className="flex flex-col lg:flex-row gap-10 max-w-screen-xl w-full">
          {/* 모바일 전용 NoteList */}
          <div className="lg:hidden mb-4 w-full">
            <NoteList />
          </div>

          {/* 데스크탑 전용 NoteList */}
          <aside className="hidden lg:block w-80 shrink-0">
            <NoteList />
          </aside>

          {/* 본문 콘텐츠 */}
          <section className="flex-1 p-4 overflow-hidden">{children}</section>
        </div>
      </main>
    </div>
  );
}
