import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Edit,
  BookOpen,
  MapPin,
  Users,
  Calendar,
  PlusCircle,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useParams } from "next/navigation";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useProjectStore } from "@/entities/project/store/projectStore";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useBlockStore } from "@/entities/block/store/blockStore";
import { platform } from "os";

export default function ProjectInfo() {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const { currentProject, fetchProject, updateProject } = useProjectStore();
  const { getNotesByType, fetchNotesByProject, createNote } = useNoteStore();
  const { fetchBlocksByNote, createBlock, updateBlock, blocksByNoteId } =
    useBlockStore();

  if (currentProject == null) {
    return null;
  }

  // 샘플 프로젝트 데이터
  const project = {
    id: projectId,
    title: "아쿠아 판타지아",
    genre: "판타지",
    creator: "김민지",
    description: "물의 세계 이야기",
    synopsis:
      "물의 힘을 다루는 능력자들이 사는 세계. 바다와 육지의 경계가 무너지고 새로운 문명이 탄생하는 과정에서 벌어지는 모험과 갈등을 다룬다. 수천 년간 잠들어 있던 고대 신의 부활로 세계의 균형이 깨지고, 주인공은 이를 바로잡기 위한 여정을 떠난다.",
    platform: "웹소설",
    targetAudience: "10 ~ 20 대",
    image: "/placeholder.svg?height=400&width=800",
    createdAt: "2024-04-20",
    updatedAt: "2024-05-15",
    notes: [
      { id: "n1", title: "주요 캐릭터", type: "character", count: 5 },
      { id: "n2", title: "주요 사건", type: "event", count: 3 },
      { id: "n3", title: "중요 장소", type: "location", count: 4 },
      { id: "n4", title: "마법 체계", type: "setting", count: 1 },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <main className="container mx-auto px-4 py-6">
        {/* <div className="mb-6">
          <Link
            href="/"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>돌아가기</span>
          </Link>
        </div> */}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="relative h-48 md:h-64 w-full">
            <Image
              src={project.image || "/placeholder.svg"}
              alt={currentProject.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">
                {currentProject.title}
              </h1>
              <Badge className="bg-teal-500 hover:bg-mint-600 mb-2">
                {project.genre}
              </Badge>
            </div>

            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
              >
                <Edit className="w-4 h-4 mr-1" />
                편집
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="bg-white/90 hover:bg-white"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>공유</DropdownMenuItem>
                  <DropdownMenuItem>내보내기</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <Tabs
            defaultValue="overview"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <div className="px-6 border-b">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className={`data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 border-b-2 border-transparent rounded-none`}
                >
                  개요
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className={`data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 border-b-2 border-transparent rounded-none`}
                >
                  노트
                </TabsTrigger>
                <TabsTrigger
                  value="tags"
                  className={`data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 border-b-2 border-transparent rounded-none`}
                >
                  태그 관리
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className={`data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 border-b-2 border-transparent rounded-none`}
                >
                  설정
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="p-6">
              <TabsContent value="overview" className="m-0">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <div className="mb-6">
                      <h2 className="mb-2 text-lg font-medium text-gray-800">
                        세계관 요약
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <div>
                        <h2 className="mb-2 text-lg font-medium text-gray-800">
                          시놉시스
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                          {project.synopsis}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div>
                        <h2 className="mb-2 text-lg font-medium text-gray-800">
                          플랫폼
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                          {project.platform}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h2 className="mb-2 text-lg font-medium text-gray-800">
                        타깃층
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {project.targetAudience}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="mb-4 text-sm font-medium text-gray-500 uppercase">
                          세계관 정보
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-700 w-20">
                              장르
                            </span>
                            <span className="text-sm text-gray-600">
                              {project.genre}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-700 w-20">
                              제작자
                            </span>
                            <span className="text-sm text-gray-600">
                              {project.creator}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-700 w-20">
                              배경
                            </span>
                            <span className="text-sm text-gray-600">
                              {"뭐임"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-700 w-20">
                              생성일
                            </span>
                            <span className="text-sm text-gray-600">
                              {project.createdAt}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="m-0">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {notes.map((note) => (
                    <Card
                      key={note.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-1 text-xs text-emerald-700 bg-emerald-50 rounded-full">
                              {note.category}
                            </span>
                            <span className="text-xs text-gray-400">
                              {note.updatedAt}
                            </span>
                          </div>
                          <h3 className="mb-1 text-lg font-medium text-gray-800">
                            {note.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {note.content}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outline"
                    className="flex items-center justify-center h-full min-h-[180px] border-dashed"
                  >
                    <PlusCircle className="w-5 h-5 mr-2 text-emerald-500" />새
                    노트 추가
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="tags" className="m-0">
                <div className="flex items-center justify-center h-40 text-gray-500">
                  태그 관리 콘텐츠가 여기에 표시됩니다.
                </div>
              </TabsContent>

              <TabsContent value="settings" className="m-0">
                <div className="flex items-center justify-center h-40 text-gray-500">
                  설정 콘텐츠가 여기에 표시됩니다.
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

const notes = [
  {
    id: "1",
    title: "아쿠아폴리스",
    category: "장소",
    content:
      "태평양 중앙에 위치한 세계 최대의 수중 도시. 인구 50만 명이 거주하며 해양 연구의 중심지이자 국제 무역의 허브로 기능한다. 거대한 투명 돔 구조물로 이루어져 있으며, 내부에는 인공 생태계와 다양한 구역이 존재한다.",
    updatedAt: "2일 전",
  },
  {
    id: "2",
    title: "마리나 킴",
    category: "캐릭터",
    content:
      "아쿠아폴리스의 해양 생물학자. 32세 여성으로 수중 생물과 특별한 교감 능력을 가지고 있다. 해저 깊은 곳에서 발견된 미지의 생명체를 연구하던 중 고대 문명의 비밀을 발견하게 된다.",
    updatedAt: "1주 전",
  },
  {
    id: "3",
    title: "딥 트렌치 탐사",
    category: "사건",
    content:
      "마리아나 해구 최심부에서 발견된 미지의 에너지원을 조사하기 위한 탐사대가 파견되었다. 그러나 탐사 도중 예상치 못한 현상으로 인해 통신이 두절되고, 구조대가 파견되었을 때는 탐사선만 발견되었을 뿐 대원들의 흔적은 찾을 수 없었다.",
    updatedAt: "2주 전",
  },
  {
    id: "4",
    title: "아쿠아 테크놀로지",
    category: "세계관 설정",
    content:
      "수중 생활을 가능하게 하는 핵심 기술들. 산소 추출 시스템, 수압 조절 장치, 해수 정화 및 담수화 기술, 수중 통신 네트워크 등이 포함된다. 특히 '아쿠아 젤'이라 불리는 특수 물질은 인체를 보호하면서도 물속에서의 자유로운 활동을 가능하게 한다.",
    updatedAt: "3주 전",
  },
  {
    id: "5",
    title: "해저 문명의 유적",
    category: "장소",
    content:
      "태평양 심해에서 발견된 미지의 구조물들. 현재의 과학 기술로는 설명할 수 없는 재료와 기술로 만들어졌으며, 수만 년 전에 건설된 것으로 추정된다. 이 유적에는 알 수 없는 상형문자와 함께 고대 문명의 흔적이 남아있다.",
    updatedAt: "1달 전",
  },
];
