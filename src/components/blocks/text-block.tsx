// src/app/project/[projectId]/characters/components/blocks/text-block.tsx
"use client";

import React, { useState, useEffect, ChangeEvent } from "react"; // ChangeEvent 임포트
import type { Block, TextBlockProperties } from "@/types/block";

interface TextBlockComponentProps {
  block: Block & { properties: TextBlockProperties };
  isEditing: boolean;
  onUpdate: (value: string) => void;
  onEditingChange: (isEditing: boolean) => void;
}

const TextBlock: React.FC<TextBlockComponentProps> = ({
  block,
  isEditing,
  onUpdate,
  onEditingChange,
}) => {
  const [text, setText] = useState(block.properties.value);

  useEffect(() => {
    // 외부에서 block.properties.value가 변경되었을 때, 로컬 text 상태와 다르면 동기화
    if (block.properties.value !== text) {
      setText(block.properties.value);
    }
    // 이 useEffect는 block.properties.value가 변경될 때만 실행되어야 함.
    // text를 의존성 배열에 추가하면, 내부에서 setText 호출 시 무한 루프 가능성.
    // 단, text가 변경될 때마다 block.properties.value와 비교하는 것은 타당.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.properties.value]); // text를 의존성에서 제외하여 prop 변경 시에만 동기화 (단방향)

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue); // 로컬 UI 즉시 업데이트
    onUpdate(newValue); // 부모 컴포넌트로 변경된 값 전달 (부모가 debounce 처리)
  };

  const handleBlur = () => {
    // onBlur 시에는 onUpdate를 호출하여 부모의 debounce된 함수가 (필요시 flush되거나) 호출되도록 함.
    // TextBlock 자체에서 마지막 변경사항을 부모에게 확실히 전달하는 역할.
    onUpdate(text);
    onEditingChange(false);
  };

  if (isEditing) {
    return (
      <textarea
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus
        style={{
          width: "100%",
          minHeight: "100px",
          border: "1px solid #e2e8f0",
          borderRadius: "4px",
          padding: "8px",
          boxSizing: "border-box",
          resize: "vertical",
        }}
      />
    );
  }

  const displayText = (block.properties.value || "")
    .split("\n")
    .map((item, key) => {
      return (
        <React.Fragment key={key}>
          {item}
          {key < (block.properties.value || "").split("\n").length - 1 && (
            <br />
          )}
        </React.Fragment>
      );
    });

  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        padding: "8px 0",
      }}
    >
      {displayText || "내용 없음"}
    </div>
  );
};

export default TextBlock;
