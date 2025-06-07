import type React from "react";
import { useEffect } from "react";
import { PlusCircle, Type } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";
import { EditorTagSection } from "./editor-tag-section";
import styles from "@/features/block-editor/ui/block-editor.module.scss";
import { BlockContainer } from "@/features/block/ui/block-container";
import { useBlockEditor } from "../hooks/useBlockEditor";
import { useBlockHandlers } from "../hooks/useBlockHandlers";
import { Block } from "@/entities/block/types/block";

interface BlockEditorProps {
  noteId: string;
  placeholder?: string;
  renderDefaultBlocks?: (
    defaultBlocks: Block[],
    onPropChange: (id: number, path: (string | number)[], value: any) => void
  ) => React.ReactNode;
}

export default function BlockEditor({
  noteId,
  placeholder,
  renderDefaultBlocks,
}: BlockEditorProps) {
  const editorState = useBlockEditor(noteId);
  const handlers = useBlockHandlers({
    noteId,
    ...editorState,
  });

  // 초기 데이터 로드
  useEffect(() => {
    if (noteId && !editorState.hasInitialLoad) {
      editorState.fetchBlocksByNote(noteId).then(() => {
        editorState.setHasInitialLoad(true);
      });
    }
  }, [noteId, editorState.hasInitialLoad, editorState.fetchBlocksByNote]);

  useEffect(() => {
    if (editorState.currentNoteDetails?.title) {
      editorState.setNoteTitle(editorState.currentNoteDetails.title);
    }
  }, [editorState.currentNoteDetails, editorState.setNoteTitle]);

  useEffect(() => {
    if (
      noteId &&
      editorState.hasInitialLoad &&
      editorState.hasBlocksForNote(noteId)
    ) {
      if (
        editorState.defaultBlocks.length === 0 &&
        editorState.customBlocks.length === 0
      ) {
        editorState.syncBlocksFromStore();
      }
    }
  }, [noteId, editorState.hasInitialLoad, editorState.hasBlocksForNote]);

  // 로딩 처리
  if (!editorState.hasInitialLoad && editorState.isLoadingBlocks) {
    return (
      <div className="p-4 text-center">
        <LoadingSpinner />
        <p>정보 구성 중...</p>
      </div>
    );
  }

  if (editorState.errorBlocks && !editorState.hasInitialLoad) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>오류: {editorState.errorBlocks}</p>
        <button
          onClick={() => {
            editorState.setHasInitialLoad(false);
            editorState.fetchBlocksByNote(noteId);
          }}
        >
          재시도
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 노트 Title */}
      <div className={styles.TitleformSection}>
        <input
          type="text"
          className={styles.titleInput}
          value={editorState.noteTitle}
          onChange={handlers.handleNoteTitleChange}
          placeholder={placeholder ?? ""}
        />
        <div className={styles.gradientline}></div>
      </div>

      <EditorTagSection />

      {/* 기본 블록 */}
      {renderDefaultBlocks &&
        renderDefaultBlocks(editorState.defaultBlocks, (id, path, value) =>
          handlers.handleUpdateBlockProperties(id, path, value, true)
        )}

      {/* 커스텀 블록 */}
      <div className="space-y-2">
        {editorState.customBlocks.map((block) => (
          <div key={block.blockId} className="relative">
            <BlockContainer
              block={block}
              isDragging={editorState.isDragging}
              dragOverId={editorState.dragOverId}
              onDragStart={handlers.handleDragStart}
              onDragOver={handlers.handleDragOver}
              onDrop={handlers.handleDrop}
              onDragEnd={() => {
                editorState.setIsDragging(null);
                editorState.setDragOverId(null);
              }}
              onToggleCollapse={handlers.handleToggleCollapse}
              onDeleteBlock={handlers.handleDeleteBlock}
              onUpdateBlockTitle={handlers.handleUpdateBlockTitle}
              onPropChange={(id, path, value) =>
                handlers.handleUpdateBlockProperties(id, path, value, false)
              }
              onFocus={() => handlers.handleFocus(block.blockId)}
              onKeyDown={(e) => handlers.handleKeyDown(e, block.blockId)}
            />
          </div>
        ))}
      </div>

      {/* 블록 추가 버튼 */}
      <div className="mt-8 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-dashed border-muted-foreground/50 bg-background/50 hover:bg-muted/50 hover:border-muted-foreground transition-all duration-200 rounded-full px-4 shadow-sm"
            >
              <PlusCircle className="h-4 w-4 text-primary" />
              <span className="font-medium">블록 추가</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            side="top"
            sideOffset={6}
            className="w-56 backdrop-blur-sm bg-background/95 border-muted-foreground/20 shadow-lg rounded-lg p-2"
          >
            <DropdownMenuItem
              onClick={() => handlers.handleAddBlock("TEXT")}
              className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-primary/10 rounded-md transition-colors"
            >
              <Type className="h-4 w-4 text-primary" />
              <span>텍스트</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handlers.handleAddBlock("PARAGRAPH")}
              className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-primary/10 rounded-md transition-colors"
            >
              <Type className="h-4 w-4 text-primary" />
              <span>문단</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
