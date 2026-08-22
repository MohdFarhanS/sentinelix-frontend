"use client";

import { useRouter } from "next/navigation";

export default function StatusPageError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    function handleRetry() {
        // reset() saja TIDAK CUKUP — itu cuma reset state React error
        // boundary, tidak minta ulang data dari Server Component.
        // router.refresh() yang benar-benar bikin Next.js re-render
        // segment dari server dengan fetch baru ke status-api.
        router.refresh();
        reset();
    }

    return (
        <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
            <h1 className="text-lg font-semibold">Status Temporarily Unavailable</h1>
            <p className="max-w-md text-sm text-muted-foreground">
                We&apos;re having trouble reaching our status data right now.
                This page will automatically show live data again once the
                connection is restored.
            </p>
            <button
                onClick={handleRetry}
                className="mt-2 rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
                Try again
            </button>
        </main>
    );
}