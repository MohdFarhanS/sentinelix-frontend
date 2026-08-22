import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStatusPage, type OverallStatus } from "@/lib/status-api-client";

// ISR — bukan SSR murni (force-dynamic). Sesuai keputusan sebelumnya:
// data status monitor tidak perlu fresh tiap milidetik, dan ISR lebih
// selaras NFR-9 (kalau status-api lambat/gagal sesaat, Next.js masih
// bisa serve versi cache terakhir alih-alih ikut gagal total).
export const revalidate = 60;

const overallStatusLabel: Record<OverallStatus, string> = {
    operational: "All Systems Operational",
    degraded_performance: "Degraded Performance",
    major_outage: "Major Outage",
};

const overallStatusStyle: Record<OverallStatus, string> = {
    operational: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
    degraded_performance: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
    major_outage: "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20",
};

export async function generateMetadata({
    params,
}: PageProps<"/status/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const data = await getStatusPage(slug);

    if (!data) {
        return { title: "Status Page Not Found — SentinelIX" };
    }

    return {
        title: `${data.project_name} Status — SentinelIX`,
        description: `Live uptime status for ${data.project_name}. Current status: ${overallStatusLabel[data.overall_status]}.`,
    };
}

export default async function StatusPage({ params }: PageProps<"/status/[slug]">) {
    const { slug } = await params;
    const data = await getStatusPage(slug);

    if (!data) {
        notFound();
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-12">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">{data.project_name}</h1>
                    <span
                        className={`mt-2 inline-flex items-center rounded px-2.5 py-1 text-sm font-medium ${overallStatusStyle[data.overall_status]}`}
                    >
                        {overallStatusLabel[data.overall_status]}
                    </span>
                </div>

                <div className="divide-y rounded-md border">
                    {data.monitors.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">
                            No monitors configured for this project.
                        </p>
                    ) : (
                        data.monitors.map((monitor) => (
                            <div
                                key={monitor.name}
                                className="flex items-center justify-between gap-3 px-4 py-3"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2 w-2 rounded-full ${monitor.is_up ? "bg-emerald-400" : "bg-red-400"}`}
                                    />
                                    <span className="text-sm font-medium">{monitor.name}</span>
                                </div>
                                <span className="font-mono text-xs text-muted-foreground">
                                    {monitor.uptime_30d.toFixed(2)}% uptime (30d)
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}