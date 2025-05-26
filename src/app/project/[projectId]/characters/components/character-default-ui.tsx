"use client";

import { Block } from "@/types/block";
import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, User } from "lucide-react";
import { useState } from "react";
import BasicField from "./defaultBlocks/BasicField";

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
  onPropChange: (id: number, path: (string | number)[], value: any) => void;
}

export default function CharacterDefaultUi({
  defaultBlocks,
  onPropChange,
}: CharacterDefaultUiProps) {
  const blocksByKey = indexBlocksByFieldKey(defaultBlocks);
  const [characterImage, setCharacterImage] = useState<string>("");

  const genderBlock = blocksByKey["gender"];
  const ageBlock = blocksByKey["age"];
  const tribeBlock = blocksByKey["tribe"];
  const personalityBlock = blocksByKey["personality"];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCharacterImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 mb-12">
      {/* 이미지와 캐릭터 정보 1:1 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
        {/* 캐릭터 이미지 섹션 */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">캐릭터 이미지</Label>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32 border-4 border-gray-200 dark:border-gray-700">
              <AvatarImage
                src={characterImage || "/file.svg?height=128&width=128"}
                alt="캐릭터"
              />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                <User className="w-12 h-12 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="character-image"
              />
              <Label htmlFor="character-image">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  asChild
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    이미지 업로드
                  </span>
                </Button>
              </Label>
            </div>
          </div>
        </div>

        {/* 캐릭터 정보 섹션 */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">캐릭터 정보</Label>

          {/* 성별 */}
          {genderBlock && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
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
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
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
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
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
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
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
  );
}
