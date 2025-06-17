"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/entities/project/store/projectStore";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

export default function Dashboard() {
  const router = useRouter();
  const {
    projects,
    isLoading,
    fetchUserProjects,
    createProject,
    deleteProject,
  } = useProjectStore();

  // 삭제 확인 모달 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const keywords = ["판타지", "마법", "중세", "모험"];
  const noteCount = 20;
  const author = "고쳐야함";
  const image = null;

  // 컴포넌트 마운트 시 사용자의 프로젝트 목록 가져오기
  useEffect(() => {
    fetchUserProjects();
  }, [fetchUserProjects]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // // 상대적 시간 계산 함수
  // const getRelativeTime = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffTime = Math.abs(now.getTime() - date.getTime());
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //   if (diffDays === 1) return "어제";
  //   if (diffDays <= 7) return `${diffDays}일 전`;
  //   if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}주 전`;
  //   return dateString.slice(5); // MM-DD 형태로 표시
  // };

  // 새 프로젝트 생성 핸들러
  const handleNewProject = async () => {
    try {
      // 기본 "새 작품" 타이틀로 빈 프로젝트 생성
      const newProject = await createProject({
        title: "새 프로젝트",
      });

      console.log("생성된 프로젝트:", newProject);

      // 생성된 프로젝트의 기본정보 페이지로 이동
      if (newProject && newProject.id) {
        router.push(`/project/${newProject.id}`);
      } else {
        console.error("프로젝트 ID가 없습니다:", newProject);
      }
    } catch (error) {
      console.error("새 작품 생성 실패:", error);
    }
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = (event: React.MouseEvent, projectId: string) => {
    event.stopPropagation();
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete);
        setDeleteDialogOpen(false); // 다이얼로그 닫기
        setProjectToDelete(null);
      } catch (error) {
        console.error("프로젝트 삭제 실패:", error);
        alert("프로젝트 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-light text-gray-800 tracking-wide">
              WorldNote
            </h1>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 py-2 shadow-sm"
              onClick={handleNewProject}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />새 프로젝트
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-700 mb-4">
            나의 세계관
          </h2>
          <p className="text-gray-500 text-lg font-light">
            창작의 여정을 시작해보세요
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="relative group">
              <Link href={`/project/${project.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white rounded-2xl overflow-hidden cursor-pointer">
                  {/* 데스크톱: 세로형 레이아웃 */}
                  <div className="hidden md:block">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                        {keywords.slice(0, 2).map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-white/90 text-gray-700 rounded-full px-3 py-1 text-xs font-medium"
                          >
                            {keyword}
                          </Badge>
                        ))}
                        {keywords.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="bg-white/90 text-gray-700 rounded-full px-3 py-1 text-xs font-medium"
                          >
                            +{keywords.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-medium text-gray-800 group-hover:text-emerald-600 transition-colors flex-1 pr-2">
                          {project.title}
                        </h3>
                        <div className="flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleMenuClick}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                onClick={(e) =>
                                  handleDeleteClick(e, project.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed h-10">
                        {project.overview}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {author}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {noteCount}개 노트
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-400 mb-0.5">
                            최근 수정
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {/* {getRelativeTime(project.lastModified)} */}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  {/* 모바일: 가로형 레이아웃 */}
                  <div className="md:hidden flex min-h-[120px]">
                    <div className="w-28 h-[120px] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex-shrink-0 ml-2">
                      <div className="relative w-full h-full">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={project.title}
                          fill
                          className="object-cover block group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {keywords.slice(0, 2).map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs"
                          >
                            {keyword}
                          </Badge>
                        ))}
                        {keywords.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs"
                          >
                            +{keywords.length - 2}
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base font-medium text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {project.title}
                      </h3>

                      <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed h-8">
                        {project.overview}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {author}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {noteCount}개
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-400 leading-tight">
                            최근 수정
                          </span>
                          <span className="flex items-center gap-1 text-gray-500 text-[11px]">
                            <Calendar className="w-2.5 h-2.5" />
                            {/* {getRelativeTime(project.lastModified)} */}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* 모바일 전용 메뉴 버튼 */}
              <div className="absolute top-3 right-3 z-10 md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleMenuClick}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                      onClick={(e) => handleDeleteClick(e, project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for new users */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-light text-gray-600 mb-2">
              아직 프로젝트가 없습니다
            </h3>
            <p className="text-gray-400 mb-8">첫 번째 세계관을 만들어보세요</p>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 py-3">
              <Plus className="w-4 h-4 mr-2" />
              프로젝트 시작하기
            </Button>
          </div>
        )}
      </main>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white shadow-lg z-50">
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 프로젝트를 삭제하시겠습니까?
              <br />
              삭제된 프로젝트와 모든 노트는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
