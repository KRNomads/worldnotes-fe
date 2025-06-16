import { Button } from "@/shared/ui/button";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NoteTag } from "./note-tag";
import { NoteTagManagementOverlay } from "./note-tag-management-overlay";
import { useNoteTagStore } from "@/entities/tag/store/noteTagStore";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useTagStore } from "@/entities/tag/store/tagStore";
import { Tag } from "@/entities/tag/types/tag";
import { useProjectStore } from "@/entities/project/store/projectStore";

export function NoteTagSection() {
  const [showAllTags, setShowAllTags] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);

  const { noteTags, loadNoteTags } = useNoteTagStore();
  const { tags: allTags, loadTags } = useTagStore();
  const currentNote = useNoteStore((state) => state.currentNote);
  const currentProject = useProjectStore((state) => state.currentProject);

  useEffect(() => {
    if (currentNote) loadNoteTags(currentNote.id);
  }, [currentNote, loadNoteTags]);

  useEffect(() => {
    if (currentProject) loadTags(currentProject.id);
  }, [currentProject, loadTags]);

  // ✅ 훅은 항상 호출
  const selectedTagIds = currentNote ? noteTags[currentNote.id] || [] : [];

  const tagMap = useMemo(() => {
    return Object.fromEntries(allTags.map((tag) => [tag.id, tag]));
  }, [allTags]);

  const selectedTags: Tag[] = useMemo(() => {
    return selectedTagIds
      .map((id) => tagMap[id])
      .filter((tag): tag is Tag => Boolean(tag));
  }, [selectedTagIds, tagMap]);

  const maxVisibleTags = 3;
  const visibleTags = showAllTags
    ? selectedTags
    : selectedTags.slice(0, maxVisibleTags);
  const hiddenTagsCount = selectedTags.length - maxVisibleTags;

  if (!currentNote) return <div>노트가 로드되지 않았습니다.</div>;

  return (
    <div className="absolute top-4 right-4 z-10 max-w-[50%]">
      <div className="flex flex-col gap-2 items-end">
        <div className="flex gap-1 flex-wrap justify-end">
          {visibleTags.map((tag) => (
            <NoteTag key={tag.id} tag={tag} isEditingTags={false} />
          ))}
        </div>

        <div className="flex items-center gap-1">
          {selectedTags.length > maxVisibleTags && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-xs text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2"
              onClick={() => setShowAllTags(!showAllTags)}
            >
              {showAllTags ? (
                <>
                  접기 <ChevronUp className="h-2.5 w-2.5 ml-1" />
                </>
              ) : (
                <>
                  +{hiddenTagsCount}개{" "}
                  <ChevronDown className="h-2.5 w-2.5 ml-1" />
                </>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-5 text-xs text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2"
            onClick={() => setShowTagManager(true)}
          >
            <Settings className="h-2.5 w-2.5 mr-1" />
            관리
          </Button>
        </div>
      </div>
      <NoteTagManagementOverlay
        showTagManager={showTagManager}
        setShowTagManager={setShowTagManager}
      />
    </div>
  );
}
