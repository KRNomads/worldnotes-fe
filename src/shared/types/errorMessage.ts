export interface ErrorMessage {
  timestamp: string; // ISO 형식의 문자열 (예: 2025-05-30T12:34:56)
  statusCode: number;
  error: string;
  message: string;
}
