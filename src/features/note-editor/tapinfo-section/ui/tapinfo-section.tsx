import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { MapPin, Mountain, Users } from "lucide-react";

export default function TapinfoSection() {
  return (
    <Tabs defaultValue="overview" className="mt-6">
      <TabsList className="grid w-full grid-cols-4 bg-gray-100">
        <TabsTrigger value="overview" className="data-[state=active]:bg-white">
          개요
        </TabsTrigger>
        <TabsTrigger value="details" className="data-[state=active]:bg-white">
          상세
        </TabsTrigger>
        <TabsTrigger value="history" className="data-[state=active]:bg-white">
          역사
        </TabsTrigger>
        <TabsTrigger value="relations" className="data-[state=active]:bg-white">
          관계
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600">
            실바니아 숲은 엘프 대륙 북부에 위치한 고대의 신성한 숲입니다. 수천
            년 동안 하이 엘프들의 보금자리 역할을 해왔으며, 강력한 자연 마법으로
            보호받고 있습니다.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="details" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                지리적 특성
              </h4>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>면적</span>
                <span>약 1,200km²</span>
              </div>
              <div className="flex justify-between">
                <span>최고점</span>
                <span>엘더트리 정상 (450m)</span>
              </div>
              <div className="flex justify-between">
                <span>주요 강</span>
                <span>실버스트림 강</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                사회적 특성
              </h4>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>주요 종족</span>
                <span>하이 엘프 (85%)</span>
              </div>
              <div className="flex justify-between">
                <span>언어</span>
                <span>고대 엘프어</span>
              </div>
              <div className="flex justify-between">
                <span>통치 체계</span>
                <span>마법 의회</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        <div className="space-y-4">
          <div className="border-l-2 border-emerald-200 pl-4 space-y-3">
            <div>
              <div className="text-sm font-medium text-emerald-600">
                엘프력 기원전 2000년
              </div>
              <div className="text-sm text-gray-600">하이 엘프들의 첫 정착</div>
            </div>
            <div>
              <div className="text-sm font-medium text-emerald-600">
                엘프력 500년
              </div>
              <div className="text-sm text-gray-600">
                대마법사 엘라리온의 보호 결계 설치
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-emerald-600">
                엘프력 1247년
              </div>
              <div className="text-sm text-gray-600">드래곤 침입 사건</div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="relations" className="mt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium">엘라리온</div>
                <div className="text-xs text-gray-500">
                  대마법사 · 숲의 수호자
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              핵심 인물
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium">달빛 도서관</div>
                <div className="text-xs text-gray-500">고대 마법서 보관소</div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              주요 장소
            </Badge>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
