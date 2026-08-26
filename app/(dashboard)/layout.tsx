import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

// Seluruh route di bawah (dashboard) — /projects, /projects/[id]/issues,
// dst — auth-gated, tidak berguna muncul di hasil pencarian (lihat
// diskusi soal robots.txt/soft-404 di app/robots.ts). noindex di sini
// LEBIH KUAT dari robots.txt: robots.txt cuma "permintaan sopan" ke
// crawler yang taat, meta tag noindex ini yang beneran instruksikan
// Google untuk TIDAK menyimpan halaman ini di index sama sekali walau
// crawler sempat mampir ke situ.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sentinel-scanline border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/projects" className="font-semibold tracking-tight">
            SentinelIX
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}