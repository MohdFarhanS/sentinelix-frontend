"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 30 detik cukup buat dashboard biasa — realtime beneran
            // nyusul di Sprint 5 lewat WebSocket, bukan polling agresif di sini.
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    // Dengar event dari lib/api-client.ts — dipicu kalau retry-on-401
    // (access token expired) GAGAL juga (refresh token invalid/expired/
    // revoked, bukan sekadar access token yang expired biasa).
    function handleAuthExpired() {
      // Clear SELURUH cache TanStack Query — cegah data user lama
      // "nyangkut" sekilas kelihatan (flash) kalau user berikutnya login
      // pakai akun beda di browser yang sama (misal shared/public
      // computer, atau logout-login cepat pas testing manual).
      queryClient.clear();
      router.push("/login");
    }

    window.addEventListener("sentinelix:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("sentinelix:auth-expired", handleAuthExpired);
  }, [queryClient, router]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}