"use client";

import type { Block } from "@/entities/block/types/block";
import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { User, X, Camera, Upload } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import BasicField from "../../block-editor/ui/defaultBlocks/BasicField";

function indexBlocksByFieldKey(blocks: Block[]): Record<string, Block> {
  return blocks.reduce((acc, block) => {
    if (block.fieldKey) {
      acc[block.fieldKey] = block;
    }
    return acc;
  }, {} as Record<string, Block>);
}

interface CharacterDefaultUiProps {
  defaultBlocks: Block[];
  onPropChange: (id: number, path: (string | number)[], value: string) => void;
  onImageChange?: (imageUrl: string) => void;
  initialImage?: string;
}

export default function CharacterDefaultUi({
  defaultBlocks,
  onPropChange,
  onImageChange,
  initialImage = "",
}: CharacterDefaultUiProps) {
  const blocksByKey = indexBlocksByFieldKey(defaultBlocks);
  const [characterImage, setCharacterImage] = useState<string>(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const genderBlock = blocksByKey["gender"];
  const ageBlock = blocksByKey["age"];
  const tribeBlock = blocksByKey["tribe"];
  const personalityBlock = blocksByKey["personality"];

  const processFile = useCallback(
    async (file: File) => {
      // 파일 타입 검증
      if (!file.type.startsWith("image/")) {
        setUploadError("올바른 이미지 파일을 선택해주세요.");
        return;
      }

      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("이미지 크기는 5MB 이하여야 합니다.");
        return;
      }

      setIsUploading(true);
      setUploadError("");

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setCharacterImage(imageUrl);
          onImageChange?.(imageUrl);
          setIsUploading(false);
        };
        reader.onerror = () => {
          setUploadError("이미지 업로드 중 오류가 발생했습니다.");
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setUploadError("이미지 업로드 중 오류가 발생했습니다.");
        setIsUploading(false);
      }
    },
    [onImageChange]
  );

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        await processFile(imageFile);
      } else {
        setUploadError("이미지 파일을 드롭해주세요.");
      }
    },
    [processFile]
  );

  const handleRemoveImage = () => {
    setCharacterImage("");
    onImageChange?.("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 mb-20 ">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-white   ">
        {/* 캐릭터 이미지 섹션 */}
        <div className="flex flex-col items-center space-y-4 justify-center ">
          {/* 드래그 앤 드롭 영역 */}
          <div
            className={`
    flex flex-col items-center justify-center /* << 추가된 클래스 */
    relative p-6 transition-all duration-200 cursor-pointer w-100 h-100 
    ${
      isDragOver
        ? "border-blue-500 bg-blue-50"
        : "border-gray-300 hover:border-gray-400"
    }
    ${isUploading ? "pointer-events-none opacity-50" : ""}
  `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <div className="flex flex-col items-center space-y-4">
              {characterImage ? (
                <div className="relative group">
                  <Avatar className="w-100 h-100 border-4 border-gray-200">
                    <AvatarImage
                      src={characterImage || "/placeholder.svg"}
                      alt="캐릭터"
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                      <User className="w-12 h-12 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    disabled={isUploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  ) : (
                    <>
                      {/* 아이콘 컨테이너 */}
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />{" "}
                        {/* 아이콘 */}
                      </div>
                      {/* 텍스트 컨테이너 */}
                      <div className="text-center">
                        {" "}
                        {/* 내부 텍스트들이 가운데 정렬되도록 함 */}
                        <p className="text-lg font-medium text-gray-700">
                          {"이미지 첨부"} {/* "이미지 첨부" 텍스트 */}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {" "}
                          {isDragOver
                            ? "이미지를 여기에 놓으세요"
                            : "클릭하거나 이미지를 드래그해서 업로드하세요"}{" "}
                          {/* 안내 문구 */}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="character-image"
            />
          </div>

          {/* 에러 메시지 및 안내 */}
          <div className="text-center space-y-1">
            {uploadError && (
              <p className="text-sm text-red-600 ">{uploadError}</p>
            )}
            <p className="text-xs text-gray-500 0">
              JPG, PNG, GIF 형식 지원 (최대 5MB)
            </p>
          </div>

          {/* 이미지가 있을 때 변경 버튼 */}
          {characterImage && (
            <Button
              variant="outline"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              이미지 변경
            </Button>
          )}
        </div>

        {/* 캐릭터 정보 섹션 */}
        <div className="space-y-6 flex flex-col">
          <Label className="text-xl font-medium text-gray-900">
            캐릭터 정보
          </Label>

          <div className="space-y-4 pl-4 flex flex-col">
            {/* 성별 */}
            {genderBlock && (
              <div className="space-y-2 flex items-center">
                <Label className="text-base font-medium text-gray-700 w-10  m-0">
                  {genderBlock?.title || "성별"}
                </Label>
                <BasicField
                  block={genderBlock}
                  onPropChange={(path, value) =>
                    onPropChange(genderBlock.blockId, path, value)
                  }
                />
              </div>
            )}

            {/* 나이 */}
            {ageBlock && (
              <div className="space-y-2 flex items-center">
                <Label className="text-base font-medium  text-gray-700 w-10 m-0 ">
                  {ageBlock?.title || "나이"}
                </Label>
                <BasicField
                  block={ageBlock}
                  onPropChange={(path, value) =>
                    onPropChange(ageBlock.blockId, path, value)
                  }
                />
              </div>
            )}

            {/* 종족 */}
            {tribeBlock && (
              <div className="space-y-2 flex items-center  ">
                <Label className="text-base font-medium text-gray-700 w-10 m-0">
                  {tribeBlock?.title || "종족"}
                </Label>
                <BasicField
                  block={tribeBlock}
                  onPropChange={(path, value) =>
                    onPropChange(tribeBlock.blockId, path, value)
                  }
                />
              </div>
            )}

            {/* 성격 */}
            {personalityBlock && (
              <div className="space-y-2 flex items-center ">
                <Label className="text-base font-medium text-gray-700 w-10 m-0">
                  {personalityBlock?.title || "성격"}
                </Label>
                <BasicField
                  block={personalityBlock}
                  onPropChange={(path, value) =>
                    onPropChange(personalityBlock.blockId, path, value)
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
