"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
    CreateMonitorInput,
    Monitor,
    MonitorCheckListResponse,
    MonitorListResponse,
} from "@/types"

export function useMonitors(projectId: string) {
    return useQuery({
        queryKey: ["monitors", projectId],
        queryFn: () => apiClient.get<MonitorListResponse>(`/projects/${projectId}/monitors`),
        enabled: !!projectId,
    });
}

export function useMonitorChecks(monitorId: string) {
    return useQuery({
        queryKey: ["monitor-checks", monitorId],
        queryFn: () => apiClient.get<MonitorCheckListResponse>(`/monitors/${monitorId}/checks`),
        enabled: !!monitorId,
    });
}

export function useCreateMonitor(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateMonitorInput) =>
            apiClient.post<Monitor>(`/projects/${projectId}/monitors`, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["monitors", projectId] });
        }
    })
}

export function useDeleteMonitor(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (monitorId: string) => apiClient.delete<void>(`/monitors/${monitorId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["monitors", projectId] });
        },
    });
}