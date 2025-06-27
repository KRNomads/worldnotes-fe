// 노트 관련 유틸리티 함수들

import { getInitialConsonants } from "@/shared/lib/hangul";
import { Note, NoteType } from "../types/note";

export const TYPE_LABELS: Record<NoteType, string> = {
  CHARACTER: "캐릭터",
  EVENT: "사건",
  PLACE: "장소",
  DETAILS: "설정",
  ITEM: "아이템",
};

export const NOTE_COLORS: Record<NoteType, string> = {
  CHARACTER: "#3b82f6",
  ITEM: "#f59e0b",
  DETAILS: "#8b5cf6",
  EVENT: "#ef4444",
  PLACE: "#10b981",
};

export const NOTE_ICONS = {
  CHARACTER: "User",
  ITEM: "Package",
  DETAILS: "Settings",
  EVENT: "Zap",
  PLACE: "MapPin",
};

// 샘플 노트 데이터
export const sampleNotes: Note[] = [
  {
    id: "note1",
    projectId: "project1",
    title: "엘프 왕자 아리온",
    subTitle: "",
    summary:
      "왕국의 마지막 왕자, 강력한 마법 능력을 보유하고 있으며 운명의 검을 찾아 나선다",
    imgUrl: "",
    color: NOTE_COLORS.CHARACTER,
    type: "CHARACTER",
    position: 0,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
  },
  {
    id: "note2",
    projectId: "project1",
    title: "어둠의 마법사 모르간",
    subTitle: "",
    summary:
      "고대의 어둠 마법을 사용하는 강력한 적대자, 왕국을 멸망시키려 한다",
    imgUrl: "",
    color: NOTE_COLORS.CHARACTER,
    type: "CHARACTER",
    position: 1,
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-16T00:00:00Z"),
  },
  {
    id: "note3",
    projectId: "project1",
    title: "현명한 현자 엘다린",
    subTitle: "",
    summary: "고대 지식의 수호자이자 왕자의 스승, 중요한 예언을 전해준다",
    imgUrl: "",
    color: NOTE_COLORS.CHARACTER,
    type: "CHARACTER",
    position: 2,
    createdAt: new Date("2024-01-03T00:00:00Z"),
    updatedAt: new Date("2024-01-17T00:00:00Z"),
  },
  {
    id: "note4",
    projectId: "project1",
    title: "운명의 검 엑스칼리온",
    subTitle: "",
    summary: "전설의 마법 검으로 왕국을 구할 수 있는 유일한 무기",
    imgUrl: "",
    color: NOTE_COLORS.ITEM,
    type: "ITEM",
    position: 3,
    createdAt: new Date("2024-01-04T00:00:00Z"),
    updatedAt: new Date("2024-01-18T00:00:00Z"),
  },
  {
    id: "note5",
    projectId: "project1",
    title: "치유의 물약",
    subTitle: "",
    summary: "생명력을 회복시키는 귀중한 마법 물약",
    imgUrl: "",
    color: NOTE_COLORS.ITEM,
    type: "ITEM",
    position: 4,
    createdAt: new Date("2024-01-05T00:00:00Z"),
    updatedAt: new Date("2024-01-19T00:00:00Z"),
  },
  {
    id: "note6",
    projectId: "project1",
    title: "고대 예언서",
    subTitle: "",
    summary: "왕국의 운명이 기록된 신비로운 예언서",
    imgUrl: "",
    color: NOTE_COLORS.ITEM,
    type: "ITEM",
    position: 5,
    createdAt: new Date("2024-01-06T00:00:00Z"),
    updatedAt: new Date("2024-01-20T00:00:00Z"),
  },
  {
    id: "note7",
    projectId: "project1",
    title: "마법 체계",
    subTitle: "",
    summary: "이 세계의 마법 시스템과 규칙들에 대한 설정",
    imgUrl: "",
    color: NOTE_COLORS.DETAILS,
    type: "DETAILS",
    position: 6,
    createdAt: new Date("2024-01-07T00:00:00Z"),
    updatedAt: new Date("2024-01-21T00:00:00Z"),
  },
  {
    id: "note8",
    projectId: "project1",
    title: "엘프 왕국의 역사",
    subTitle: "",
    summary: "수천 년간 이어진 엘프 왕국의 영광스러운 역사",
    imgUrl: "",
    color: NOTE_COLORS.DETAILS,
    type: "DETAILS",
    position: 7,
    createdAt: new Date("2024-01-08T00:00:00Z"),
    updatedAt: new Date("2024-01-22T00:00:00Z"),
  },
  {
    id: "note9",
    projectId: "project1",
    title: "어둠의 침입",
    subTitle: "",
    summary: "평화로운 왕국에 어둠의 세력이 침입하는 사건",
    imgUrl: "",
    color: NOTE_COLORS.EVENT,
    type: "EVENT",
    position: 8,
    createdAt: new Date("2024-01-09T00:00:00Z"),
    updatedAt: new Date("2024-01-23T00:00:00Z"),
  },
  {
    id: "note10",
    projectId: "project1",
    title: "왕의 실종",
    subTitle: "",
    summary: "엘프 왕이 갑작스럽게 사라진 미스터리한 사건",
    imgUrl: "",
    color: NOTE_COLORS.EVENT,
    type: "EVENT",
    position: 9,
    createdAt: new Date("2024-01-10T00:00:00Z"),
    updatedAt: new Date("2024-01-24T00:00:00Z"),
  },
  {
    id: "note11",
    projectId: "project1",
    title: "마법의 숲",
    subTitle: "",
    summary: "고대 엘프들이 거주하는 신비로운 숲, 강력한 마법이 깃들어 있다",
    imgUrl: "",
    color: NOTE_COLORS.PLACE,
    type: "PLACE",
    position: 10,
    createdAt: new Date("2024-01-11T00:00:00Z"),
    updatedAt: new Date("2024-01-25T00:00:00Z"),
  },
  {
    id: "note12",
    projectId: "project1",
    title: "크리스탈 동굴",
    subTitle: "",
    summary: "마법의 크리스탈이 자라는 신비로운 지하 동굴",
    imgUrl: "",
    color: NOTE_COLORS.PLACE,
    type: "PLACE",
    position: 11,
    createdAt: new Date("2024-01-12T00:00:00Z"),
    updatedAt: new Date("2024-01-26T00:00:00Z"),
  },
  {
    id: "note13",
    projectId: "project1",
    title: "왕궁 도서관",
    subTitle: "",
    summary: "고대 지식과 마법서들이 보관된 거대한 도서관",
    imgUrl: "",
    color: NOTE_COLORS.PLACE,
    type: "PLACE",
    position: 12,
    createdAt: new Date("2024-01-13T00:00:00Z"),
    updatedAt: new Date("2024-01-27T00:00:00Z"),
  },
];

// 노트 정렬 함수
export const sortNotes = (
  notes: Note[],
  sortBy: "createdAt" | "updatedAt" | "title"
): Note[] => {
  return [...notes].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
  });
};

// 노트 필터링 함수
export const filterNotes = (
  notes: Note[],
  searchQuery: string,
  selectedType: NoteType | "전체"
): Note[] => {
  let filtered = notes;

  // 타입 필터링
  if (selectedType !== "전체") {
    filtered = filtered.filter((note) => note.type === selectedType);
  }

  // 검색 필터링
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(query);
      const summaryMatch = note.summary.toLowerCase().includes(query);
      const chosungMatch = getInitialConsonants(note.title).includes(
        searchQuery
      );

      return titleMatch || summaryMatch || chosungMatch;
    });
  }

  return filtered;
};

export const sampleNotes2: Note[] = [
  {
    id: "note1",
    projectId: "project1",
    title: "엘프 왕자 아리온",
    subTitle: "",
    summary:
      "왕국의 마지막 왕자, 강력한 마법 능력을 보유하고 있으며 운명의 검을 찾아 나선다",
    imgUrl: "",
    color: "#3b82f6",
    type: "CHARACTER",
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "note2",
    projectId: "project1",
    title: "어둠의 마법사 모르간",
    subTitle: "",
    summary:
      "고대의 어둠 마법을 사용하는 강력한 적대자, 왕국을 멸망시키려 한다",
    imgUrl: "",
    color: "#3b82f6",
    type: "CHARACTER",
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "note3",
    projectId: "project1",
    title: "운명의 검 엑스칼리온",
    subTitle: "",
    summary: "전설의 마법 검으로 왕국을 구할 수 있는 유일한 무기",
    imgUrl: "",
    color: "#f59e0b",
    type: "ITEM",
    position: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "note4",
    projectId: "project1",
    title: "마법 체계",
    subTitle: "",
    summary: "이 세계의 마법 시스템과 규칙들에 대한 설정",
    imgUrl: "",
    color: "#8b5cf6",
    type: "DETAILS",
    position: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "note5",
    projectId: "project1",
    title: "어둠의 침입",
    subTitle: "",
    summary: "평화로운 왕국에 어둠의 세력이 침입하는 사건",
    imgUrl: "",
    color: "#ef4444",
    type: "EVENT",
    position: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "note6",
    projectId: "project1",
    title: "마법의 숲",
    subTitle: "",
    summary: "고대 엘프들이 거주하는 신비로운 숲, 강력한 마법이 깃들어 있다",
    imgUrl: "",
    color: "#10b981",
    type: "PLACE",
    position: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
