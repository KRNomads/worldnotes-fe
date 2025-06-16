import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Search } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Block } from "@/entities/block/types/block";
import { AnyTemplate } from "../type/TemplateMap";
import { BasicInfoItem } from "../type/BasicInfoItem";
import { BlockService } from "@/entities/block/model/blockService";

type BasicinfoTemplateSelectorProps = {
  template: AnyTemplate | undefined;
  defaultBlocks: Block[];
  showTemplateSelector: boolean;
  setShowTemplateSelector: Dispatch<SetStateAction<boolean>>;
  blockService: BlockService;
};

export function BasicinfoTemplateSelector({
  template,
  defaultBlocks,
  showTemplateSelector,
  setShowTemplateSelector,
  blockService,
}: BasicinfoTemplateSelectorProps) {
  const [filterSearch, setFilterSearch] = useState("");

  // 이미 선택된 필드 키 목록
  const existingKeys = (defaultBlocks as Block[])
    .map((block) => block.fieldKey)
    .filter(Boolean);

  // allTemplates 계산 (template가 undefined일 경우 빈 배열로 처리)
  const allTemplates: BasicInfoItem[] = useMemo(
    () => (template ? Object.values(template).flat() : []),
    [template]
  );

  const categoryEntries = useMemo(
    () =>
      template ? (Object.entries(template) as [string, BasicInfoItem[]][]) : [],
    [template]
  );

  // 새 필드 추가
  const addNewField = (title: string, fieldKey: string) => {
    blockService.addDefaultBlock(title, fieldKey);
    setShowTemplateSelector(false);
  };

  return (
    <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white">
        <DialogHeader>
          <DialogTitle>정보 필드 추가</DialogTitle>
          <DialogDescription>추가할 정보 필드를 선택하세요.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[60vh]">
          {/* 검색바 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="검색..."
              className="pl-10"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>

          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">전체</TabsTrigger>
              {categoryEntries.map(([category]) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* 전체 탭 */}
            <TabsContent value="all" className="flex-1 overflow-y-auto mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allTemplates
                  .filter(
                    (template) =>
                      !existingKeys.includes(template.key) &&
                      (filterSearch === "" ||
                        template.label
                          .toLowerCase()
                          .includes(filterSearch.toLowerCase()))
                  )
                  .map((template) => {
                    const IconComponent = template.icon;
                    return (
                      <Button
                        key={template.key}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 hover:border-mint-300"
                        onClick={() =>
                          addNewField(template.label, template.key)
                        }
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${template.color}`}
                        >
                          <IconComponent className="h-3 w-3" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">
                            {template.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {template.defaultValue}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </TabsContent>

            {/* 카테고리별 탭 */}
            {categoryEntries.map(([category, templates]) => (
              <TabsContent
                key={category as string}
                value={category as string}
                className="flex-1 overflow-y-auto mt-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {templates
                    .filter(
                      (template) =>
                        !existingKeys.includes(template.key) &&
                        (filterSearch === "" ||
                          template.label
                            .toLowerCase()
                            .includes(filterSearch.toLowerCase()))
                    )
                    .map((template) => {
                      const IconComponent = template.icon;
                      return (
                        <Button
                          key={template.key}
                          variant="outline"
                          className="justify-start h-auto py-3 px-4 hover:border-mint-300"
                          onClick={() =>
                            addNewField(template.label, template.key)
                          }
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${template.color}`}
                          >
                            <IconComponent className="h-3 w-3" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-sm">
                              {template.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {template.defaultValue}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
