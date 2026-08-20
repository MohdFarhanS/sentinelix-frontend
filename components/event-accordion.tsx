"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { IssueEvent } from "@/types";

function formatOccurredAt(iso: string) {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "medium" });
}

export function EventAccordion({ events }: { events: IssueEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No events recorded yet.
      </div>
    );
  }

  return (
    <Accordion multiple={false} className="rounded-md border">
      {events.map((event) => (
        <AccordionItem key={event.id} value={event.id} className="px-4">
          <AccordionTrigger className="font-mono text-xs">
            {formatOccurredAt(event.occurred_at)}
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Stack trace</p>
              <pre className="overflow-x-auto rounded bg-muted p-3 font-mono text-xs">
                {event.stack_trace || "(no stack trace)"}
              </pre>
            </div>
            {Object.keys(event.context ?? {}).length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Context</p>
                <pre className="overflow-x-auto rounded bg-muted p-3 font-mono text-xs">
                  {JSON.stringify(event.context, null, 2)}
                </pre>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}