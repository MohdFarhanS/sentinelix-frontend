import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SentinelIX",
  description: "Error monitoring & uptime dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // "dark" ditambah di sini, bukan lewat toggle — sesuai keputusan:
      // dark mode default, bukan light/dark switcher.
      //
      // Font di-self-host lewat package `geist` (next/font/local di
      // baliknya) — BUKAN next/font/google lagi. Alasan: next/font/google
      // butuh fetch ke fonts.googleapis.com SAAT BUILD TIME, dan itu
      // sempat gagal total kalau koneksi ke domain itu diblokir/bermasalah
      // (kejadian nyata pas Sprint 7). Package `geist` menyimpan file
      // .woff2 langsung di node_modules — nol dependency jaringan pas
      // build, di jaringan manapun. Visual hasilnya identik (masih font
      // Geist yang sama persis), cuma sumbernya lokal.
      className={`dark ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}