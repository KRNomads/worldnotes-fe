import { useRef, useEffect, useState, useMemo } from "react";
import { Plus } from "lucide-react";

import { useProjectStore } from "@/entities/project/store/projectStore";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useNoteTagStore } from "@/entities/tag/store/noteTagStore";
import { useTagStore } from "@/entities/tag/store/tagStore";

import { TagManagementOverlay } from "@/zzzzzzzzzzzzzzzzzzzzzzzz/tag/ui/tag-management-overlay";
import { TagBadge } from "@/zzzzzzzzzzzzzzzzzzzzzzzz/tag/ui/tag-badge";
import { Button } from "@/shared/ui/button";

import { Tag } from "@/entities/tag/types/tag";

export function EditorTagSection() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isEditingTags, setIsEditingTags] = useState(false);

  const currentProject = useProjectStore((state) => state.currentProject);
  const currentNote = useNoteStore((state) => state.currentNote);

  const { noteTags, loadNoteTags, addTagToNote, removeTagFromNote } =
    useNoteTagStore();
  const allTags = useTagStore((state) => state.tags);
  const loadTags = useTagStore((state) => state.loadTags);

  // 로딩
  useEffect(() => {
    if (currentProject) loadTags(currentProject.id);
  }, [currentProject, loadTags]);

  useEffect(() => {
    if (currentNote) loadNoteTags(currentNote.id);
  }, [currentNote, loadNoteTags]);

  // 현재 선택된 태그 ID들
  const selectedTagIds = currentNote ? noteTags[currentNote.id] || [] : [];

  // id → Tag 객체 매핑
  const tagMap = useMemo(() => {
    return Object.fromEntries(allTags.map((tag) => [tag.id, tag]));
  }, [allTags]);

  // 실제 Tag 객체 리스트
  const selectedTags = useMemo(() => {
    return selectedTagIds
      .map((id) => tagMap[id])
      .filter((tag): tag is Tag => Boolean(tag));
  }, [selectedTagIds, tagMap]);

  const handleTagAdd = async (tag: Tag) => {
    if (currentNote && !selectedTagIds.includes(tag.id)) {
      await addTagToNote(currentNote.id, tag.id);
    }
  };

  const handleTagRemove = async (tagId: string) => {
    if (currentNote) {
      await removeTagFromNote(currentNote.id, tagId);
    }
  };

  if (!currentProject) return <div>⚠️ 프로젝트 ID 로딩 실패</div>;
  if (!currentNote) return <div>⚠️ 노트 ID 로딩 실패</div>;

  return (
    <div className="bg-white border-none rounded-lg p-4 space-y-3">
      <div className="relative">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              removable
              onClick={() => handleTagRemove(tag.id)}
            />
          ))}

          <Button
            ref={triggerRef}
            onClick={() => setIsOverlayOpen(!isOverlayOpen)}
            variant="outline"
            size="sm"
            className="h-8 px-3 border-dashed border-muted-foreground/50 bg-background/50 hover:bg-muted/50 hover:border-muted-foreground transition-all duration-200 rounded-full shadow-sm"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {isOverlayOpen && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <TagManagementOverlay
              isOpen={isOverlayOpen}
              onClose={() => setIsOverlayOpen(false)}
              onTagSelect={handleTagAdd}
              triggerRef={triggerRef}
              projectId={currentProject.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
