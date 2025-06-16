import { PlusCircle, Type } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useEffect, useMemo } from "react";
import {
  CharacterProfile,
  EventProfile,
  DetailsProfile,
} from "@/features/note-editor/note-profile/ui/profile-templates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";
import { PlaceNoteProfile } from "@/features/note-editor/note-profile/ui/place-note-profile";
import { DetailinfoSection } from "@/features/note-editor/detailinfo-section/ui/detailinfo-section";
import { BlockType } from "@/entities/block/types/block";
import { BlockService } from "@/entities/block/model/blockService";
import { useNoteEditorStore } from "@/features/note-editor/store/noteEditorStore";

type NoteEditorProps = {
  noteId: string;
};

export function NoteEditor({ noteId }: NoteEditorProps) {
  const blockService = useMemo(() => new BlockService(noteId), [noteId]);
  const { setCurrentNote } = useNoteStore();
  const { isLoading, setIsLoading } = useNoteEditorStore();

  useEffect(() => {
    setCurrentNote(noteId);
  }, [noteId]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await blockService.fetchBlocks();
      setIsLoading(false);
    };
    load();
  }, [blockService]);

  const currentNote = useNoteStore((state) => state.currentNote);

  const handleAddBlock = async (type: BlockType) => {
    await blockService.addCustomBlock(type);
  };

  // useEffect(() => {
  //   if (editorState.currentNoteDetails?.title) {
  //     editorState.setNoteTitle(editorState.currentNoteDetails.title);
  //   }
  // }, [editorState.currentNoteDetails, editorState.setNoteTitle]);

  // useEffect(() => {
  //   if (
  //     noteId &&
  //     editorState.hasInitialLoad &&
  //     editorState.hasBlocksForNote(noteId)
  //   ) {
  //     if (
  //       editorState.defaultBlocks.length === 0 &&
  //       editorState.customBlocks.length === 0
  //     ) {
  //       editorState.syncBlocksFromStore();
  //     }
  //   }
  // }, [noteId, editorState.hasInitialLoad, editorState.hasBlocksForNote]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <LoadingSpinner />
        <p>정보 구성 중...</p>
      </div>
    );
  }

  const renderProfile = () => {
    if (!currentNote) return null;
    switch (currentNote.type) {
      case "CHARACTER":
        return <CharacterProfile noteId={noteId} />;
      case "PLACE":
        return <PlaceNoteProfile />;
      case "DETAILS":
        return <DetailsProfile />;
      case "EVENT":
        return <EventProfile />;
      default:
        return <CharacterProfile noteId={noteId} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 프로필 섹션 */}
      {renderProfile()}

      {/* 디테일 섹션 */}
      <DetailinfoSection noteId={noteId} />

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
              onClick={() => handleAddBlock("TEXT")}
              className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-primary/10 rounded-md transition-colors"
            >
              <Type className="h-4 w-4 text-primary" />
              <span>텍스트</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAddBlock("PARAGRAPH")}
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
