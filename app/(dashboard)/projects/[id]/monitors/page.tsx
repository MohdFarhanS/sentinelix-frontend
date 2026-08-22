"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMonitors, useMonitorChecks, useDeleteMonitor } from "@/hooks/use-monitors"
import { useRealtimeMonitors } from "@/hooks/use-realtime-monitors"
import { MonitorList } from "@/components/monitor-list"
import { UptimeChart } from "@/components/uptime-charts"
import { CreateMonitorForm } from "@/components/create-monitor-form"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api-client"

export default function MonitorsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, isLoading, isError, error } = useMonitors(params.id);
    const { data: checksData } = useMonitorChecks(selectedId ?? "");
    const deleteMonitor = useDeleteMonitor(params.id);

    useRealtimeMonitors(params.id);

    if (isError) {
        if (error instanceof ApiError && error.status === 401) {
            router.push("/login");
            return null;
        }
        if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
            return <p className="text-sm text-red-600">{error.message}</p>;
        }
        return <p className="text-sm text-red-600">Failed to load monitors.</p>;
    }

    const monitors = data?.data ?? [];
    const selectedMonitor = monitors.find((m) => m.id === selectedId) ?? null;

    function handleDelete(id: string) {
        if (!confirm("Delete this monitor? This cannot be undone.")) return;
        deleteMonitor.mutate(id, {
            onSuccess: () => {
                if (selectedId === id) setSelectedId(null);
            },
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold">Monitors</h1>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {monitors.length} monitor{monitors.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button onClick={() => setShowForm((v) => !v)}>
                    {showForm ? "Cancel" : "Add Monitor"}
                </Button>
            </div>

            {showForm && (
                <CreateMonitorForm projectId={params.id} onCreated={() => setShowForm(false)} />
            )}

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading monitors...</p>
            ) : (
                <MonitorList
                    monitors={monitors}
                    selectedId={selectedId}
                    onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
                    onDelete={handleDelete}
                />
            )}

            {selectedMonitor && (
                <div className="space-y-2 rounded-md border bg-card p-4">
                    <p className="truncate text-sm font-medium">{selectedMonitor.name || selectedMonitor.url}</p>
                    <UptimeChart checks={checksData?.data ?? []} />
                </div>
            )}
        </div>
    );
}