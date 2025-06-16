import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Plus, Search, X, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useTagStore } from "@/entities/tag/store/tagStore";
import { useProjectStore } from "@/entities/project/store/projectStore";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useNoteTagStore } from "@/entities/tag/store/noteTagStore";
import { Tag } from "@/entities/tag/types/tag";

type NoteTagManagementOverlayProps = {
  showTagManager: boolean;
  setShowTagManager: Dispatch<SetStateAction<boolean>>;
};

export function NoteTagManagementOverlay({
  showTagManager,
  setShowTagManager,
}: NoteTagManagementOverlayProps) {
  const [newTagInput, setNewTagInput] = useState("");
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  const { noteTags, loadNoteTags, addTagToNote, removeTagFromNote } =
    useNoteTagStore();
  const { tags: allTags, loadTags, createTag, deleteTag } = useTagStore();
  const currentProject = useProjectStore((state) => state.currentProject);
  const currentNote = useNoteStore((state) => state.currentNote);

  useEffect(() => {
    if (currentProject) loadTags(currentProject.id);
  }, [currentProject, loadTags]);

  useEffect(() => {
    if (currentNote) loadNoteTags(currentNote.id);
  }, [currentNote, loadNoteTags]);

  const selectedTagIds = currentNote ? noteTags[currentNote.id] || [] : [];

  const tagMap = useMemo(() => {
    return Object.fromEntries(allTags.map((tag) => [tag.id, tag]));
  }, [allTags]);

  const selectedTags = useMemo(() => {
    return selectedTagIds
      .map((id) => tagMap[id])
      .filter((tag): tag is Tag => Boolean(tag));
  }, [selectedTagIds, tagMap]);

  const unselectedFilteredTags = useMemo(() => {
    const unselected = allTags.filter(
      (tag) => !selectedTagIds.includes(tag.id)
    );

    if (!tagSearchQuery) return unselected;

    return unselected.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  }, [allTags, selectedTagIds, tagSearchQuery]);

  const handleTagAdd = async (tag: Tag) => {
    if (currentNote && !selectedTagIds.includes(tag.id)) {
      await addTagToNote(currentNote.id, tag.id);
    }
  };

  const handleTagRemove = async (tag: Tag) => {
    if (currentNote && selectedTagIds.includes(tag.id)) {
      await removeTagFromNote(currentNote.id, tag.id);
    }
  };

  const handleCreateAndAddTag = async () => {
    if (!newTagInput.trim() || !currentProject || !currentNote) return;

    const existingTag = allTags.find(
      (tag) => tag.name.toLowerCase() === newTagInput.trim().toLowerCase()
    );

    let tagToAdd: Tag;

    if (existingTag) {
      tagToAdd = existingTag;
    } else {
      await createTag(currentProject.id, newTagInput.trim(), "#F3D015");
      await loadTags(currentProject.id);
      const refreshedTag = allTags.find(
        (tag) => tag.name.toLowerCase() === newTagInput.trim().toLowerCase()
      );
      if (!refreshedTag) return;
      tagToAdd = refreshedTag;
    }

    await handleTagAdd(tagToAdd);
    setNewTagInput("");
  };

  if (!currentProject || !currentNote) {
    return (
      <Dialog open={showTagManager} onOpenChange={setShowTagManager}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>⚠️ 데이터 로드 실패</DialogTitle>
            <DialogDescription>
              프로젝트 또는 노트 정보를 불러오지 못했습니다.
            </DialogDescription>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowTagManager(false)}>닫기</Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={showTagManager} onOpenChange={setShowTagManager}>
      <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>태그 관리</DialogTitle>
          <DialogDescription>
            프로젝트의 태그를 관리하고 노트에 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* 현재 노트의 태그 */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              현재 노트의 태그 ({selectedTags.length}개)
            </h4>
            <div className="flex gap-2 flex-wrap p-4 bg-gray-50 rounded-lg min-h-[60px]">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant="default"
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white relative group"
                    onClick={() => handleTagRemove(tag)}
                  >
                    <X className="h-2.5 w-2.5 mr-1" />
                    {tag.name}
                  </Button>
                ))
              ) : (
                <div className="text-sm text-gray-400 flex items-center justify-center w-full">
                  태그를 추가해보세요
                </div>
              )}
            </div>
          </div>

          {/* 태그 검색 */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="태그 검색..."
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 선택되지 않은 태그 목록 */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              추가 가능한 태그 ({unselectedFilteredTags.length}개)
            </h4>
            <div className="flex gap-2 flex-wrap p-3 border border-gray-200 rounded-lg">
              {unselectedFilteredTags.length > 0 ? (
                unselectedFilteredTags.map((tag) => (
                  <div key={tag.id} className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs border-gray-300 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleTagAdd(tag)}
                    >
                      <Plus className="h-2.5 w-2.5 mr-1" />
                      {tag.name}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-1 -right-1 h-4 w-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                      onClick={() => deleteTag(currentProject.id, tag.id)}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 w-full text-center py-4">
                  {tagSearchQuery
                    ? "검색 결과가 없습니다"
                    : "추가할 수 있는 태그가 없습니다"}
                </div>
              )}
            </div>
          </div>

          {/* 새 태그 추가 */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">새 태그 추가</h4>
            <div className="flex gap-2">
              <Input
                placeholder="새로운 태그 입력..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateAndAddTag();
                  }
                }}
                className="flex-1"
              />
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleCreateAndAddTag}
                disabled={!newTagInput.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              새 태그는 프로젝트에 추가되고 현재 노트에도 자동으로 적용됩니다.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setShowTagManager(false)}>완료</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
