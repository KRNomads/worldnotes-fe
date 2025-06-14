import {
  Package,
  Star,
  Zap,
  Sword,
  Shield,
  Gem,
  MapPin,
  Users,
  Hammer,
  Coins,
  AlertTriangle,
  BookOpen,
  Lock,
  Target,
} from "lucide-react";
import { BasicInfoItem } from "../type/BasicInfoItem";

type ItemInfoCategory = "basic" | "attributes" | "effects" | "origin";

type ItemBasicInfoTemplates = {
  [category in ItemInfoCategory]: BasicInfoItem[];
};

export const ITEM_BASICINFO_TEMPLATES: ItemBasicInfoTemplates = {
  basic: [
    {
      key: "itemName",
      label: "아이템명",
      icon: Package,
      color: "bg-blue-100 text-blue-700",
      defaultValue: "이름 없는 아이템",
      popular: true,
    },
    {
      key: "itemType",
      label: "아이템 종류",
      icon: Sword,
      color: "bg-purple-100 text-purple-700",
      defaultValue: "무기",
      popular: true,
    },
    {
      key: "description",
      label: "설명",
      icon: BookOpen,
      color: "bg-teal-100 text-teal-700",
      defaultValue: "설명이 없습니다.",
      popular: true,
    },
  ],
  attributes: [
    {
      key: "rarity",
      label: "희귀도",
      icon: Star,
      color: "bg-yellow-100 text-yellow-700",
      defaultValue: "일반",
      popular: true,
    },
    {
      key: "value",
      label: "가치",
      icon: Coins,
      color: "bg-amber-100 text-amber-700",
      defaultValue: "100골드",
      popular: false,
    },
    {
      key: "weight",
      label: "무게",
      icon: Target,
      color: "bg-stone-100 text-stone-700",
      defaultValue: "1kg",
      popular: false,
    },
  ],
  effects: [
    {
      key: "power",
      label: "공격력",
      icon: Zap,
      color: "bg-red-100 text-red-700",
      defaultValue: "10",
      popular: true,
    },
    {
      key: "defense",
      label: "방어력",
      icon: Shield,
      color: "bg-green-100 text-green-700",
      defaultValue: "5",
      popular: true,
    },
    {
      key: "specialEffect",
      label: "특수 효과",
      icon: Gem,
      color: "bg-indigo-100 text-indigo-700",
      defaultValue: "없음",
      popular: false,
    },
    {
      key: "durability",
      label: "내구도",
      icon: Hammer,
      color: "bg-orange-100 text-orange-700",
      defaultValue: "100%",
      popular: false,
    },
  ],
  origin: [
    {
      key: "creator",
      label: "제작자",
      icon: Users,
      color: "bg-pink-100 text-pink-700",
      defaultValue: "미상",
      popular: false,
    },
    {
      key: "originPlace",
      label: "출처",
      icon: MapPin,
      color: "bg-cyan-100 text-cyan-700",
      defaultValue: "불명",
      popular: false,
    },
    {
      key: "restrictions",
      label: "사용 제한",
      icon: Lock,
      color: "bg-gray-100 text-gray-700",
      defaultValue: "없음",
      popular: false,
    },
    {
      key: "dangerLevel",
      label: "위험도",
      icon: AlertTriangle,
      color: "bg-rose-100 text-rose-700",
      defaultValue: "낮음",
      popular: false,
    },
  ],
};
