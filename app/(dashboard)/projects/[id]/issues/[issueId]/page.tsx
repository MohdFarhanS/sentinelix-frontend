"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useIssue } from "@/hooks/use-issue";
import { useIssueEvents } from "@/hooks/use-issue-events";
import { EventAccordion } from "@/components/event-accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";

const levelStyle: Record<string, string> = {
    error: "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 ring-1 ring-inset ring-yellow-500/20",
    info: "bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20",
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default function IssueDetailPage() {
    const params = useParams<{ id: string; issueId: string }>();
    const router = useRouter();

    const { data: issue, isLoading: issueLoading, isError, error } = useIssue(params.issueId);
    const { data: eventsData, isLoading: eventsLoading } = useIssueEvents(params.issueId);

    if (isError) {
        if (error instanceof ApiError && error.status === 401) {
            router.push("/login");
            return null;
        }
        if (error instanceof ApiError && (error.status === 403 || error.status === 401)) {
            return (
                <div className="space-y-4">
                    <BackLink projectId={params.id} />
                    <p className="text-sm text-red-600">{error.message}</p>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                <BackLink projectId={params.id} />
                <p className="text-sm text-red-600">Failed to load issue detail.</p>
            </div>
        );
    }

    if (issueLoading || !issue) {
        return (
            <div className="space-y-4">
                <BackLink projectId={params.id} />
                <p className="text-sm text-muted-foreground">Loading issue...</p>
            </div>
        );
    }

    const isUnresolved = issue.status === "unresolved";

    return (
        <div className="space-y-6">
            <BackLink projectId={params.id} />

            <div className="space-y-2">
                <div className="flex items-start gap-3">
                <span
                    className={cn(
                    "sentinel-bracket mt-1 shrink-0",
                    isUnresolved ? "sentinel-bracket--on" : "sentinel-bracket--off"
                    )}
                    aria-hidden="true"
                >
                    {isUnresolved ? "[●]" : "[ ]"}
                </span>
                <h1 className="text-xl font-semibold">{issue.title}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 pl-7 text-xs text-muted-foreground">
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
                <span>First seen {formatDate(issue.first_seen)}</span>
                <span>·</span>
                <span>Last seen {formatDate(issue.last_seen)}</span>
                </div>
            </div>

            <div>
                <h2 className="mb-2 text-sm font-medium">Recent Events</h2>
                {eventsLoading ? (
                <p className="text-sm text-muted-foreground">Loading events...</p>
                ) : (
                <EventAccordion events={eventsData?.data ?? []} />
                )}
            </div>
        </div>
    );
}

function BackLink({ projectId }: {projectId: string }) {
    return (
        <Link
            href={`/projects/${projectId}/issues`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
            ← All Issues
        </Link>
    );
}