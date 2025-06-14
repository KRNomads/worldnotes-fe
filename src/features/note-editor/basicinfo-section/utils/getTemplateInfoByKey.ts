import { BasicInfoItem } from "../type/BasicInfoItem";
import { TemplateMap } from "../type/TemplateMap";

export function findInfoByKeyInTemplate<T extends keyof TemplateMap>(
  template: TemplateMap[T],
  key: string | null | undefined
): BasicInfoItem | null {
  if (!key) return null;
  for (const category of Object.values(template)) {
    const found = category.find((item) => item.key === key);
    if (found) return found;
  }
  return null;
}
