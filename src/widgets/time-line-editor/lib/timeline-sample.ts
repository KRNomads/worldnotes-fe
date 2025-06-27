import {
  TimelineEvent,
  TimelineSettings,
} from "@/entities/timeline/types/timeline-types";

export const initialEvents: TimelineEvent[] = [
  {
    id: "event1",
    title: "#1 엘프 왕국의 전성기",
    description: "마지막 황금시대의 시작",
    time: "ch1",
    x: 100,
    y: 100,
    color: "#3b82f6",
    linkedNotes: ["note1", "note2"],
  },
  {
    id: "event2",
    title: "#2 어둠의 침입",
    description: "신비한 세력의 등장",
    time: "ch3",
    x: 500,
    y: 150,
    color: "#8b5cf6",
    linkedNotes: ["note5"],
  },
  {
    id: "event3",
    title: "#3 마법사의 예언",
    description: "운명을 바꿀 예언의 등장",
    time: "ch4",
    x: 700,
    y: 200,
    color: "#ef4444",
    linkedNotes: ["note3"],
  },
  // 경계 테스트를 위한 추가 이벤트들
  {
    id: "event4",
    title: "#4 멀리 있는 이벤트",
    description: "경계를 벗어날 수 있는 이벤트",
    time: "ch8",
    x: 1500, // 기본 설정(10컬럼 × 200px = 2000px)에서는 괜찮지만, 줄어들면 문제가 될 수 있음
    y: 250,
    color: "#10b981",
  },
  {
    id: "event5",
    title: "#5 아주 멀리 있는 이벤트",
    description: "확실히 경계를 벗어날 이벤트",
    time: "ch10",
    x: 1800,
    y: 300,
    color: "#f59e0b",
  },
];

export const initialSettings: TimelineSettings = {
  columnCount: 10,
  columnWidth: 200,
  columns: [
    { id: "ch1", name: "1챕터", subtitle: "Chapter 1", position: 0 },
    { id: "ch2", name: "2챕터", subtitle: "Chapter 2", position: 1 },
    { id: "ch3", name: "3챕터", subtitle: "Chapter 3", position: 2 },
    { id: "ch4", name: "4챕터", subtitle: "Chapter 4", position: 3 },
    { id: "ch5", name: "5챕터", subtitle: "Chapter 5", position: 4 },
    { id: "ch6", name: "6챕터", subtitle: "Chapter 6", position: 5 },
    { id: "ch7", name: "7챕터", subtitle: "Chapter 7", position: 6 },
    { id: "ch8", name: "8챕터", subtitle: "Chapter 8", position: 7 },
    { id: "ch9", name: "9챕터", subtitle: "Chapter 9", position: 8 },
    { id: "ch10", name: "10챕터", subtitle: "Chapter 10", position: 9 },
  ],
};
