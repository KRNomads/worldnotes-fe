import { TimeColumn, TimelineSettings } from "../types/timeline-editor-types";

// 템플릿 타입
export interface ColumnTemplate {
  id: string;
  name: string;
  description: string;
  generator: (count: number) => TimeColumn[];
}

// 기본 템플릿들
export const COLUMN_TEMPLATES: ColumnTemplate[] = [
  {
    id: "daily",
    name: "일간",
    description: "1일, 2일, 3일... 형태",
    generator: (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `day${i + 1}`,
        name: `${i + 1}일`,
        subtitle: `Day ${i + 1}`,
        position: i,
      })),
  },
  {
    id: "weekly",
    name: "주간",
    description: "1주차, 2주차, 3주차... 형태",
    generator: (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `week${i + 1}`,
        name: `${i + 1}주차`,
        subtitle: `Week ${i + 1}`,
        position: i,
      })),
  },
  {
    id: "monthly",
    name: "월간",
    description: "1월, 2월, 3월... 형태",
    generator: (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `month${i + 1}`,
        name: `${i + 1}월`,
        subtitle: `Month ${i + 1}`,
        position: i,
      })),
  },
  {
    id: "chapter",
    name: "챕터",
    description: "1챕터, 2챕터, 3챕터... 형태",
    generator: (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `ch${i + 1}`,
        name: `${i + 1}챕터`,
        subtitle: `Chapter ${i + 1}`,
        position: i,
      })),
  },
  {
    id: "scene",
    name: "씬",
    description: "1씬, 2씬, 3씬... 형태",
    generator: (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `scene${i + 1}`,
        name: `${i + 1}씬`,
        subtitle: `Scene ${i + 1}`,
        position: i,
      })),
  },
  {
    id: "act",
    name: "막",
    description: "1막, 2막, 3막... 형태",
    generator: (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `act${i + 1}`,
        name: `${i + 1}막`,
        subtitle: `Act ${i + 1}`,
        position: i,
      })),
  },
  {
    id: "year",
    name: "연도",
    description: "2024년, 2025년, 2026년... 형태",
    generator: (count: number) => {
      const startYear = new Date().getFullYear();
      return Array.from({ length: count }, (_, i) => ({
        id: `year${startYear + i}`,
        name: `${startYear + i}년`,
        subtitle: `Year ${startYear + i}`,
        position: i,
      }));
    },
  },
  {
    id: "custom",
    name: "커스텀",
    description: "직접 설정",
    generator: (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `col${i + 1}`,
        name: `컬럼 ${i + 1}`,
        subtitle: `Column ${i + 1}`,
        position: i,
      })),
  },
];

export function generateTimeColumns(settings: TimelineSettings): TimeColumn[] {
  // 설정에 저장된 컬럼들이 있으면 그것을 사용
  if (settings.columns && settings.columns.length === settings.columnCount) {
    return settings.columns.map((col, i) => ({ ...col, position: i }));
  }

  // 없으면 기본 커스텀 템플릿으로 생성
  const customTemplate = COLUMN_TEMPLATES.find((t) => t.id === "custom")!;
  return customTemplate.generator(settings.columnCount);
}

// 컬럼 순서 변경 함수
export function reorderColumns(
  columns: TimeColumn[],
  fromIndex: number,
  toIndex: number
): TimeColumn[] {
  const result = [...columns];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  // position 재정렬
  return result.map((col, i) => ({ ...col, position: i }));
}
