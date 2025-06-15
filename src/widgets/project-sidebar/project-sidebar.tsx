"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Home,
  Map,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const params = useParams();
  const pathname = usePathname();

  // projectId 파라미터 안전하게 가져오기
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;

  // 프로젝트 ID가 없으면 사이드바를 렌더링하지 않음
  if (!projectId) {
    console.log("ProjectSidebar - projectId가 없습니다"); // 디버깅용
    return null;
  }

  const menuItems = [
    {
      title: "기본 정보",
      href: `/project/${projectId}`,
      icon: Home,
    },
    {
      title: "모든 노트",
      href: `/project/${projectId}/notes`,
      icon: BookOpen,
    },
  ];

  const worldItems = [
    {
      title: "관계",
      href: `/project/${projectId}/relationships`,
      icon: Users,
    },
    {
      title: "지도",
      href: `/project/${projectId}/maps`,
      icon: Map,
    },
    {
      title: "플롯",
      href: `/project/${projectId}/plots`,
      icon: Calendar,
    },
  ];

  return (
    <>
      {/* Overlay background when sidebar is open - 데스크탑에서도 표시 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 border-none flex items-center justify-between">
          <Link
            href={`/dashboard`}
            className="text-xl font-medium text-gray-800 hover:underline"
          >
            WorldNote
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
              프로젝트
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-2 py-2 text-sm rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-gray-100 text-[#81DFCF] font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-[#81DFCF]"
                    )}
                    onClick={() => onClose()} // 링크 클릭 시 사이드바 닫기
                  >
                    <item.icon className="h-4 w-4 mr-3 text-gray-500" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
              세계관 요소
            </h3>
            <div className="space-y-1">
              {worldItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-gray-100 text-[#81DFCF] font-medium"
                      : "text-gray-700 hover:bg-gray-100 hover:text-[#81DFCF]"
                  )}
                  onClick={() => onClose()} // 링크 클릭 시 사이드바 닫기
                >
                  <item.icon className="h-4 w-4 mr-3 text-gray-500" />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <Link
              href={`/project/${projectId}/settings`}
              className={cn(
                "flex items-center px-2 py-2 text-sm rounded-md transition-colors",
                pathname === `/project/${projectId}/settings`
                  ? "bg-gray-100 text-[#81DFCF] font-medium"
                  : "text-gray-700 hover:bg-gray-100 hover:text-[#81DFCF]"
              )}
              onClick={() => onClose()} // 링크 클릭 시 사이드바 닫기
            >
              <Settings className="h-4 w-4 mr-3 text-gray-500" />
              설정
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
