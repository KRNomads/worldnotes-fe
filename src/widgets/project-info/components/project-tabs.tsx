"use client";

import { cn } from "@/shared/lib/utils";

interface ProjectTabsProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function ProjectTabs({
  tabs,
  activeTab,
  setActiveTab,
}: ProjectTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab
                ? "border-b-2 border-[#81DFCF] text-[#81DFCF]"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
