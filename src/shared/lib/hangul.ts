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
  ];
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0) - 44032;
      if (code >= 0 && code <= 11171) {
        return consonants[Math.floor(code / 588)];
      }
      return char;
    })
    .join("");
};
