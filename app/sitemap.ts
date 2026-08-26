import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sentinelix.app";

// Sengaja MINIMAL — cuma landing page (/). /status/[slug] TIDAK diinclude
// (keputusan sadar, lihat diskusi privacy: platform tidak proaktif bikin
// direktori publik semua customer — status page individual tetap
// crawlable/indexable, cuma tidak di-listing terpusat di sini). (auth) &
// (dashboard) sudah noindex, tidak relevan masuk sitemap sama sekali.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}