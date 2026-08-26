const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
    constructor(
        public status: number,
        public code: string,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

type RequestOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
}

// Path yang TIDAK BOLEH memicu retry-on-401. /auth/refresh sendiri: kalau
// dia yang gagal 401 (refresh token invalid/expired/revoked), mencoba
// refresh LAGI bakal infinite loop. /auth/login & /auth/register: 401 di
// situ murni soal kredensial salah, bukan token expired — retry tidak
// relevan sama sekali.
const AUTH_EXEMPT_PATHS = ["/auth/refresh", "/auth/login", "/auth/register"];

// Dedup refresh call yang konkuren — BUKAN cuma optimasi performa. Tanpa
// ini, beberapa request yang barengan dapat 401 (lazim terjadi — TanStack
// Query nembak banyak query paralel) bakal masing-masing panggil
// POST /auth/refresh sendiri-sendiri. Karena refresh token DIROTASI tiap
// dipanggil (backend Sprint 9, reuse detection), refresh kedua yang jalan
// bakal ngirim refresh token yang SUDAH di-revoke oleh refresh pertama —
// backend mendeteksi itu sebagai reuse/pencurian token, lalu invalidate
// SEMUA sesi user (RevokeAllByUserID). Dedup ini mencegah false-positive
// "token theft" dari trafik aplikasi normal, bukan cuma soal efisiensi.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });
            return res.ok;
        } catch {
            return false;
        } finally {
            // Reset SETELAH promise selesai (bukan langsung) — request
            // yang datang SELAMA refresh masih berlangsung ikut nunggu
            // promise yang sama lewat pengecekan di baris pertama.
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// notifyAuthExpired — sengaja pakai CustomEvent (bukan import next/navigation
// langsung ke file ini). lib/api-client.ts itu plain TypeScript, tidak
// terikat React/Next.js — routing/redirect adalah concern komponen React
// di layer atas (root layout), bukan lib fetch wrapper ini. Event listener-
// nya perlu dipasang di komponen terpisah.
function notifyAuthExpired() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sentinelix:auth-expired"));
    }
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
    const { body, headers, ...rest } = options;
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        // WAJIB: tanpa ini, browser tidak kirim httpOnly cookie access_token
        // ke request cross-origin (frontend :3000 -> backend :8080).
        credentials: "include",
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Retry-on-401: access token expired (15 menit, Sprint 9) — coba
    // refresh SEKALI (isRetry mencegah infinite loop kalau retry-nya
    // sendiri masih dapat 401), baru propagate error kalau refresh gagal.
    if (res.status === 401 && !isRetry && !AUTH_EXEMPT_PATHS.some((p) => path.startsWith(p))) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return request<T>(path, options, true);
        }
        notifyAuthExpired();
        throw new ApiError(401, "SESSION_EXPIRED", "Sesi Anda telah berakhir, silakan login kembali");
    }

    if (!res.ok) {
        let code = "UNKNOWN_ERROR";
        let message = "Terjadi kesalahan";
        try {
            const errBody = await res.json();
            code = errBody?.error?.code ?? code;
            message = errBody?.error?.message ?? message;
        } catch {
            // response bukan JSON (misal 500 tanpa body) — pakai default message
        }
        throw new ApiError(res.status, code, message);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}

export const apiClient = {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}