"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useCallback, useState } from "react";
import { Block, ParagraphBlockProperties } from "@/entities/block/types/block";
import FormatToolbar from "./format-toolbar";
import { BlockService } from "@/entities/block/model/blockService";

interface ParagraphBlockContentProps {
  block: Block;
  blockService: BlockService;
}

export default function ParagraphBlockContent({
  block,
  blockService,
}: ParagraphBlockContentProps) {
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [hasFocus, setHasFocus] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false); // 툴바 표시 상태 추가

  const props = block.properties as ParagraphBlockProperties;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: props.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      blockService.updateBlockProperties(
        block.id,
        ["content"],
        editor.getJSON()
      );
    },
    onFocus: () => {
      setHasFocus(true);
    },
    onBlur: () => {
      setHasFocus(false);
      setShowToolbar(false);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;

      if (from !== to) {
        const editorElement = editor.view.dom;
        const editorRect = editorElement.getBoundingClientRect();

        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const safeTop = Math.max(start.top - 50, 10);

        setToolbarPosition({
          top: safeTop - editorRect.top,
          left: (start.left + end.left) / 2 - editorRect.left,
        });

        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    },
    editorProps: {
      attributes: {
        class:
          "flex w-full border border-input bg-background py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-y-hidden min-h-[100px] border-none focus-visible:ring-0 resize-none",
        placeholder: "텍스트를 입력하세요",
        style: "height: 100px;",
      },
      handleKeyDown: (view, event) => {
        //onKeyDown(event as KeyboardEvent);
        return false;
      },
      handleDOMEvents: {
        mouseup: (view, event) => {
          setTimeout(() => {
            if (!editor) return;
            const { state } = view;
            const { from, to } = state.selection;

            if (from !== to) {
              const editorElement = editor.view.dom;
              const editorRect = editorElement.getBoundingClientRect();

              const start = editor.view.coordsAtPos(from);
              const end = editor.view.coordsAtPos(to);
              const safeTop = Math.max(start.top - 50, 10);

              setToolbarPosition({
                top: safeTop - editorRect.top,
                left: (start.left + end.left) / 2 - editorRect.left,
              });

              setShowToolbar(true);
            } else {
              setShowToolbar(false);
            }
          }, 0);

          return false;
        },
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const element = editor.view.dom as HTMLElement;
      element.className =
        "flex w-full border border-input bg-background py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-y-hidden min-h-[100px] border-none focus-visible:ring-0 resize-none";
      element.setAttribute("placeholder", "텍스트를 입력하세요");
      element.style.height = "100px";
    }
  }, [block.type, editor]);

  useEffect(() => {
    if (hasFocus && editor) {
      editor.commands.focus("end");
    }
  }, [hasFocus, editor]);
  const handleFormat = useCallback(
    (format: string, value?: string) => {
      if (!editor) return;

      switch (format) {
        case "bold":
          editor.chain().focus().toggleBold().run();
          break;
        case "italic":
          editor.chain().focus().toggleItalic().run();
          break;
        case "underline":
          editor.chain().focus().toggleUnderline().run();
          break;
        case "strikethrough":
          editor.chain().focus().toggleStrike().run();
          break;
        case "textColor":
          if (value) {
            editor.chain().focus().setColor(value).run();
          }
          break;
        case "bgColor":
          if (value) {
            editor.chain().focus().setHighlight({ color: value }).run();
          }
          break;
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="relative pointer-events-auto select-text ">
      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
        <EditorContent editor={editor} />
      </div>

      {showToolbar && (
        <FormatToolbar position={toolbarPosition} onFormat={handleFormat} />
      )}
    </div>
  );
}

// 에디터 클래스 스타일
function getEditorClasses(type: Block["type"]): string {
  const baseClasses = "outline-none w-full resize-none bg-transparent";

  switch (type) {
    // case "heading1":
    //   return `${baseClasses} text-3xl font-bold py-2`;
    // case "heading2":
    //   return `${baseClasses} text-2xl font-bold py-2`;
    // case "heading3":
    //   return `${baseClasses} text-xl font-bold py-1`;
    // case "quote":
    //   return `${baseClasses} border-l-4 border-gray-300 pl-4 py-2 italic text-gray-700`;
    // case "code":
    //   return `${baseClasses} font-mono bg-gray-100 p-3 rounded text-sm`;
    // case "bulletList":
    // case "numberedList":
    //   return `${baseClasses} pl-6`;
    default:
      return `${baseClasses} py-1`;
  }
}
