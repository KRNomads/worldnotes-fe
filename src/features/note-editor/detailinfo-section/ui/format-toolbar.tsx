"use client";

import { useState } from "react";
import { Bold, Italic, Underline, Strikethrough, Palette } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface FormatToolbarProps {
  position: { top: number; left: number };
  onFormat: (format: string, value?: string) => void;
}

export default function FormatToolbar({
  position,
  onFormat,
}: FormatToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState<"text" | "bg" | null>(
    null
  );

  const colors = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#b7b7b7",
    "#cccccc",
    "#d9d9d9",
    "#efefef",
    "#f3f3f3",
    "#ffffff",
    "#980000",
    "#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#4a86e8",
    "#0000ff",
    "#9900ff",
    "#ff00ff",
    "#e6b8af",
    "#f4cccc",
    "#fce5cd",
    "#fff2cc",
    "#d9ead3",
    "#d0e0e3",
    "#c9daf8",
    "#cfe2f3",
    "#d9d2e9",
    "#ead1dc",
  ];

  return (
    <div
      className="absolute bg-white shadow-lg rounded-md border z-[9999] transition-opacity opacity-100 animate-fade-in flex"
      style={{
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.preventDefault()} // ✅ prevent blur
    >
      <button
        className="p-2 hover:bg-gray-100 rounded-l-md"
        onMouseDown={() => onFormat("bold")}
      >
        <Bold size={16} />
      </button>
      <button
        className="p-2 hover:bg-gray-100"
        onMouseDown={() => onFormat("italic")}
      >
        <Italic size={16} />
      </button>
      <button
        className="p-2 hover:bg-gray-100"
        onMouseDown={() => onFormat("underline")}
      >
        <Underline size={16} />
      </button>
      <button
        className="p-2 hover:bg-gray-100"
        onMouseDown={() => onFormat("strikethrough")}
      >
        <Strikethrough size={16} />
      </button>

      {/* 텍스트 색상 */}
      <div className="relative">
        <button
          className="p-2 hover:bg-gray-100 flex items-center"
          onMouseDown={() =>
            setShowColorPicker(showColorPicker === "text" ? null : "text")
          }
        >
          <Palette size={16} className="text-black" />
          <span className="ml-1 w-2 h-2 rounded-full bg-black" />
        </button>
        {showColorPicker === "text" && (
          <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md border p-2 z-30 w-[220px] grid grid-cols-10 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-5 h-5 rounded-sm border border-gray-200 hover:scale-110 transition-transform",
                  color === "#ffffff" ? "border-gray-300" : ""
                )}
                style={{ backgroundColor: color }}
                onMouseDown={() => {
                  onFormat("textColor", color);
                  setShowColorPicker(null);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 배경 색상 */}
      <div className="relative">
        <button
          className="p-2 hover:bg-gray-100 rounded-r-md flex items-center"
          onMouseDown={() =>
            setShowColorPicker(showColorPicker === "bg" ? null : "bg")
          }
        >
          <Palette size={16} className="text-black" />
          <span className="ml-1 w-2 h-2 rounded-full bg-yellow-200" />
        </button>
        {showColorPicker === "bg" && (
          <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md border p-2 z-30 w-[220px] grid grid-cols-10 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-5 h-5 rounded-sm border border-gray-200 hover:scale-110 transition-transform",
                  color === "#ffffff" ? "border-gray-300" : ""
                )}
                style={{ backgroundColor: color }}
                onMouseDown={() => {
                  onFormat("bgColor", color);
                  setShowColorPicker(null);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
