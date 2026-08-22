"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, 
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateMonitor } from "@/hooks/use-monitors";
import { ApiError } from "@/lib/api-client";
import type { MonitorChannel } from "@/types";

export function CreateMonitorForm({
    projectId,
    onCreated,
}: {
    projectId: string;
    onCreated?: () => void;
}) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [intervalSec, setIntervalSec] = useState(60);
    const [channel, setChannel] = useState<MonitorChannel>("email");
    const [channelTarget, setChannelTarget] = useState("");
    const [failureThreshold, setFailureThreshold] = useState(3);
    const [formError, setFormError] = useState<string | null>(null);

    const { mutate, isPending } = useCreateMonitor(projectId);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);
        mutate(
            {
                url,
                name: name || undefined,
                interval_sec: intervalSec,
                channel,
                channel_target: channelTarget,
                failure_threshold: failureThreshold,
            },
            {
                onSuccess: () => {
                    setName("");
                    setUrl("");
                    setChannelTarget("");
                    onCreated?.();
                },
                onError: (err) => {
                    setFormError(err instanceof ApiError ? err.message : "Failed to create monitor.");
                },
            }
        );
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="name">Name (optional)</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="API Health"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com/health"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="interval">Interval (seconds)</Label>
                    <Input
                        id="interval"
                        type="number"
                        min={60}
                        step={10}
                        value={intervalSec}
                        onChange={(e) => setIntervalSec(Number(e.target.value))}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="threshold">Failure threshold</Label>
                    <Input
                        id="threshold"
                        type="number"
                        min={1}
                        value={failureThreshold}
                        onChange={(e) => setFailureThreshold(Number(e.target.value))}
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Channel</Label>
                    <Select value={channel} onValueChange={(v) => setChannel(v as MonitorChannel)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="slack">Slack</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="target">
                        {channel === "email" ? "Email address" : "Slack webhook URL"}
                    </Label>
                    <Input
                        id="target"
                        value={channelTarget}
                        onChange={(e) => setChannelTarget(e.target.value)}
                        required
                    />
                </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Add Monitor"}
            </Button>
        </form>
    );
}