import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/shared/types/tag";
import { TagManagementOverlay } from "@/entities/tag/ui/tag-management-overlay";
import { useProjectStore } from "@/store/projectStore";

export function EditorTagSection({ editorId }: { editorId: string }) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const currentProject = useProjectStore((state) => state.currentProject);

  if (!currentProject) return null;

  const handleTagSelect = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleTagRemove = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <h3 className="font-semibold text-gray-800">에디터 {editorId}</h3>

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

      <div className="mt-4 p-4 bg-gray-50 rounded border-2 border-dashed min-h-24">
        <p className="text-gray-500 text-sm">에디터 내용 영역...</p>
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
