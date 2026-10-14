"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/server/repositories/profiles";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await signOut();
          router.refresh();
        });
      }}
    >
      Salir
    </Button>
  );
}
