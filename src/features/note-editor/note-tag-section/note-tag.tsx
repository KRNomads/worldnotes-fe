import { useNoteStore } from "@/entities/note/store/noteStore";
import { useNoteTagStore } from "@/entities/tag/store/noteTagStore";
import { Tag } from "@/entities/tag/types/tag";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { X } from "lucide-react";

type NoteTagProps = {
  tag: Tag;
  isEditingTags: boolean;
};

export function NoteTag({ tag, isEditingTags }: NoteTagProps) {
  const { removeTagFromNote } = useNoteTagStore();

  const currentNote = useNoteStore((state) => state.currentNote);

  // 태그 제거 함수
  const handleTagRemove = async (tagId: string) => {
    if (currentNote) {
      await removeTagFromNote(currentNote.id, tagId);
    }
  };

  return (
    <Badge
      key={tag.id}
      variant="secondary"
      className="text-black/70 bg-white/70 backdrop-blur-sm group relative text-xs rounded"
    >
      # {tag.name}
      {isEditingTags && (
        <Button
          variant="ghost"
          size="icon"
          className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
          onClick={() => handleTagRemove(tag)}
        >
          <X className="h-2 w-2" />
        </Button>
      )}
    </Badge>
  );
}
