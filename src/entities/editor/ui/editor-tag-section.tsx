import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Tag } from "@/shared/types/tag";
import { TagManagementOverlay } from "@/entities/tag/ui/tag-management-overlay";
import { useProjectStore } from "@/store/projectStore";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useNoteStore } from "@/store/noteStore";
import { useNoteTagStore } from "@/entities/tag/model/noteTagStore";

export function EditorTagSection() {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentProject = useProjectStore((state) => state.currentProject);
  const currentNote = useNoteStore((state) => state.currentNote);

  const { loadNoteTags, noteTags, addTagToNote, removeTagFromNote } =
    useNoteTagStore();

  // 최초에 노트별 태그 로드
  useEffect(() => {
    if (currentNote) {
      loadNoteTags(currentNote.id);
    }
  }, [currentNote, loadNoteTags]);

  // 노트별 태그 로드 후 selectedTags를 업데이트
  useEffect(() => {
    if (currentNote && noteTags[currentNote.id]) {
      setSelectedTags(noteTags[currentNote.id]);
    }
  }, [noteTags, currentNote]);

  // ✅ 태그 추가: 전역 상태 & API 연동
  const handleTagSelect = async (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      if (currentNote) {
        await addTagToNote(currentNote.id, tag.id); // ✅ 실제 API 호출
        // 상태는 noteTagStore에서 noteTags가 자동 업데이트됨 → useEffect로 반영됨
      }
    }
  };

  // ✅ 태그 제거: 전역 상태 & API 연동
  const handleTagRemove = async (tagId: string) => {
    if (currentNote) {
      await removeTagFromNote(currentNote.id, tagId); // ✅ 실제 API 호출
      // 상태는 noteTagStore에서 noteTags가 자동 업데이트됨 → useEffect로 반영됨
    }
  };

  if (!currentProject) return <div>!!프로젝트 id 로딩 실패</div>;
  if (!currentNote) return <div>!!노트 id 로딩 실패</div>;

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-center gap-2 flex-wrap relative">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            className="text-sm font-medium px-3 py-1 rounded-full border-2"
            style={{
              backgroundColor: tag.color,
              color: "white",
              borderColor: tag.color,
            }}
            onClick={() => handleTagRemove(tag.id)}
          >
            {tag.name}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}

        <Button
          ref={triggerRef}
          onClick={() => setIsOverlayOpen(!isOverlayOpen)}
          variant="outline"
          size="sm"
          className="h-6 w-6 p-0 border-gray-300"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <TagManagementOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onTagSelect={handleTagSelect}
        triggerRef={triggerRef}
        projectId={currentProject.id}
      />
    </div>
  );
}
