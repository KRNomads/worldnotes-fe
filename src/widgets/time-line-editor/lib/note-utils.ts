// 노트 관련 유틸리티 함수들
export type NoteType = "CHARACTER" | "PLACE" | "EVENT" | "DETAILS" | "ITEM"

export interface Note {
  id: string
  title: string
  description: string
  color: string
  type: NoteType
  createdAt: string
  updatedAt: string
}

export const TYPE_LABELS: Record<NoteType, string> = {
  CHARACTER: "캐릭터",
  EVENT: "사건",
  PLACE: "장소",
  DETAILS: "설정",
  ITEM: "아이템",
}

export const NOTE_COLORS: Record<NoteType, string> = {
  CHARACTER: "#3b82f6",
  ITEM: "#f59e0b",
  DETAILS: "#8b5cf6",
  EVENT: "#ef4444",
  PLACE: "#10b981",
}

export const NOTE_ICONS = {
  CHARACTER: "User",
  ITEM: "Package",
  DETAILS: "Settings",
  EVENT: "Zap",
  PLACE: "MapPin",
}

// 한글 초성 추출 함수
export const getInitialConsonants = (text: string): string => {
  const consonants = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ]
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0) - 44032
      if (code >= 0 && code <= 11171) {
        return consonants[Math.floor(code / 588)]
      }
      return char
    })
    .join("")
}

// 샘플 노트 데이터
export const sampleNotes: Note[] = [
  {
    id: "note1",
    title: "엘프 왕자 아리온",
    description: "왕국의 마지막 왕자, 강력한 마법 능력을 보유하고 있으며 운명의 검을 찾아 나선다",
    color: NOTE_COLORS.CHARACTER,
    type: "CHARACTER",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "note2",
    title: "어둠의 마법사 모르간",
    description: "고대의 어둠 마법을 사용하는 강력한 적대자, 왕국을 멸망시키려 한다",
    color: NOTE_COLORS.CHARACTER,
    type: "CHARACTER",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-16T00:00:00Z",
  },
  {
    id: "note3",
    title: "현명한 현자 엘다린",
    description: "고대 지식의 수호자이자 왕자의 스승, 중요한 예언을 전해준다",
    color: NOTE_COLORS.CHARACTER,
    type: "CHARACTER",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-17T00:00:00Z",
  },
  {
    id: "note4",
    title: "운명의 검 엑스칼리온",
    description: "전설의 마법 검으로 왕국을 구할 수 있는 유일한 무기",
    color: NOTE_COLORS.ITEM,
    type: "ITEM",
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
  {
    id: "note5",
    title: "치유의 물약",
    description: "생명력을 회복시키는 귀중한 마법 물약",
    color: NOTE_COLORS.ITEM,
    type: "ITEM",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-19T00:00:00Z",
  },
  {
    id: "note6",
    title: "고대 예언서",
    description: "왕국의 운명이 기록된 신비로운 예언서",
    color: NOTE_COLORS.ITEM,
    type: "ITEM",
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "note7",
    title: "마법 체계",
    description: "이 세계의 마법 시스템과 ��칙들에 대한 설정",
    color: NOTE_COLORS.DETAILS,
    type: "DETAILS",
    createdAt: "2024-01-07T00:00:00Z",
    updatedAt: "2024-01-21T00:00:00Z",
  },
  {
    id: "note8",
    title: "엘프 왕국의 역사",
    description: "수천 년간 이어진 엘프 왕국의 영광스러운 역사",
    color: NOTE_COLORS.DETAILS,
    type: "DETAILS",
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z",
  },
  {
    id: "note9",
    title: "어둠의 침입",
    description: "평화로운 왕국에 어둠의 세력이 침입하는 사건",
    color: NOTE_COLORS.EVENT,
    type: "EVENT",
    createdAt: "2024-01-09T00:00:00Z",
    updatedAt: "2024-01-23T00:00:00Z",
  },
  {
    id: "note10",
    title: "왕의 실종",
    description: "엘프 왕이 갑작스럽게 사라진 미스터리한 사건",
    color: NOTE_COLORS.EVENT,
    type: "EVENT",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-24T00:00:00Z",
  },
  {
    id: "note11",
    title: "마법의 숲",
    description: "고대 엘프들이 거주하는 신비로운 숲, 강력한 마법이 깃들어 있다",
    color: NOTE_COLORS.PLACE,
    type: "PLACE",
    createdAt: "2024-01-11T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z",
  },
  {
    id: "note12",
    title: "크리스탈 동굴",
    description: "마법의 크리스탈이 자라는 신비로운 지하 동굴",
    color: NOTE_COLORS.PLACE,
    type: "PLACE",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-26T00:00:00Z",
  },
  {
    id: "note13",
    title: "왕궁 도서관",
    description: "고대 지식과 마법서들이 보관된 거대한 도서관",
    color: NOTE_COLORS.PLACE,
    type: "PLACE",
    createdAt: "2024-01-13T00:00:00Z",
    updatedAt: "2024-01-27T00:00:00Z",
  },
]

// 노트 정렬 함수
export const sortNotes = (notes: Note[], sortBy: "createdAt" | "updatedAt" | "title"): Note[] => {
  return [...notes].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title)
    }
    return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime()
  })
}

// 노트 필터링 함수
export const filterNotes = (notes: Note[], searchQuery: string, selectedType: NoteType | "전체"): Note[] => {
  let filtered = notes

  // 타입 필터링
  if (selectedType !== "전체") {
    filtered = filtered.filter((note) => note.type === selectedType)
  }

  // 검색 필터링
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(query)
      const descriptionMatch = note.description.toLowerCase().includes(query)
      const chosungMatch = getInitialConsonants(note.title).includes(searchQuery)

      return titleMatch || descriptionMatch || chosungMatch
    })
  }

  return filtered
}
