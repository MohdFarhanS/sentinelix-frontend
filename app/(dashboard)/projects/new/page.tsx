"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CreateProjectResponse } from "@/types";

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createdProject, setCreatedProject] = useState<CreateProjectResponse | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const project = await apiClient.post<CreateProjectResponse>("/projects", { name });
      setCreatedProject(project);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create project.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!createdProject) return;
    await navigator.clipboard.writeText(createdProject.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDialogClose() {
    if (createdProject) {
      router.push(`/projects/${createdProject.id}/issues`);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← All Projects
      </Link>

      <h1 className="text-xl font-semibold">Create New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. NewsPortal Prod"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Project"}
        </Button>
      </form>

      <Dialog open={!!createdProject} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project created successfully</DialogTitle>
            <DialogDescription>
              Save this API key now — it&apos;s only shown once and can&apos;t be viewed
              again after this dialog closes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input readOnly value={createdProject?.api_key ?? ""} className="font-mono text-xs" />
              <Button type="button" variant="outline" onClick={handleCopy}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Done, go to project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}