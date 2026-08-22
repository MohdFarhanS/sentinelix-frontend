import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
    return (
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
            <p className="font-mono text-sm text-muted-foreground">404</p>
            <h1 className="text-lg font-semibold">Page not found</h1>
            <p className="max-w-md text-sm text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or may have
                been moved.
            </p>
            <Link href="/projects" className={cn(buttonVariants(), "mt-2")}>
                Go to dashboard
            </Link>
        </main>
    );
}