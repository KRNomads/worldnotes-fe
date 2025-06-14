import { CHARACTER_BASICINFO_TEMPLATES } from "./character-basicinfo-templates";
import { WORLDBUILDING_BASICINFO_TEMPLATES } from "./details-basicinfo-templates";
import { EVENT_BASICINFO_TEMPLATES } from "./event-basicinfo-templates";
import { ITEM_BASICINFO_TEMPLATES } from "./item-basicinfo-templates";
import { PLACE_BASICINFO_TEMPLATES } from "./place-basicinfo-templates";
import { TemplateMap } from "../type/TemplateMap";

export const TEMPLATE_MAP: TemplateMap = {
  PLACE: PLACE_BASICINFO_TEMPLATES,
  CHARACTER: CHARACTER_BASICINFO_TEMPLATES,
  EVENT: EVENT_BASICINFO_TEMPLATES,
  DETAIL: WORLDBUILDING_BASICINFO_TEMPLATES,
  ITEM: ITEM_BASICINFO_TEMPLATES,
};
