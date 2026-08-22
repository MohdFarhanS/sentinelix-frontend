"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeedLine = {
    bracket: "on" | "off";
    text: string;
    tone: "accent" | "danger" | "muted";
};

const FEED_LINES: FeedLine[] = [
    { bracket: "on", tone: "accent", text: "TypeError: Cannot read property id of undefined" },
    { bracket: "on", tone: "danger", text: "500 /api/checkout — 12 events in 4m" },
    { bracket: "off", tone: "muted", text: "ECONNREFUSED payments.internal:5432" },
    { bracket: "on", tone: "accent", text: "monitor api.newsportal.id — 3 failures" },
];

const toneClass: Record<FeedLine["tone"], string> = {
    accent: "text-primary",
    danger: "text-destructive",
    muted: "text-muted-foreground",
};

function LiveFeed() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
      if (visibleCount >= FEED_LINES.length) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // delay=0 untuk reduced-motion — semua baris tetap muncul lewat
      // setTimeout yang sama (async), BUKAN dipanggil sinkron di body
      // effect. Ini yang bikin lint react-hooks/set-state-in-effect
      // lolos: setState harus terjadi di callback async, tidak pernah
      // langsung di body effect.
      const delay = prefersReducedMotion ? 0 : 700;

      const timer = setTimeout(() => setVisibleCount((c) => c + 1), delay);
      return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
      <div className="rounded-lg border bg-card px-4 py-3.5">
          <div className="flex flex-col gap-2 font-mono text-xs">
              {FEED_LINES.slice(0, visibleCount).map((line, i) => (
                  <div key={i} className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-500">
                      <span
                          className={cn(
                              "sentinel-bracket shrink-0",
                              line.bracket === "on" ? "sentinel-bracket--on" : "sentinel-bracket--off"
                          )}
                      >
                          {line.bracket === "on" ? "[●]" : "[ ]"}
                      </span>
                      <span className={cn(toneClass[line.tone])}>{line.text}</span>
                  </div>
              ))}
          </div>
      </div>
  );
}

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sentinel-scanline border-b px-6 py-4">
                <div className="mx-auto flex max-w-3xl items-center justify-between">
                    <span className="font-mono text-sm font-medium tracking-tight">sentinelix</span>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        status: operational
                    </span>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
                <h1 className="text-3xl font-medium leading-tight sm:text-4xl">
                    Catch errors before
                    <br />
                    your users do.
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Error monitoring and uptime tracking for small teams who don&apos;t
                    need a $26/month bill just to know when production breaks.
                </p>

                <div className="mt-6 flex gap-2.5">
                    <Link href="/login" className={buttonVariants()}>
                        Get started
                    </Link>
                    <Link
                        href="https://github.com/MohdFarhanS/sentinelix-backend"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ variant: "outline" })}
                    >
                        View on GitHub
                    </Link>
                </div>

                <div className="mt-10 max-w-md">
                    <LiveFeed />
                </div>
            </main>
        </div>
    );
}