"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signInWithPassword } from "@/server/repositories/profiles";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SignInPanel() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto w-full max-w-sm animate-rise-delay-1">
      <div className="rounded-3xl border border-border/70 bg-surface p-6 shadow-lift">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            start(async () => {
              try {
                await signInWithPassword(email, password);
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Error");
              }
            });
          }}
        >
          <div>
            <p className="text-[13px] font-medium text-muted">BJJApp</p>
            <p className="mt-1 font-display text-2xl tracking-tight">
              Inicia sesión
            </p>
            <p className="mt-1 text-sm text-muted">
              Acceso con tu correo y contraseña
            </p>
          </div>
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button className="w-full" size="lg" disabled={pending}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
