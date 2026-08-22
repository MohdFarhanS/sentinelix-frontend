"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Fallback GLOBAL — dipakai route manapun yang TIDAK punya error.tsx
// sendiri (misal dashboard /projects/...). app/status/[slug]/error.tsx
// tetap lebih spesifik dan menang untuk segment itu (Next.js pakai
// error.tsx TERDEKAT ke segment yang error, root ini cuma fallback
// terakhir).
export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    function handleRetry() {
        router.refresh();
        reset();
    }

    return (
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="max-w-md text-sm text-muted-foreground">
                An unexpected error occurred. Try again, or head back to your
                dashboard if the problem continues.
            </p>
            <div className="mt-2 flex gap-3">
                <Button variant="outline" onClick={handleRetry}>
                    Try again
                </Button>
                <Button onClick={() => router.push("/projects")}>
                    Go to dashboard
                </Button>
            </div>
        </main>
    );
}