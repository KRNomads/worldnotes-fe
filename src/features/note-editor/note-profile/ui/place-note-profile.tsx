"use client";

import type React from "react";

import { useState } from "react";
import { Edit3, MapPin } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { BasicinfoSection } from "../../basicinfo-section/ui/basicinfo-section";
import TapinfoSection from "../../tapinfo-section/ui/tapinfo-section";

export function PlaceNoteProfile() {
  const [basicInfo, setBasicInfo] = useState({
    name: "실바니아 숲",
    location: "엘프 대륙 북부",
    tags: ["자연 지역", "안전"],
  });

  return (
    <Card className="border-gray-200 overflow-hidden">
      {/* 헤더 - 항상 보이는 기본 정보 */}
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
            <div className="w-24 h-24 rounded-lg border-4 border-white shadow-lg overflow-hidden bg-gray-100">
              <Image
                src="/placeholder.svg?height=96&width=96"
                alt="장소 이미지"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 sm:mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {basicInfo.name}
                </h1>
                <p className="text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {basicInfo.location}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {basicInfo.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 기본 정보 섹션 */}
        <BasicinfoSection />

        {/* 탭 정보 섹션 */}
        <TapinfoSection />
      </CardContent>
    </Card>
  );
}
