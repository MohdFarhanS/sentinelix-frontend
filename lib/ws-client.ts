type MessageHandler = (message: RealtimeMessage) => void;

export type RealtimeMessage = {
    type: "issue.created" | "issue.updated" | "monitor.status_changed";
    data: unknown;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";


// Derive ws:// atau wss:// dari NEXT_PUBLIC_API_URL, satu sumber
// kebenaran, tidak perlu env var yang terpisah buat WS.
function toWsUrl(projectId: string): string {
    const wsBase = API_BASE_URL.replace(/^http/, "ws");
    return `${wsBase}/ws/projects/${projectId}`;
}

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;

// RealtimeConnection membungkus 1 koneksi WebSocket ke satu project,
// dengan reconnect otomatis (exponential backoff, capped). Sengaja tidak
// tahu apa-apa soal React/TanStack Query — murni lifecycle koneksi, biar
// gampang ditest/dipakai ulang di luar konteks hook kalau nanti perlu.
export class RealtimeConnection {
    private socket: WebSocket | null = null;
    private reconnectAttempt = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private manuallyClosed = false;

    constructor(
        private readonly projectId: string,
        private readonly onMessage: MessageHandler,
        private readonly onStatusChange?: (status: "connecting" | "open" | "closed") => void
    ) {}

    connect() {
        this.manuallyClosed = false;
        this.onStatusChange?.("connecting");

        const socket = new WebSocket(toWsUrl(this.projectId));
        this.socket = socket;

        socket.onopen = () => {
            this.reconnectAttempt = 0;
            this.onStatusChange?.("open");
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as RealtimeMessage;
                this.onMessage(message);
            } catch {

            }
        };

        socket.onclose = () => {
            this.onStatusChange?.("closed");
            if (!this.manuallyClosed) {
                this.scheduleReconnect();
            }
        };

        socket.onerror = () => {
            // onclose akan tetap terpanggil setelah onerror (browser behavior),
            // jadi reconnect logic cukup ditaruh di onclose saja — tidak perlu
            // duplikasi di sini.
            socket.close();
        };
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) return;

        const delay = Math.min(
            RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt,
            RECONNECT_MAX_DELAY_MS
        );
        this.reconnectAttempt += 1;

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    disconnect() {
        this.manuallyClosed = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.socket?.close();
        this.socket = null;
    }
}