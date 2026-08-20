"use-client"

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ProjectListResponse } from "@/types";

export function useProjects() {
    return useQuery({
        queryKey: ["projects"],
        queryFn: () => apiClient.get<ProjectListResponse>("/projects"),
    })
}
