"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { IssueEventResponse } from "@/types";

export function useIssueEvents(issueId: string, limit = 50) {
    return useQuery({
        queryKey: ["issue", issueId, "events", limit],
        queryFn: () => apiClient.get<IssueEventResponse>(`/issues/${issueId}/events?limit=${limit}`),
        enabled: !!issueId,
    });
}