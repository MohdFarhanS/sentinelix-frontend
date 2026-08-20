"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RealtimeConnection, type RealtimeMessage } from "@/lib/ws-client";

// Pola sama persis dengan useRealtimeIssues — connect ke WS project
// tertentu, invalidate query monitor list begitu ada event masuk.
// Backend sekarang beneran publish monitor.status_changed (lihat
// check_monitor.go, ditambah bareng sesi ini) tiap kali status monitor
// transisi (naik ATAU turun), jadi refetch di sini bakal reflect status
// terbaru nyaris instan.
export function useRealtimeMonitors(projectId: string) {
    const queryClient = useQueryClient();
    const connectionRef = useRef<RealtimeConnection | null>(null);

    useEffect(() => {
        if (!projectId) return;

        function handleMessage(message: RealtimeMessage) {
            if (message.type === "monitor.status_changed") {
                queryClient.invalidateQueries({ queryKey: ["monitors", projectId] });
            }
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