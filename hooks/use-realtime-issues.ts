"use-client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RealtimeConnection, type RealtimeMessage } from "@/lib/ws-client";

// useRealtimeIssues cuma tanggung jawab buat 1 hal: connect ke WS project
// tertentu, dan invalidate query issue list begitu ada event masuk. Update
// data konkret (row baru, count baru, dsb) diserahkan ke TanStack Query
// lewat refetch — bukan manual cache merge (payload WS sengaja minim,
// lihat 04-API-DESIGN.md §8).
export function useRealtimeIssues(projectId: string) {
    const queryClient = useQueryClient();
    const connectionRef = useRef<RealtimeConnection | null>(null);

    useEffect(() => {
        if (!projectId) return;

        function handleMessage(message: RealtimeMessage) {
            if (message.type === "issue.created" || message.type === "issue.updated") {
                // Invalidate semua variant query issue list buat project ini
                // (apapun filter status/page/limit-nya) — TanStack Query akan
                // refetch query yang sedang aktif dipakai komponen manapun.
                queryClient.invalidateQueries({ queryKey: ["issues", projectId] });
            }
            // monitor.status_changed belum relevan di Sprint 5 — diabaikan
            // dulu, akan ditangani pas fitur uptime monitor (Sprint 7).
        }

        const connection = new RealtimeConnection(projectId, handleMessage);
        connectionRef.current = connection;
        connection.connect();

        return () => {
            connection.disconnect();
            connectionRef.current = null;
        };
    }, [projectId, queryClient]);
}