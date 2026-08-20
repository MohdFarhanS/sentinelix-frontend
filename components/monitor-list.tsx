"use client"

import { cn } from "@/lib/utils"
import type { Monitor } from "@/types"

const statusStyle: Record<string, string> = {
    up: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
    down: "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20",
    unknown: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
};

export function MonitorList({
    monitors,
    selectedId,
    onSelect,
    onDelete,
}: {
    monitors: Monitor[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    if (monitors.length === 0) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No monitors yet. Add one to start tracking uptime.
            </div>
        );
    }

    return (
        <div className="divide-y rounded-md border">
            {monitors.map((monitor) => {
                const isUp = monitor.status === "up";
                return (
                    <div
                        key={monitor.id}
                        onClick={() => onSelect(monitor.id)}
                        className={cn(
                            "flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                            selectedId === monitor.id && "bg-muted/40"
                        )}
                    >
                        <span
                            className={cn(
                                "sentinel-bracket mt-0.5",
                                isUp ? "sentinel-bracket--on" : "sentinel-bracket--off"
                            )}
                        >
                            {isUp ? "[●]" : "[ ]"}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{monitor.url}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span
                                    className={cn(
                                        "rounded px-1.5 py-0.5 font-mono text-[11px] font-medium",
                                        statusStyle[monitor.status] ?? statusStyle.unknown
                                    )}
                                >
                                    {monitor.status}
                                </span>
                                <span>every {monitor.interval_sec}s</span>
                                <span>·</span>
                                <span>{monitor.channel}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(monitor.id);
                            }}
                            className="shrink-0 text-xs text-muted-foreground hover:text-destructive"
                        >
                            Delete
                        </button>
                    </div>
                );
            })}
        </div>
    );
}