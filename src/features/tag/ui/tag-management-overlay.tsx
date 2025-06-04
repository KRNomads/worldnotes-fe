"use client";

import { useState, useRef, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Tag } from "@/entities/tag/types/tag";
import { ColorPicker } from "./color-picker";
import { useTagStore } from "@/entities/tag/store/tagStore";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";

interface HoveredTagData extends Tag {
  rect: DOMRect;
}

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
  const {
    tags,
    loadTags,
    createTag,
    deleteTag,
    updateTag,
    selectedColor,
    setSelectedColor,
  } = useTagStore();

  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const [hoveredTagData, setHoveredTagData] = useState<HoveredTagData | null>(
    null
  );
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const target = event.target as Node;

      // TagManagementOverlay 자체를 클릭했는지 확인
      if (overlayRef.current && overlayRef.current.contains(target)) {
        return; // 오버레이 내부 클릭은 무시
      }

      // 트리거 버튼 클릭은 무시
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }

      // ✨ 추가된 부분: ColorPicker의 팝오버 콘텐츠 내부 클릭은 무시
      const colorPickerPopover = document.querySelector(
        '[data-color-picker-popover="true"]'
      );
      if (colorPickerPopover && colorPickerPopover.contains(target)) {
        return;
      }

      // ✨ 추가된 부분: 호버 액션 버튼 컨테이너 내부 클릭은 무시
      const hoverActions = document.getElementById("tag-hover-actions");
      if (hoverActions && hoverActions.contains(target)) {
        return;
      }

      // 위의 모든 조건에 해당하지 않으면 오버레이 닫기
      onClose();
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

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm("정말로 이 태그를 삭제하시겠습니까?")) {
      return;
    }
    await deleteTag(projectId, tagId);
  };

  const handleSelectTag = (tag: Tag) => {
    onTagSelect(tag);
    onClose();
  };

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleTagMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    tag: Tag
  ) => {
    clearHoverTimeout();
    const currentRect = e.currentTarget.getBoundingClientRect();
    setHoveredTagData({ ...tag, rect: currentRect });
  };

  const handleTagMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTagData(null);
    }, 100); // 약간의 딜레이 후 숨김
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed z-50 w-96 bg-white rounded-lg shadow-lg border overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      {/* 호버 액션 버튼 컨테이너 (오버레이 최상단에 위치) */}
      {hoveredTagData &&
        !editingTag && ( // editingTag가 아닐 때만 호버 버튼 표시
          <div
            id="tag-hover-actions" // 클릭 아웃 로직을 위해 ID 추가
            className="absolute flex items-center gap-1 bg-white rounded-full shadow-md border p-1"
            style={{
              top:
                hoveredTagData.rect.top -
                (overlayRef.current?.getBoundingClientRect().top || 0),
              left:
                hoveredTagData.rect.left -
                (overlayRef.current?.getBoundingClientRect().left || 0) +
                hoveredTagData.rect.width / 2,
              transform: "translate(-50%, -100%) translateY(-6px)", // X축 중앙 정렬, 자신의 높이만큼 위로, 추가 간격 6px
              zIndex: 55, // 다른 요소들 위에 보이도록 z-index 설정
            }}
            onMouseEnter={clearHoverTimeout} // 버튼 위에 마우스 올리면 숨김 타이머 취소
            onMouseLeave={handleTagMouseLeave} // 버튼에서 마우스 나가면 숨김 타이머 시작
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setEditingTag(hoveredTagData); // hoveredTagData 전체를 editingTag로 설정
                setHoveredTagData(null); // 편집 모드 진입 시 호버 UI 숨김
              }}
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTag(hoveredTagData.id);
                setHoveredTagData(null); // 삭제 후 호버 UI 숨김
              }}
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}

      {/* 태그 생성/수정 폼 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (editingTag) {
            handleUpdateTag();
          } else {
            handleCreateTag();
          }
        }}
        className="flex items-center gap-2 border-b px-4 py-3 bg-gray-50"
      >
        <Input
          placeholder="태그 이름"
          value={editingTag ? editingTag.name : newTagName}
          onChange={(e) =>
            editingTag
              ? setEditingTag({ ...editingTag, name: e.target.value })
              : setNewTagName(e.target.value)
          }
          className="flex-1 h-8 bg-gray-100 border-gray-300"
        />
        <ColorPicker
          selectedColor={editingTag ? editingTag.color : selectedColor}
          onColorChange={(color) =>
            editingTag
              ? setEditingTag({ ...editingTag, color })
              : setSelectedColor(color)
          }
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="h-8 px-3 text-sm border-gray-400 text-gray-600 hover:bg-gray-100"
        >
          {editingTag ? "수정" : "추가"}
        </Button>
        {editingTag && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-sm text-gray-500"
            onClick={() => setEditingTag(null)}
          >
            취소
          </Button>
        )}
      </form>

      {/* 태그 리스트 */}
      <div className="max-h-80 overflow-y-auto p-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="relative"
              onMouseEnter={(e) => handleTagMouseEnter(e, tag)}
              onMouseLeave={handleTagMouseLeave}
            >
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
              </div>
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
