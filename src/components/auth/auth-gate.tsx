"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  createDemoProfile,
  signInAsDemo,
} from "@/server/repositories/profiles";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SignInPanel() {
  const supabaseReady = isSupabaseConfigured();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"demo" | "create">("demo");
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    city: "Caracas",
  });

  return (
    <div className="mx-auto w-full max-w-sm animate-rise-delay-1">
      <div className="rounded-4xl bg-surface p-6 shadow-lift">
        {mode === "demo" ? (
          <div className="space-y-5">
            <div>
              <p className="text-[13px] font-medium text-muted">
                {supabaseReady ? "Supabase listo · demo local activa" : "Demo local"}
              </p>
              <p className="mt-1 font-display text-2xl tracking-tight">
                Entra y empieza a rolar
              </p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="text-sm font-medium">Angelo Ruiz</p>
              <p className="mt-0.5 text-sm text-muted">
                Azul · 2 grados · Caracas
              </p>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={pending}
              onClick={() => {
                setError(null);
                start(async () => {
                  try {
                    await signInAsDemo();
                    router.refresh();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Error");
                  }
                });
              }}
            >
              Continuar
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              start(async () => {
                try {
                  await createDemoProfile(form);
                  router.refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Error");
                }
              });
            }}
          >
            <div>
              <p className="font-display text-2xl tracking-tight">Tu perfil</p>
              <p className="mt-1 text-sm text-muted">Solo para esta demo local</p>
            </div>
            <div>
              <Label htmlFor="display_name">Nombre</Label>
              <Input
                id="display_name"
                required
                value={form.display_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                required
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                required
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
              />
            </div>
            <Button className="w-full" size="lg" disabled={pending}>
              Crear y entrar
            </Button>
          </form>
        )}

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

        <button
          type="button"
          className="mt-5 w-full text-center text-sm text-muted transition hover:text-foreground"
          onClick={() => setMode(mode === "demo" ? "create" : "demo")}
        >
          {mode === "demo" ? "Crear otro perfil" : "Usar perfil demo"}
        </button>
      </div>
    </div>
  );
}
