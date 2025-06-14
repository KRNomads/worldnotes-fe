import {
  Globe,
  BookOpen,
  Landmark,
  Users,
  Settings,
  Zap,
  Mountain,
  Swords,
  Sun,
  Moon,
  Star,
  History,
  Crown,
  Scale,
} from "lucide-react";
import { BasicInfoItem } from "../type/BasicInfoItem";

type WorldbuildingInfoCategory =
  | "overview"
  | "history"
  | "factions"
  | "cosmology"
  | "geography";

type WorldbuildingBasicInfoTemplates = {
  [category in WorldbuildingInfoCategory]: BasicInfoItem[];
};

export const WORLDBUILDING_BASICINFO_TEMPLATES: WorldbuildingBasicInfoTemplates =
  {
    overview: [
      {
        key: "worldName",
        label: "세계명",
        icon: Globe,
        color: "bg-blue-100 text-blue-700",
        defaultValue: "이름 없는 세계",
        popular: true,
      },
      {
        key: "genre",
        label: "장르",
        icon: BookOpen,
        color: "bg-purple-100 text-purple-700",
        defaultValue: "판타지",
        popular: true,
      },
      {
        key: "scale",
        label: "규모",
        icon: Landmark,
        color: "bg-green-100 text-green-700",
        defaultValue: "행성",
        popular: false,
      },
    ],
    history: [
      {
        key: "creationMyth",
        label: "창조 신화",
        icon: Sun,
        color: "bg-yellow-100 text-yellow-700",
        defaultValue: "미상",
        popular: true,
      },
      {
        key: "majorEras",
        label: "주요 시대",
        icon: History,
        color: "bg-amber-100 text-amber-700",
        defaultValue: "고대, 중세, 근대",
        popular: true,
      },
      {
        key: "importantEvents",
        label: "주요 사건",
        icon: Swords,
        color: "bg-red-100 text-red-700",
        defaultValue: "대전쟁",
        popular: false,
      },
    ],
    factions: [
      {
        key: "civilizations",
        label: "문명",
        icon: Users,
        color: "bg-teal-100 text-teal-700",
        defaultValue: "인간 제국",
        popular: true,
      },
      {
        key: "politics",
        label: "정치체계",
        icon: Crown,
        color: "bg-indigo-100 text-indigo-700",
        defaultValue: "왕정",
        popular: true,
      },
      {
        key: "laws",
        label: "법률",
        icon: Scale,
        color: "bg-pink-100 text-pink-700",
        defaultValue: "성문법",
        popular: false,
      },
    ],
    cosmology: [
      {
        key: "magicSystem",
        label: "마법 체계",
        icon: Zap,
        color: "bg-sky-100 text-sky-700",
        defaultValue: "마나 기반",
        popular: true,
      },
      {
        key: "technologyLevel",
        label: "기술 수준",
        icon: Settings,
        color: "bg-orange-100 text-orange-700",
        defaultValue: "중세 수준",
        popular: true,
      },
      {
        key: "pantheon",
        label: "신격 체계",
        icon: Star,
        color: "bg-violet-100 text-violet-700",
        defaultValue: "다신교",
        popular: false,
      },
      {
        key: "supernaturalElements",
        label: "초자연적 요소",
        icon: Moon,
        color: "bg-gray-100 text-gray-700",
        defaultValue: "영혼, 요정",
        popular: false,
      },
    ],
    geography: [
      {
        key: "continents",
        label: "대륙",
        icon: Mountain,
        color: "bg-emerald-100 text-emerald-700",
        defaultValue: "3개 대륙",
        popular: true,
      },
      {
        key: "landmarks",
        label: "주요 지형",
        icon: Landmark,
        color: "bg-stone-100 text-stone-700",
        defaultValue: "신성한 산",
        popular: false,
      },
    ],
  };
