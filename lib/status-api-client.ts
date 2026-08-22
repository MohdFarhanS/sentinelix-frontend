// STATUS_API_URL menunjuk ke cmd/status-api — SERVICE TERPISAH dari
// NEXT_PUBLIC_API_URL (cmd/api). Fetch ini terjadi di server (Server
// Component / opengraph-image), bukan browser, jadi TANPA prefix
// NEXT_PUBLIC_ (tidak perlu ke-expose ke client bundle) dan TANPA
// credentials/cookie (endpoint publik, tanpa auth — lihat
// 05-ARCHITECTURE.md §6c).
const STATUS_API_URL = process.env.STATUS_API_URL ?? "http://localhost:8081";

export type OverallStatus = "operational" | "degraded_performance" | "major_outage";

export type StatusMonitor = {
    name: string;
    is_up: boolean;
    uptime_30d: number;
};

export type StatusPageData = {
    project_name: string;
    overall_status: OverallStatus;
    monitors: StatusMonitor[];
};

// REVALIDATE_SECONDS disamakan dengan MinIntervalSec monitor (60 detik,
// lihat monitor.go backend) — tidak ada gunanya cache lebih fresh dari
// itu, karena data checker sendiri paling cepat update tiap 60 detik.
export const REVALIDATE_SECONDS = 60;

// getStatusPage return null (bukan throw) khusus untuk 404 — caller
// (page.tsx, opengraph-image.tsx) yang putuskan mau notFound() atau
// tampilkan fallback. Error lain (5xx, network) tetap throw, biar Next.js
// error boundary yang handle.
export async function getStatusPage(slug: string): Promise<StatusPageData | null> {
    const res = await fetch(`${STATUS_API_URL}/api/v1/status/${slug}`, {
        next: { revalidate: REVALIDATE_SECONDS },
    });

    if (res.status === 404) {
        return null;
    }
    if (!res.ok) {
        throw new Error(`status-api returned ${res.status}`);
    }
    return res.json() as Promise<StatusPageData>;
}