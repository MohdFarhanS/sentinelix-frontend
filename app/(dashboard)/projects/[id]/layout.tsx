"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
    { href: (id: string) => `/projects/${id}/issues`, label: "Issues"},
    { href: (id: string) => `/projects/${id}/monitors`, label: "Monitors"},
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    const params = useParams<{ id: string }>();
    const pathName = usePathname();

    return (
        <div className="space-y-6">
            <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                ← All Projects
            </Link>

            <nav className="flex gap-1 border-b">
                {TABS.map((tab) => {
                    const href = tab.href(params.id);
                    const active = pathName?.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                                active
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>

            {children}
        </div>
    );
}