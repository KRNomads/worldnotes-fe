"use client";

import { Block } from "@/entities/block/types/block";
import { NoteType } from "@/entities/note/types/note";
import BlockEditor from "@/features/block-editor/ui/block-editor";

// 노트 타입별 기본 UI 컴포넌트
import CharacterDefaultUi from "@/features/character/ui/character-default-ui";

import { JSX } from "react";

interface GenericBlockEditorProps {
  noteId: string;
  type: NoteType;
}

// 각 노트 타입별로 렌더할 기본 UI 컴포넌트 매핑
const defaultUiRenderMap: Record<
  NoteType,
  (props: {
    defaultBlocks: Block[];
    onPropChange: (
      id: number,
      path: (string | number)[],
      value: string
    ) => void;
  }) => JSX.Element
> = {
  CHARACTER: (props) => <CharacterDefaultUi {...props} />,
  EVENT: (props) => <div>이벤트 UI 준비 중...</div>,
  PLACE: (props) => <div>장소 UI 준비 중...</div>,
  DETAILS: (props) => <div>세계관 UI 준비 중...</div>,
};

const placeholderMap: Record<NoteType, string> = {
  CHARACTER: "캐릭터 이름",
  EVENT: "사건 제목",
  PLACE: "장소 이름",
  DETAILS: "설정 제목",
};

export default function GenericBlockEditor({
  noteId,
  type,
}: GenericBlockEditorProps) {
  const renderDefaultUi = defaultUiRenderMap[type];

  return (
    <BlockEditor
      noteId={noteId}
      placeholder={placeholderMap[type]}
      renderDefaultBlocks={(defaultBlocks, onPropChange) =>
        renderDefaultUi
          ? renderDefaultUi({ defaultBlocks, onPropChange })
          : null
      }
    />
  );
}
