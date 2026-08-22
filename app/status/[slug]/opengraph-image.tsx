import { ImageResponse } from "next/og";
import { getStatusPage, type OverallStatus } from "@/lib/status-api-client";

export const runtime = "edge";
export const revalidate = 60;
export const alt = "Project status page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const overallStatusColor: Record<OverallStatus, string> = {
    operational: "#34d399",
    degraded_performance: "#fbbf24",
    major_outage: "#f87171",
};

const overallStatusLabel: Record<OverallStatus, string> = {
    operational: "All Systems Operational",
    degraded_performance: "Degraded Performance",
    major_outage: "Major Outage",
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let projectName = "Unknown Project";
    let status: OverallStatus = "operational";
    let unavailable = false;

    try {
        const data = await getStatusPage(slug);
        if (data) {
            projectName = data.project_name;
            status = data.overall_status;
        } else {
            projectName = "Status Page Not Found";
        }
    } catch {
        // status-api / Neon compute sedang tidak bisa dijangkau (misal
        // Neon compute quota habis, lihat diskusi 05-ARCHITECTURE.md
        // §6c) — tampilkan OG image netral, BUKAN biarkan seluruh image
        // generation gagal (broken image link kalau di-share ke sosial
        // media pas kebetulan outage).
        projectName = "Status Temporarily Unavailable";
        unavailable = true;
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    backgroundColor: "#0a0a0a",
                    padding: "80px",
                }}
            >
                <div style={{ fontSize: 28, color: "#a1a1aa", display: "flex" }}>
                    SentinelIX Status
                </div>
                <div
                    style={{
                        fontSize: 64,
                        color: "#fafafa",
                        fontWeight: 700,
                        marginTop: 16,
                        display: "flex",
                    }}
                >
                    {projectName}
                </div>
                {!unavailable && (
                    <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 16 }}>
                        <div
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                backgroundColor: overallStatusColor[status],
                                display: "flex",
                            }}
                        />
                        <div style={{ fontSize: 36, color: "#fafafa", display: "flex" }}>
                            {overallStatusLabel[status]}
                        </div>
                    </div>
                )}
            </div>
        ),
        { ...size }
    );
}