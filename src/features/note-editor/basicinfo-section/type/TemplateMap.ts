import { BasicInfoItem } from "./BasicInfoItem";

export type AnyTemplate =
  | CharacterTemplate
  | DetailTemplate
  | EventTemplate
  | ItemTemplate
  | PlaceTemplate;

export type TemplateMap = {
  CHARACTER: CharacterTemplate;
  DETAILS: DetailTemplate;
  EVENT: EventTemplate;
  ITEM: ItemTemplate;
  PLACE: PlaceTemplate;
};

// 캐릭터 템플릿
export type CharacterTemplate = Record<CharacterInfoCategory, BasicInfoItem[]>;
type CharacterInfoCategory = "basic" | "attributes" | "background";

// 세계관 설정 템플릿
export type DetailTemplate = Record<DetailBasicInfoCategory, BasicInfoItem[]>;
type DetailBasicInfoCategory =
  | "overview"
  | "history"
  | "factions"
  | "cosmology"
  | "geography";

// 사건 템플릿
export type EventTemplate = Record<EventInfoCategory, BasicInfoItem[]>;
type EventInfoCategory = "basic" | "type" | "participants" | "consequence";

// 아이템 템플릿
export type ItemTemplate = Record<ItemInfoCategory, BasicInfoItem[]>;
type ItemInfoCategory = "basic" | "attributes" | "effects" | "origin";

// 장소 템플릿
export type PlaceTemplate = Record<PlaceBasicInfoCategory, BasicInfoItem[]>;
type PlaceBasicInfoCategory =
  | "basic"
  | "social"
  | "environment"
  | "infrastructure";
