"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  BookOpen,
  Clock,
  Film,
  MonitorPlay,
  Hash,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { COLUMN_TEMPLATES } from "../lib/timeline-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (templateId: string) => void;
  currentColumnCount: number;
}

const templateIcons = {
  daily: Calendar,
  weekly: Clock,
  monthly: Calendar,
  chapter: BookOpen,
  scene: Film,
  act: MonitorPlay,
  year: Hash,
  custom: Settings,
};

const templateColors = {
  daily: "bg-blue-50 border-blue-200 text-blue-700",
  weekly: "bg-green-50 border-green-200 text-green-700",
  monthly: "bg-purple-50 border-purple-200 text-purple-700",
  chapter: "bg-orange-50 border-orange-200 text-orange-700",
  scene: "bg-pink-50 border-pink-200 text-pink-700",
  act: "bg-indigo-50 border-indigo-200 text-indigo-700",
  year: "bg-yellow-50 border-yellow-200 text-yellow-700",
  custom: "bg-gray-50 border-gray-200 text-gray-700",
};

const templateExamples = {
  daily: ["1일", "2일", "3일", "4일", "5일"],
  weekly: ["1주차", "2주차", "3주차", "4주차", "5주차"],
  monthly: ["1월", "2월", "3월", "4월", "5월"],
  chapter: ["1챕터", "2챕터", "3챕터", "4챕터", "5챕터"],
  scene: ["1씬", "2씬", "3씬", "4씬", "5씬"],
  act: ["1막", "2막", "3막", "4막", "5막"],
  year: ["2024년", "2025년", "2026년", "2027년", "2028년"],
  custom: ["", "", "", "", ""],
};

export function TemplateSelectionModal({
  isOpen,
  onClose,
  onTemplateSelect,
  currentColumnCount,
}: TemplateSelectionModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleApply = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
    }
  };

  const getPreviewColumns = (templateId: string) => {
    const template = COLUMN_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return [];

    const previewCount = Math.min(currentColumnCount, 5);
    return template.generator(previewCount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isMobile
            ? "max-w-[95vw] max-h-[95vh] w-full h-full"
            : "max-w-4xl max-h-[90vh]"
        } overflow-hidden flex flex-col p-0`}
      >
        <DialogHeader className="p-4 pb-0 border-b border-gray-200">
          <DialogTitle className="flex items-center justify-between">
            템플릿 선택
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            스토리 타임라인에 적합한 템플릿을 선택하세요. 현재{" "}
            {currentColumnCount}개의 컬럼이 생성됩니다.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full">
            <div
              className={`grid gap-4 ${
                isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {COLUMN_TEMPLATES.map((template) => {
                const IconComponent =
                  templateIcons[template.id as keyof typeof templateIcons];
                const colorClass =
                  templateColors[template.id as keyof typeof templateColors];
                const examples =
                  templateExamples[
                    template.id as keyof typeof templateExamples
                  ];
                const isSelected = selectedTemplate === template.id;

                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {template.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {template.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Badge variant="default" className="bg-blue-500">
                            선택됨
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            미리보기
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {examples
                              .slice(0, Math.min(currentColumnCount, 5))
                              .map((example, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {example}
                                </Badge>
                              ))}
                            {currentColumnCount > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{currentColumnCount - 5}개 더
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          {template.id === "daily" &&
                            "일별 진행 상황을 추적할 때 적합합니다."}
                          {template.id === "weekly" &&
                            "주간 단위로 스토리를 구성할 때 사용하세요."}
                          {template.id === "monthly" &&
                            "장기간에 걸친 스토리에 적합합니다."}
                          {template.id === "chapter" &&
                            "소설이나 만화의 챕터 구성에 최적화되어 있습니다."}
                          {template.id === "scene" &&
                            "영화나 드라마의 씬 구성에 적합합니다."}
                          {template.id === "act" &&
                            "연극이나 뮤지컬의 막 구성에 사용하세요."}
                          {template.id === "year" &&
                            "연도별 장기 스토리 계획에 적합합니다."}
                          {template.id === "custom" &&
                            "직접 컬럼명을 설정하고 싶을 때 선택하세요."}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div
          className={`flex gap-3 p-4 border-t ${isMobile ? "flex-col" : ""}`}
        >
          <Button
            onClick={handleApply}
            disabled={!selectedTemplate}
            className="flex-1"
          >
            템플릿 적용
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
