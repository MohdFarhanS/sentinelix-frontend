"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useIssues } from "@/hooks/use-issues";
import { IssueList } from "@/components/issue-list";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { IssueStatus } from "@/types";
import { useRealtimeIssues } from "@/hooks/use-realtime-issues";

const LIMIT = 20;

export default function IssuesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<IssueStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useIssues({
    projectId: params.id,
    status,
    page,
    limit: LIMIT,
  });

  const { data: unresolvedSummary } = useIssues({
    projectId: params.id,
    status: "unresolved",
    page: 1,
    limit: 1,
  });

  useRealtimeIssues(params.id);

  if (isError) {
    if (error instanceof ApiError && error.status === 401) {
      router.push("/login");
      return null;
    }
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      return <p className="text-sm text-red-600">{error.message}</p>;
    }
    return <p className="text-sm text-red-600">Failed to load issues.</p>;
  }

  const issues = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const unresolvedCount = unresolvedSummary?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Issues</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {total} issue{total !== 1 ? "s" : ""} ·{" "}
            <span className={cn(unresolvedCount > 0 && "text-primary")}>
              {unresolvedCount} unresolved
            </span>
          </p>
        </div>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as IssueStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="ignored">Ignored</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading issues...</p>
      ) : (
        <IssueList issues={issues} projectId={params.id} />
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="font-mono text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}