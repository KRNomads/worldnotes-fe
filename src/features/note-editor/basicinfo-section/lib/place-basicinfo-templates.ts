import {
  Calendar,
  Globe,
  MapPin,
  Mountain,
  Settings,
  Thermometer,
  Users,
  Zap,
} from "lucide-react";
import { BasicInfoItem } from "../type/BasicInfoItem";

// 카테고리 키 타입 (사실상 이걸 좁히는게 핵심)
type PlaceBasicInfoCategory =
  | "basic"
  | "social"
  | "environment"
  | "infrastructure";

// 전체 템플릿 타입
type PlaceBasicInfoTemplates = {
  [category in PlaceBasicInfoCategory]: BasicInfoItem[];
};

export const PLACE_BASICINFO_TEMPLATES: PlaceBasicInfoTemplates = {
  basic: [
    {
      key: "climate",
      label: "기후",
      icon: Thermometer,
      color: "bg-blue-100 text-blue-700",
      defaultValue: "온대",
      popular: true,
    },
    {
      key: "terrain",
      label: "지형",
      icon: Mountain,
      color: "bg-green-100 text-green-700",
      defaultValue: "평원",
      popular: true,
    },
    {
      key: "population",
      label: "인구",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
      defaultValue: "1,000명",
      popular: true,
    },
    {
      key: "area",
      label: "면적",
      icon: Globe,
      color: "bg-emerald-100 text-emerald-700",
      defaultValue: "100km²",
      popular: false,
    },
    {
      key: "elevation",
      label: "고도",
      icon: Mountain,
      color: "bg-gray-100 text-gray-700",
      defaultValue: "100m",
      popular: false,
    },
    {
      key: "founded",
      label: "설립일",
      icon: Calendar,
      color: "bg-amber-100 text-amber-700",
      defaultValue: "고대",
      popular: false,
    },
  ],
  social: [
    {
      key: "government",
      label: "정치체계",
      icon: Settings,
      color: "bg-indigo-100 text-indigo-700",
      defaultValue: "민주주의",
      popular: true,
    },
    {
      key: "language",
      label: "언어",
      icon: Globe,
      color: "bg-teal-100 text-teal-700",
      defaultValue: "공용어",
      popular: false,
    },
    {
      key: "religion",
      label: "종교",
      icon: Users,
      color: "bg-rose-100 text-rose-700",
      defaultValue: "다신교",
      popular: false,
    },
    {
      key: "culture",
      label: "문화",
      icon: Users,
      color: "bg-violet-100 text-violet-700",
      defaultValue: "전통적",
      popular: false,
    },
    {
      key: "economy",
      label: "경제",
      icon: Globe,
      color: "bg-orange-100 text-orange-700",
      defaultValue: "농업",
      popular: true,
    },
    {
      key: "military",
      label: "군사력",
      icon: Zap,
      color: "bg-red-100 text-red-700",
      defaultValue: "중급",
      popular: false,
    },
  ],
  environment: [
    {
      key: "danger",
      label: "위험도",
      icon: Zap,
      color: "bg-yellow-100 text-yellow-700",
      defaultValue: "낮음",
      popular: true,
    },
    {
      key: "resources",
      label: "자원",
      icon: Globe,
      color: "bg-emerald-100 text-emerald-700",
      defaultValue: "목재",
      popular: true,
    },
    {
      key: "magic",
      label: "마법력",
      icon: Zap,
      color: "bg-indigo-100 text-indigo-700",
      defaultValue: "높음",
      popular: true,
    },
    {
      key: "wildlife",
      label: "야생동물",
      icon: Users,
      color: "bg-green-100 text-green-700",
      defaultValue: "풍부",
      popular: false,
    },
    {
      key: "weather",
      label: "날씨",
      icon: Thermometer,
      color: "bg-sky-100 text-sky-700",
      defaultValue: "온화",
      popular: false,
    },
    {
      key: "seasons",
      label: "계절",
      icon: Calendar,
      color: "bg-cyan-100 text-cyan-700",
      defaultValue: "사계절",
      popular: false,
    },
  ],
  infrastructure: [
    {
      key: "roads",
      label: "도로",
      icon: MapPin,
      color: "bg-stone-100 text-stone-700",
      defaultValue: "잘 정비됨",
      popular: false,
    },
    {
      key: "buildings",
      label: "건물",
      icon: Settings,
      color: "bg-slate-100 text-slate-700",
      defaultValue: "전통 양식",
      popular: false,
    },
    {
      key: "defenses",
      label: "방어시설",
      icon: Zap,
      color: "bg-red-100 text-red-700",
      defaultValue: "성벽",
      popular: false,
    },
    {
      key: "utilities",
      label: "편의시설",
      icon: Settings,
      color: "bg-blue-100 text-blue-700",
      defaultValue: "기본적",
      popular: false,
    },
    {
      key: "transport",
      label: "교통",
      icon: MapPin,
      color: "bg-purple-100 text-purple-700",
      defaultValue: "도보",
      popular: false,
    },
    {
      key: "communication",
      label: "통신",
      icon: Globe,
      color: "bg-pink-100 text-pink-700",
      defaultValue: "전령",
      popular: false,
    },
  ],
};
