import { BookOpen, X, PlusCircle, Type } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Accordion } from "@/shared/ui/accordion";
import { useParams } from "next/navigation";
import { useBlockEditor } from "@/features/block-editor/hooks/useBlockEditor";
import { useBlockHandlers } from "@/features/block-editor/hooks/useBlockHandlers";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useEffect, useState } from "react";
import { BlockContainer } from "./block-container";
import {
  CharacterProfile,
  EventProfile,
  LocationProfile,
  WorldSettingProfile,
} from "./profile-templates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";

type Params = {
  noteId: string;
};

export function BlockEditor() {
  const { noteId } = useParams<Params>();

  const [openBlocks, setOpenBlocks] = useState<string[]>(["overview"]);
  const [showToc, setShowToc] = useState(false);

  const currentNote = useNoteStore((state) => state.currentNote);

  const editorState = useBlockEditor(noteId);
  const handlers = useBlockHandlers({
    noteId,
    ...editorState,
  });

  useEffect(() => {
    if (noteId) {
      useNoteStore.getState().setCurrentNote(noteId);
    }
  }, [noteId]);
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

  const renderProfile = () => {
    if (!currentNote) return null;
    switch (currentNote.type) {
      case "CHARACTER":
        return <CharacterProfile />;
      case "PLACE":
        return <LocationProfile />;
      case "DETAILS":
        return <WorldSettingProfile />;
      case "EVENT":
        return <EventProfile />;
      default:
        return <CharacterProfile />;
    }
  };

  // 블록 이동 함수
  const moveBlock = (blockId: number, direction: "up" | "down") => {
    // const currentIndex = blocks.findIndex((block) => block.id === blockId);
    // if (
    //   (direction === "up" && currentIndex === 0) ||
    //   (direction === "down" && currentIndex === blocks.length - 1)
    // ) {
    //   return; // 이동할 수 없는 경우
    // }
    // const newBlocks = [...blocks];
    // const targetIndex =
    //   direction === "up" ? currentIndex - 1 : currentIndex + 1;
    // // 배열 요소 교환
    // [newBlocks[currentIndex], newBlocks[targetIndex]] = [
    //   newBlocks[targetIndex],
    //   newBlocks[currentIndex],
    // ];
    // setBlocks(newBlocks);
  };

  const scrollToBlock = (blockId: number) => {
    const element = document.getElementById(`block-${blockId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setShowToc(false); // 클릭 후 목차 닫기
  };

  // 블록 복제 함수
  const duplicateBlock = (blockId: number) => {
    // const blockIndex = blocks.findIndex((block) => block.id === blockId);
    // const blockToDuplicate = blocks[blockIndex];
    // const newBlock = {
    //   ...blockToDuplicate,
    //   id: `${blockToDuplicate.id}_copy_${Date.now()}`,
    //   title: `${blockToDuplicate.title} (복사본)`,
    // };
    // const newBlocks = [...blocks];
    // newBlocks.splice(blockIndex + 1, 0, newBlock);
    // setBlocks(newBlocks);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Profile Section */}
      {renderProfile()}

      {/* 목차 플로팅 버튼 */}
      <Button
        className="fixed top-38 left-4 z-30 bg-teal-500 hover:bg-mint-700 text-white p-2 rounded-md shadow-lg"
        onClick={() => setShowToc(!showToc)}
        size="sm"
        style={{ width: "30px", height: "30px" }}
      >
        <BookOpen className="h-4 w-4" />
      </Button>

      {/* 목차 패널 */}
      {showToc && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowToc(false)}
          />
          <Card className="fixed top-16 right-4 z-50 w-64 border-gray-200 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-500" />
                  <h3 className="text-sm font-medium text-gray-800">목차</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowToc(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <nav className="space-y-1">
                {editorState.customBlocks.map((block) => (
                  <button
                    key={block.blockId}
                    onClick={() => scrollToBlock(block.blockId)}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:text-mint-600 hover:bg-mint-50 rounded-md transition-colors"
                  >
                    {block.title}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </>
      )}

      {/* Editor Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">상세 정보</h2>
        </div>
      </div>

      <Accordion
        type="multiple"
        value={openBlocks}
        onValueChange={setOpenBlocks}
        className="space-y-3"
      >
        {editorState.customBlocks.map((block, index) => (
          <BlockContainer
            key={block.blockId}
            block={block}
            index={index}
            totalBlocks={editorState.customBlocks.length}
            onMoveBlock={moveBlock}
            onDuplicateBlock={duplicateBlock}
            onDeleteBlock={handlers.handleDeleteBlock}
            onUpdateBlockTitle={handlers.handleUpdateBlockTitle}
            onPropChange={(id, path, value) =>
              handlers.handleUpdateBlockProperties(id, path, value, false)
            }
            onFocus={() => handlers.handleFocus(block.blockId)}
            onKeyDown={(e) => handlers.handleKeyDown(e, block.blockId)}
          />
        ))}
      </Accordion>

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
