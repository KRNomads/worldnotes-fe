"use client";

import { useState } from "react";
import { ProjectHeader } from "@/widgets/project-header/project-header";
import { ProjectTabs } from "@/widgets/project-tabs/project-tabs";
import { BlockSection } from "@/widgets/block-section/block-section";
import { CharacterBlock } from "@/widgets/blocks/character-block";
import { LocationBlock } from "@/widgets/blocks/location-block";
import { TimelineBlock } from "@/widgets/blocks/timeline-block";
import { NotesBlock } from "@/widgets/blocks/notes-block";

// 샘플 프로젝트 데이터
const projectData = {
  id: "1",
  title: "판타지 세계관",
  description: "마법과 신비가 공존하는 판타지 세계",
  lastUpdated: "2024-06-10",
  coverImage: "/placeholder.svg?height=300&width=800",
  tabs: ["기본 정보", "캐릭터", "지역", "역사", "메모"],
};

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("기본 정보");

  return (
    <div className="container px-4 py-6 mx-auto">
      <ProjectHeader project={projectData} />

      <ProjectTabs
        tabs={projectData.tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "기본 정보" && (
        <div className="mt-6 space-y-8">
          <BlockSection title="세계관 개요" layout="vertical">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-gray-700">
                이 세계는 마법이 일상적으로 존재하는 판타지 세계입니다. 다양한
                종족들이 공존하며, 고대의 신비한 힘이 세계 곳곳에 숨겨져
                있습니다. 대륙은 여러 왕국으로 나뉘어 있으며, 각 왕국은 독특한
                문화와 역사를 가지고 있습니다.
              </p>
            </div>
          </BlockSection>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BlockSection title="주요 종족" layout="horizontal">
              <CharacterBlock
                name="인간"
                description="적응력이 뛰어나고 다양한 문화를 가진 종족"
                image="/placeholder.svg?height=100&width=100"
              />
              <CharacterBlock
                name="엘프"
                description="자연과 조화를 이루며 장수하는 종족"
                image="/placeholder.svg?height=100&width=100"
              />
              <CharacterBlock
                name="드워프"
                description="뛰어난 장인 정신을 가진 산악 거주 종족"
                image="/placeholder.svg?height=100&width=100"
              />
            </BlockSection>

            <BlockSection title="주요 지역" layout="horizontal">
              <LocationBlock
                name="아르카디아 왕국"
                description="인간의 중심 왕국, 풍요로운 평원 지대"
                image="/placeholder.svg?height=100&width=100"
              />
              <LocationBlock
                name="실버우드"
                description="엘프들의 고대 숲, 마법의 기운이 넘침"
                image="/placeholder.svg?height=100&width=100"
              />
              <LocationBlock
                name="아이언마운트"
                description="드워프의 산악 요새, 풍부한 광물 자원"
                image="/placeholder.svg?height=100&width=100"
              />
            </BlockSection>
          </div>

          <BlockSection title="주요 사건" layout="vertical">
            <TimelineBlock
              events={[
                {
                  year: "1200",
                  title: "대마법 전쟁",
                  description:
                    "마법사들 간의 대규모 전쟁으로 대륙의 지형이 변화함",
                },
                {
                  year: "1450",
                  title: "연합 협약",
                  description: "주요 종족들 간의 평화 협약 체결",
                },
                {
                  year: "1780",
                  title: "암흑의 부활",
                  description: "고대의 악이 깨어나 세계를 위협하기 시작함",
                },
              ]}
            />
          </BlockSection>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <BlockSection title="마법 체계" layout="horizontal">
              <NotesBlock content="이 세계의 마법은 원소(불, 물, 바람, 땅)와 정신, 빛과 어둠의 영역으로 나뉩니다. 마법을 사용하기 위해서는 타고난 재능과 오랜 수련이 필요합니다." />
            </BlockSection>

            <BlockSection title="정치 체계" layout="horizontal">
              <NotesBlock content="대부분의 인간 왕국은 세습 군주제를 따르며, 엘프들은 원로원 중심의 의회제, 드워프는 씨족 중심의 체제를 가지고 있습니다." />
            </BlockSection>

            <BlockSection title="경제 체계" layout="horizontal">
              <NotesBlock content="금화, 은화, 동화를 기본 화폐로 사용하며, 지역 간 무역이 활발합니다. 마법 아이템은 고가의 교역품으로 취급됩니다." />
            </BlockSection>
          </div>
        </div>
      )}

      {activeTab === "캐릭터" && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CharacterBlock
            name="아서 펜드라곤"
            description="아르카디아의 젊은 왕자, 정의롭고 용맹한 성격"
            image="/placeholder.svg?height=200&width=200"
            detailed
          />
          <CharacterBlock
            name="엘리아나"
            description="실버우드의 엘프 마법사, 수백 년의 지혜를 가짐"
            image="/placeholder.svg?height=200&width=200"
            detailed
          />
          <CharacterBlock
            name="토린 스톤해머"
            description="아이언마운트의 드워프 대장장이, 전설적인 무기 제작자"
            image="/placeholder.svg?height=200&width=200"
            detailed
          />
          <CharacterBlock
            name="모르가나"
            description="어둠의 여마법사, 고대의 금지된 마법을 추구"
            image="/placeholder.svg?height=200&width=200"
            detailed
          />
          <CharacterBlock
            name="그레이 늑대"
            description="미스터리한 방랑자, 과거에 대한 비밀을 간직함"
            image="/placeholder.svg?height=200&width=200"
            detailed
          />
        </div>
      )}

      {activeTab === "지역" && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <LocationBlock
            name="아르카디아 왕국"
            description="인간의 중심 왕국, 풍요로운 평원 지대가 특징이며 강력한 기사단을 보유하고 있다. 수도 캐멜롯은 웅장한 성과 번화한 시장으로 유명하다."
            image="/placeholder.svg?height=250&width=400"
            detailed
          />
          <LocationBlock
            name="실버우드"
            description="엘프들의 고대 숲, 마법의 기운이 넘치는 신비로운 지역. 천년 된 나무들이 하늘을 찌르고, 숲 깊은 곳에는 시간의 흐름이 다른 구역이 존재한다."
            image="/placeholder.svg?height=250&width=400"
            detailed
          />
          <LocationBlock
            name="아이언마운트"
            description="드워프의 산악 요새, 풍부한 광물 자원과 정교한 지하 도시가 특징. 용암의 열기를 이용한 대장간과 복잡한 터널 시스템이 발달해 있다."
            image="/placeholder.svg?height=250&width=400"
            detailed
          />
          <LocationBlock
            name="암흑 황무지"
            description="대마법 전쟁 이후 황폐화된 지역, 기이한 마법 현상과 위험한 생물들이 서식. 과거 번영했던 문명의 폐허가 곳곳에 남아있다."
            image="/placeholder.svg?height=250&width=400"
            detailed
          />
        </div>
      )}

      {activeTab === "역사" && (
        <div className="mt-6">
          <TimelineBlock
            events={[
              {
                year: "고대",
                title: "창세 시대",
                description: "신들이 세계를 창조하고 첫 생명체들이 탄생한 시기",
              },
              {
                year: "800",
                title: "첫 문명의 등장",
                description: "인간, 엘프, 드워프 문명의 기초가 형성됨",
              },
              {
                year: "1100",
                title: "마법의 발견",
                description: "원소 마법의 체계화와 마법 학교의 설립",
              },
              {
                year: "1200",
                title: "대마법 전쟁",
                description:
                  "마법사들 간의 대규모 전쟁으로 대륙의 지형이 변화함",
              },
              {
                year: "1300",
                title: "암흑기",
                description: "전쟁 후 혼란과 기근의 시대",
              },
              {
                year: "1450",
                title: "연합 협약",
                description: "주요 종족들 간의 평화 협약 체결",
              },
              {
                year: "1600",
                title: "탐험의 시대",
                description: "미지의 대륙과 바다를 탐험하기 시작",
              },
              {
                year: "1780",
                title: "암흑의 부활",
                description: "고대의 악이 깨어나 세계를 위협하기 시작함",
              },
              {
                year: "현재",
                title: "불안한 평화",
                description: "표면적 평화 속에 커져가는 긴장감",
              },
            ]}
            detailed
          />
        </div>
      )}

      {activeTab === "메모" && (
        <div className="mt-6 space-y-6">
          <NotesBlock
            title="세계관 구축 아이디어"
            content="- 각 종족별 언어 체계 개발 필요\n- 마법 시스템의 한계와 부작용 설정\n- 주요 종교와 신앙 체계 상세화\n- 일상 생활과 문화적 차이점 구체화"
            detailed
          />
          <NotesBlock
            title="스토리 아이디어"
            content="- 잃어버린 마법 유물을 찾는 모험\n- 종족 간 금지된 사랑 이야기\n- 예언된 영웅의 등장과 시련\n- 고대 악의 부활을 막기 위한 여정"
            detailed
          />
          <NotesBlock
            title="참고 자료"
            content="- 북유럽 신화\n- 아서왕 전설\n- 중세 유럽의 정치 체계\n- 다양한 판타지 소설과 게임의 마법 시스템"
            detailed
          />
        </div>
      )}
    </div>
  );
}
