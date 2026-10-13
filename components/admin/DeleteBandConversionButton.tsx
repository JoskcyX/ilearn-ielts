"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function DeleteBandConversionButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await call(`/api/admin/band-conversions/${id}`, { method: "DELETE" });
          router.refresh();
        })
      }
    >
      Remove
    </Button>
  );
}
