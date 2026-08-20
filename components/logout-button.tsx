"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await apiClient.post("/auth/logout");
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Sign Out
    </Button>
  );
}