import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Edit3,
  MapPin,
  Calendar,
  Settings,
  Users,
  Clock,
  Thermometer,
  Mountain,
} from "lucide-react";
import Image from "next/image";
import { BasicinfoSection } from "../../basicinfo-section/ui/basicinfo-section";

// 캐릭터 프로필 컴포넌트
export function CharacterProfile() {
  return (
    <Card className="border-gray-200 overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-mint-400 to-mint-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-black hover:bg-white/20"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 ">
          <div className="relative ">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 sm:-mt-34">
              <Image
                src="/placeholder.svg?height=96&width=96"
                alt="캐릭터 프로필"
                width={96}
                height={96}
                className="w-full h-full object-cover "
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-0 left-17 sm:bottom-10 sm:right-0 h-7 w-7 rounded-full bg-white shadow-sm border-gray-300"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex-1 sm:mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col sm:gap-2">
                <h1 className="text-2xl font-bold text-gray-900 sm:mt-3">
                  엘라리온
                </h1>
                <p className="text-gray-600 ">하이 엘프 마법사</p>
              </div>
              <div className="flex gap-2 sm:mb-3">
                <Badge
                  variant="secondary"
                  className="bg-mint-100 text-mint-700 hover:bg-mint-200"
                >
                  레벨 15
                </Badge>
                <Badge
                  variant="outline"
                  className="border-mint-300 text-mint-600"
                >
                  활성
                </Badge>
              </div>
            </div>

            {/* 기본 정보 섹션 */}
            <BasicinfoSection />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 장소 프로필 템플릿
export function LocationProfile() {
  return (
    <Card className="border-gray-200 overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-emerald-400 to-teal-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-white hover:bg-white/20"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg border-4 border-white shadow-lg overflow-hidden bg-gray-100 -mt-8">
              <Image
                src="/placeholder.svg?height=96&width=96"
                alt="장소 이미지"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white shadow-sm"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex-1 sm:mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  실바니아 숲
                </h1>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  엘프 대륙 북부
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700"
                >
                  자연 지역
                </Badge>
                <Badge
                  variant="outline"
                  className="border-teal-300 text-teal-600"
                >
                  안전
                </Badge>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500 flex items-center gap-1">
                  <Thermometer className="h-3 w-3" />
                  기후
                </span>
                <p className="font-medium text-gray-900">온대</p>
              </div>
              <div>
                <span className="text-gray-500 flex items-center gap-1">
                  <Mountain className="h-3 w-3" />
                  지형
                </span>
                <p className="font-medium text-gray-900">고대림</p>
              </div>
              <div>
                <span className="text-gray-500 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  인구
                </span>
                <p className="font-medium text-gray-900">약 5,000명</p>
              </div>
              <div>
                <span className="text-gray-500">위험도</span>
                <p className="font-medium text-gray-900">낮음</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 세계관 설정 프로필 템플릿
export function WorldSettingProfile() {
  return (
    <Card className="border-gray-200 overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-purple-400 to-indigo-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-white hover:bg-white/20"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <Settings className="h-12 w-12 text-gray-400" />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white shadow-sm"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex-1 sm:mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  원소 마법 시스템
                </h1>
                <p className="text-gray-600">마법 체계 · 핵심 설정</p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700"
                >
                  마법 시스템
                </Badge>
                <Badge
                  variant="outline"
                  className="border-indigo-300 text-indigo-600"
                >
                  완성됨
                </Badge>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500">복잡도</span>
                <p className="font-medium text-gray-900">중급</p>
              </div>
              <div>
                <span className="text-gray-500">영향 범위</span>
                <p className="font-medium text-gray-900">전 세계</p>
              </div>
              <div>
                <span className="text-gray-500">관련 종족</span>
                <p className="font-medium text-gray-900">모든 종족</p>
              </div>
              <div>
                <span className="text-gray-500">제약사항</span>
                <p className="font-medium text-gray-900">마나 소모</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 사건 프로필 템플릿
export function EventProfile() {
  return (
    <Card className="border-gray-200 overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-red-400 to-orange-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-white hover:bg-white/20"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg border-4 border-white shadow-lg overflow-hidden bg-gray-100">
              <Image
                src="/placeholder.svg?height=96&width=96"
                alt="사건 이미지"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white shadow-sm"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex-1 sm:mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  드래곤의 침입
                </h1>
                <p className="text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  엘프력 1247년 · 실바니아 숲
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  전투 사건
                </Badge>
                <Badge
                  variant="outline"
                  className="border-orange-300 text-orange-600"
                >
                  완료됨
                </Badge>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  기간
                </span>
                <p className="font-medium text-gray-900">3일</p>
              </div>
              <div>
                <span className="text-gray-500">관련 인물</span>
                <p className="font-medium text-gray-900">엘라리온 외 5명</p>
              </div>
              <div>
                <span className="text-gray-500">영향 범위</span>
                <p className="font-medium text-gray-900">실바니아 전체</p>
              </div>
              <div>
                <span className="text-gray-500">중요도</span>
                <p className="font-medium text-gray-900">높음</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
