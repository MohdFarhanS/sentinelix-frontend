export type Project = {
    id: string;
    name: string;
    slug: string;
};

export type ProjectListResponse = {
    data: Project[];
};

export type IssueStatus = "unresolved" | "resolved" | "ignored";

export type Issue = {
    id: string;
    title: string;
    level: string;
    status: IssueStatus;
    count: number;
    last_seen: string;
};

export type IssueListResponse = {
    data: Issue[];
    meta: {
        page: number;
        total: number;
    };
};

export type IssueDetail = Issue & {
    first_seen: string;
};

export type IssueEvent = {
    id: string;
    occurred_at: string,
    stack_trace: string;
    context: Record<string, unknown>,
};

export type IssueEventResponse = {
    data: IssueEvent[];
};

export type CreateProjectResponse = {
    id: string;
    name: string;
    slug: string;
    api_key: string;
};

export type MonitorStatus = "unknown" | "up" | "down";
export type MonitorChannel = "email" | "slack";

export type Monitor = {
    id: string;
    project_id: string;
    url: string;
    interval_sec: number;
    channel: MonitorChannel;
    channel_target: string;
    failure_threshold: number;
    status: MonitorStatus;
    created_at: string;
};

export type MonitorListResponse = {
    data: Monitor[];
};

export type MonitorCheck = {
    id: string;
    status_code: number;
    latency_ms: number;
    is_up: boolean;
    checked_at: string;
};

export type MonitorCheckListResponse = {
    data: MonitorCheck[];
};

export type CreateMonitorInput = {
    url: string;
    interval_sec: number;
    channel: MonitorChannel;
    channel_target: string;
    failure_threshold?: number;
}