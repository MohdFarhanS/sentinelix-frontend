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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
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

    if (!res.ok) {
        let code = "UNKNOWN_ERROR";
        let message = "Terjadi kesalaham";
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