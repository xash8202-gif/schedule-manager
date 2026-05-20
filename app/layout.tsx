import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "개인 일정 매니저",
  description: "Supabase와 CSV 업로드를 지원하는 개인 일정 관리 앱",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 text-sm font-semibold">
            <Link href="/dashboard">대시보드</Link>
            <Link href="/calendar">캘린더</Link>
            <Link href="/list">리스트</Link>
            <Link href="/import">CSV 업로드</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
