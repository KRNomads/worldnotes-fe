import { Accordion } from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { BookOpen, X } from "lucide-react";
import { useMemo, useState } from "react";
import { BlockContainer } from "./block-container";
import { BlockService } from "@/entities/block/model/blockService";
import { useCustomBlocks } from "@/entities/block/model/blockSelector";

type DetailinfoSectionProps = {
  noteId: string;
};

export function DetailinfoSection({ noteId }: DetailinfoSectionProps) {
  const blockService = useMemo(() => new BlockService(noteId), [noteId]);
  const [openBlocks, setOpenBlocks] = useState<string[]>(["overview"]);
  const [showToc, setShowToc] = useState(false);

  const customBlocks = useCustomBlocks(noteId);
  const totalBlocksLength = customBlocks.length;

  const scrollToBlock = (blockId: number) => {
    const element = document.getElementById(`block-${blockId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setShowToc(false);
  };

  return (
    <div>
      {/* 목차 플로팅 버튼 */}
      <Button
        className="fixed top-38 left-4 z-30 bg-teal-500 hover:bg-mint-700 text-white p-2 rounded-md shadow-lg"
        onClick={() => setShowToc(!showToc)}
        size="sm"
        style={{ width: "30px", height: "30px" }}
      >
        <BookOpen className="h-4 w-4" />
      </Button>

      {/* 목차 패널 */}
      {showToc && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowToc(false)}
          />
          <Card className="fixed top-16 right-4 z-50 w-64 border-gray-200 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-500" />
                  <h3 className="text-sm font-medium text-gray-800">목차</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowToc(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <nav className="space-y-1">
                {customBlocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => scrollToBlock(block.id)}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:text-mint-600 hover:bg-mint-50 rounded-md transition-colors"
                  >
                    {block.title}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </>
      )}

      {/* Editor Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800 mb-3">상세 정보</h2>
        </div>
      </div>

      <Accordion
        type="multiple"
        value={openBlocks}
        onValueChange={setOpenBlocks}
        className="space-y-3"
      >
        {customBlocks.map((block, index) => (
          <BlockContainer
            key={block.id}
            block={block}
            index={index}
            totalBlocks={totalBlocksLength}
            blockService={blockService}
          />
        ))}
      </Accordion>
    </div>
  );
}
