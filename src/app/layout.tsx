import "./globals.scss";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

// Inter 폰트 설정
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "World Note",
  description: "당신의 창작활동을 위한 공간",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
