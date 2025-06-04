import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { COLOR_PALETTES } from "../lib/color-palettes";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function ColorPicker({
  selectedColor,
  onColorChange,
}: {
  selectedColor: string;
  onColorChange: (color: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 w-8 p-0 border-gray-300">
          <div
            className="w-5 h-5 rounded-full border border-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        data-color-picker-popover="true"
      >
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="basic" className="text-xs">
              기본
            </TabsTrigger>
            <TabsTrigger value="pastel" className="text-xs">
              파스텔
            </TabsTrigger>
            <TabsTrigger value="vibrant" className="text-xs">
              선명
            </TabsTrigger>
            <TabsTrigger value="nature" className="text-xs">
              자연
            </TabsTrigger>
          </TabsList>
          {/* 색상 팔레트 탭들 */}
          {Object.entries(COLOR_PALETTES).map(([category, colors]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                      selectedColor === color
                        ? "border-gray-600 scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onColorChange(color);
                    }}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
