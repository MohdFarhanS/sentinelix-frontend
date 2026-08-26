import type { MetadataRoute } from "next";

// TIDAK ada disallow untuk /login, /register, /projects — SENGAJA.
// Rekomendasi resmi Google (Martin Splitt): disallow & noindex tidak
// boleh saling menggantikan. Disallow cuma cegah crawling, TIDAK
// menjamin halaman hilang dari index (kalau ada situs lain yang link ke
// situ, Google tetap bisa index-nya sebagai URL kosong tanpa deskripsi —
// justru kelihatan lebih buruk). noindex (app/(auth)/layout.tsx,
// app/(dashboard)/layout.tsx) itu mekanisme yang BENERAN menjamin
// halaman tidak muncul di hasil pencarian — tapi WAJIB crawler bisa
// mengunjungi halaman itu dulu buat baca instruksi noindex-nya. Kalau
// robots.txt block duluan, crawler taat aturan justru TIDAK PERNAH
// sampai baca noindex tag-nya sama sekali.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentinelix.app"}/sitemap.xml`,
  };
}