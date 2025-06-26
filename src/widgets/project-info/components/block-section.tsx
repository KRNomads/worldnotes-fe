import type React from "react";
import { cn } from "@/shared/lib/utils";

interface BlockSectionProps {
  title: string;
  children: React.ReactNode;
  layout: "vertical" | "horizontal";
}

export function BlockSection({ title, children, layout }: BlockSectionProps) {
  return (
    <div className="rounded-lg border border-gray-300 bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b-2 border-gray-200">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div
        className={cn(
          "p-2 ",
          layout === "horizontal" ? "flex flex-wrap gap-4" : "space-y-4"
        )}
      >
        {children}
      </div>
    </div>
  );
}
