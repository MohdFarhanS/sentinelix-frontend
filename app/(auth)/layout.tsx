import type { Metadata } from "next";

// Cakup /login DAN /register sekaligus — keduanya "use client" (form
// interaktif), jadi TIDAK BISA export metadata langsung dari page.tsx
// masing-masing (Next.js App Router wajibkan metadata di Server
// Component). Layout ini murni pass-through, tidak ubah UI apapun.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}