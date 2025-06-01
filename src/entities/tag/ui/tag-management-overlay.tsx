"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/shared/types/tag";
import { ColorPicker } from "./color-picker";
import { useTagStore } from "@/entities/tag/model/tagStore";

interface TagManagementOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onTagSelect: (tag: Tag) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  projectId: string;
}

export function TagManagementOverlay({
  isOpen,
  onClose,
  onTagSelect,
  triggerRef,
  projectId,
}: TagManagementOverlayProps) {
  const { tags, loadTags, createTag, deleteTag, updateTag } = useTagStore();

  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#F3D015");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // ✅ 태그 로드
  useEffect(() => {
    if (isOpen) {
      loadTags(projectId);
    }
  }, [isOpen, loadTags, projectId]);

  // 위치 계산
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: triggerRect.bottom + 8,
        left: triggerRect.left,
      });
    }
  }, [isOpen, triggerRef]);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      await createTag(projectId, newTagName.trim(), selectedColor);
      setNewTagName("");
      setSelectedColor("#F3D015");
    }
  };

  const handleUpdateTag = async () => {
    if (editingTag && editingTag.name.trim()) {
      await updateTag(
        projectId,
        editingTag.id,
        editingTag.name.trim(),
        editingTag.color
      );
      setEditingTag(null);
    }
  };

  const handleSelectTag = (tag: Tag) => {
    onTagSelect(tag);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed z-50 w-96 bg-white rounded-lg shadow-lg border overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      {/* 새 태그 추가 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateTag();
        }}
        className="flex items-center gap-2 border-b px-4 py-3 bg-gray-50"
      >
        <Input
          placeholder="새 태그명"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          className="flex-1 h-8 bg-gray-100 border-gray-300"
        />
        <ColorPicker
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="h-8 px-3 text-sm border-gray-400 text-gray-600 hover:bg-gray-100"
        >
          추가
        </Button>
      </form>

      {/* 태그 리스트 */}
      <div className="max-h-80 overflow-y-auto p-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag.id} className="group relative">
              {editingTag?.id === tag.id ? (
                <div className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm">
                  <Input
                    value={editingTag.name}
                    onChange={(e) =>
                      setEditingTag({ ...editingTag, name: e.target.value })
                    }
                    className="h-6 text-sm w-24"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateTag();
                      if (e.key === "Escape") setEditingTag(null);
                    }}
                  />
                  <ColorPicker
                    selectedColor={editingTag.color}
                    onColorChange={(color) =>
                      setEditingTag({ ...editingTag, color })
                    }
                  />
                  <Button
                    onClick={handleUpdateTag}
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 text-xs"
                  >
                    ✓
                  </Button>
                  <Button
                    onClick={() => setEditingTag(null)}
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 text-xs"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <div
                    onClick={() => handleSelectTag(tag)}
                    className="cursor-pointer"
                  >
                    <Badge
                      className="text-sm font-medium px-3 py-1 rounded-full border-2 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md group-hover:scale-105 group-hover:brightness-95"
                      style={{
                        backgroundColor: tag.color,
                        color: "white",
                        borderColor: tag.color,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 flex gap-1 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-in-out bg-white rounded-full shadow-md border p-1 z-50">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTag(tag);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTag(projectId, tag.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {tags.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            생성된 태그가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
