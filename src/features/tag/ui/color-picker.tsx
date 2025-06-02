import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { TAG_DEFAULT_COLORS } from "../lib/tag-colors";
import { Button } from "@/shared/ui/button";

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
            className="w-5 h-5 rounded-full border"
            style={{ backgroundColor: selectedColor }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <div className="grid grid-cols-5 gap-2">
          {TAG_DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              className={`w-7 h-7 rounded-full border-2 ${
                selectedColor === color
                  ? "border-gray-600 scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
