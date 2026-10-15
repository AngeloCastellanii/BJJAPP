"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  signInWithPassword,
  signUpWithPassword,
} from "@/server/repositories/profiles";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SignInPanel() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const signingUp = mode === "signup";

  return (
    <div className="mx-auto w-full max-w-sm animate-rise-delay-1">
      <div className="rounded-3xl border border-border/70 bg-surface p-6 shadow-lift">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            if (signingUp && password !== confirm) {
              setError("Las contraseñas no coinciden");
              return;
            }
            start(async () => {
              try {
                const result = signingUp
                  ? await signUpWithPassword(email, password)
                  : await signInWithPassword(email, password);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                router.refresh();
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "No se pudo continuar",
                );
              }
            });
          }}
        >
          <div>
            <p className="text-[13px] font-medium text-muted">BJJApp</p>
            <p className="mt-1 font-display text-2xl tracking-tight">
              {signingUp ? "Crea tu cuenta" : "Inicia sesión"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {signingUp
                ? "Después te pedimos nombre, cinturón y academia."
                : "Entra con tu correo y contraseña"}
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={signingUp ? "new-password" : "current-password"}
                required
                minLength={signingUp ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-12"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {signingUp ? (
            <div>
              <Label htmlFor="confirm">Repite la contraseña</Label>
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button className="w-full" size="lg" disabled={pending}>
            {signingUp ? "Crear cuenta" : "Entrar"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-5 w-full text-center text-sm text-muted transition hover:text-foreground"
          onClick={() => {
            setMode(signingUp ? "signin" : "signup");
            setError(null);
            setConfirm("");
          }}
        >
          {signingUp ? "Ya tengo cuenta" : "Crear una cuenta"}
        </button>
      </div>
    </div>
  );
}
