"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { IssueDetail } from "@/types";

export function useIssue(issueId: string) {
    return useQuery({
        queryKey: ["issue", issueId],
        queryFn: () => apiClient.get<IssueDetail>(`/issues/${issueId}`),
        enabled: !!issueId,
    });
}