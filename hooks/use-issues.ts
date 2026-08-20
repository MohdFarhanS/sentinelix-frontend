"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { IssueListResponse, IssueStatus } from "@/types";

type UseIssuesParams = {
  projectId: string;
  status?: IssueStatus | "all";
  page?: number;
  limit?: number;
};

export function useIssues({ projectId, status = "all", page = 1, limit = 20 }: UseIssuesParams) {
  const query = new URLSearchParams();
  if (status !== "all") query.set("status", status);
  query.set("page", String(page));
  query.set("limit", String(limit));

  return useQuery({
    queryKey: ["issues", projectId, status, page, limit],
    queryFn: () =>
      apiClient.get<IssueListResponse>(`/projects/${projectId}/issues?${query.toString()}`),
    enabled: !!projectId,
  });
}