import { cn } from "@/lib/utils";
import type { MonitorCheck } from "@/types";

const MAX_BARS = 50;

function formatCheckedAt(iso: string) {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

// Uptime bar ala status page (UptimeRobot/Better Uptime) — tiap segmen
// = 1 check, hijau/merah. Custom SVG-less div grid, bukan chart library:
// data kita biner (is_up), bukan numerik kontinu yang butuh axis/scaling,
// jadi library kayak recharts itu overkill (YAGNI).
export function UptimeChart({ checks }: { checks: MonitorCheck[] }) {
    if (checks.length === 0) {
        return (
            <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                No checks recorded yet.
            </div>
        );
    }

    // API balikin DESC (terbaru duluan) — dibalik biar oldest-left,
    // newest-right, konvensi standar status page.
    const ordered = [...checks].reverse().slice(-MAX_BARS);
    const upCount = checks.filter((c) => c.is_up).length;
    const uptimePct = ((upCount / checks.length) * 100).toFixed(1);

    return (
        <div className="space-y-2">
            <div className="flex items-end gap-[3px]">
                {ordered.map((check) => (
                    <div
                        key={check.id}
                        title={`${check.is_up ? "Up" : "Down"} · ${check.status_code || "no response"} · ${formatCheckedAt(check.checked_at)}`}
                        className={cn(
                            "h-6 flex-1 rounded-sm transition-opacity hover:opacity-80",
                            check.is_up ? "bg-primary" : "bg-destructive"
                        )}
                    />
                ))}
            </div>
            <p className="font-mono text-xs text-muted-foreground">
                {uptimePct}% uptime · last {checks.length} check{checks.length !== 1 ? "s" : ""}
            </p>
        </div>
    );
}