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
  const { id: projectId } = useParams();
  const pathname = usePathname();

  return (
    <>
      {/* Overlay background when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <Link
            href={`/dashboard`}
            className="text-xl font-medium text-gray-800 hover:underline"
          >
            WorldNote
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
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
              <Link
                href={`/projects/${projectId}`}
                className={cn(
                  "flex items-center px-2 py-2 text-sm rounded-md",
                  pathname === `/projects/${projectId}`
                    ? "bg-gray-100 text-mint-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-mint-600"
                )}
              >
                <Home className="h-4 w-4 mr-3 text-gray-500" />
                기본 정보
              </Link>
              <Link
                href={`/projects/${projectId}/notes`}
                className={cn(
                  "flex items-center px-2 py-2 text-sm rounded-md",
                  pathname === `/projects/${projectId}/notes`
                    ? "bg-gray-100 text-mint-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-mint-600"
                )}
              >
                <BookOpen className="h-4 w-4 mr-3 text-gray-500" />
                모든 노트
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
              세계관 요소
            </h3>
            <div className="space-y-1">
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-mint-600"
              >
                <Users className="h-4 w-4 mr-3 text-gray-500" />
                관계
              </Link>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-mint-600"
              >
                <Map className="h-4 w-4 mr-3 text-gray-500" />
                지도
              </Link>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-mint-600"
              >
                <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                플롯
              </Link>
            </div>
          </div>

          <div className="mt-auto">
            <Link
              href="#"
              className="flex items-center px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-mint-600"
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
