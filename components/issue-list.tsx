import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Issue } from "@/types";
import Link from "next/link";

const levelStyle: Record<string, string> = {
  error: "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20",
  warning: "bg-yellow-500/10 text-yellow-400 ring-1 ring-inset ring-yellow-500/20",
  info: "bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20",
};

function formatLastSeen(iso: string) {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function IssueList({ issues, projectId }: { issues: Issue[]; projectId: string }) {
  if (issues.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No issues match this filter.
      </div>
    );
  }

  return (
    <div className="divide-y rounded-md border">
      {issues.map((issue) => {
        const isUnresolved = issue.status === "unresolved";
        return (
          <Link
            key={issue.id}
            href={`/projects/${projectId}/issues/${issue.id}`}
            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{issue.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[11px] font-medium",
                    levelStyle[issue.level] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {issue.level}
                </span>
                <Badge variant={isUnresolved ? "destructive" : "secondary"} className="text-[11px]">
                  {issue.status}
                </Badge>
                <span className="font-mono">{issue.count}x</span>
                <span>·</span>
                <span>{formatLastSeen(issue.last_seen)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}