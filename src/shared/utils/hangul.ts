import { getChoseong } from "es-hangul";

export function getInitialConsonantsWithEsHangul(text: string): string {
  if (!text) {
    return "";
  }

  return text
    .split("")
    .map((char) => {
      const disassembled = getChoseong(char);
      return disassembled[0];
    })
    .join("");
}
