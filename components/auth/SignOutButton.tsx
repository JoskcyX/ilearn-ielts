"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await api("/api/auth/logout", { method: "POST", body: {} }).catch(() => null);
        router.push("/login");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
