// 이미지 처리 공통 훅 만들 예정

import { useState, useCallback, useRef } from "react";

interface UseImageUploaderOptions {
  maxSizeMB?: number;
  onUploaded?: (url: string) => void;
}

export function useImageUploader({
  maxSizeMB = 5,
  onUploaded,
}: UseImageUploaderOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImageFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "올바른 이미지 파일을 선택해주세요.";
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `이미지 크기는 ${maxSizeMB}MB 이하여야 합니다.`;
    }
    return null;
  };

  const readImageAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject("이미지 읽기 실패");
      reader.readAsDataURL(file);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processFile = useCallback(
    async (file: File) => {
      const error = validateImageFile(file);
      if (error) {
        setUploadError(error);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const url = await readImageAsDataURL(file);
        onUploaded?.(url);
      } catch {
        setUploadError("이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        setIsUploading(false);
      }
    },
    [onUploaded]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return {
    isUploading,
    uploadError,
    fileInputRef,
    triggerFileInput,
    handleFileChange,
    processFile,
  };
}
