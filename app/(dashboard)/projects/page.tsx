"use client";

import Link from "next/link";
import { useProjects } from "@/hooks/use-projects";
import { buttonVariants } from "@/components/ui/button";

export default function ProjectsPage() {
  const { data, isLoading, isError } = useProjects();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading projects...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load projects.</p>;
  }

  const projects = data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <Link href="/projects/new" className={buttonVariants({ size: "sm" })}>
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet. Create one to get started.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}/issues`}
                className="block px-4 py-3 hover:bg-muted"
              >
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground">{project.slug}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}