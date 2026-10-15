"use client";

import { AvatarCatalog } from "@/components/profile/avatar-catalog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { BELTS, BELT_LABELS } from "@/lib/belts";
import { cn } from "@/lib/cn";
import type { Belt } from "@/lib/types";
import {
  completeOnboarding,
  skipOnboarding,
} from "@/server/repositories/profiles";
import {
  CalendarDays,
  GraduationCap,
  Heart,
  MessageSquare,
  Swords,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type AcademyOption = {
  id: string;
  name: string;
  city: string;
  badge_color: string;
  badge_label: string;
};

function PreviewShell({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface-2/80">
      <p className="border-b border-border/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
        Vista previa · {label}
      </p>
      <div className="p-3">{children}</div>
    </div>
  );
}

export function AppTour({
  needsOnboarding,
  academies,
}: {
  needsOnboarding: boolean;
  academies: AcademyOption[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [belt, setBelt] = useState<Belt>("white");
  const [stripes, setStripes] = useState(0);
  const [academyId, setAcademyId] = useState(academies[0]?.id ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");

  const selectedAcademy = useMemo(
    () => academies.find((a) => a.id === academyId) ?? null,
    [academies, academyId],
  );

  if (!needsOnboarding) return null;

  const slides = [
    {
      key: "welcome",
      title: "Bienvenido a BJJApp",
      body: "Tu red de tatami: amigos, academia, roladas y ranking. Primero te mostramos cómo funciona y luego configuras tu perfil.",
      preview: (
        <PreviewShell label="Inicio">
          <p className="text-[11px] text-muted">Hola</p>
          <p className="font-display text-xl tracking-tight">Hoy en el mat</p>
          <div className="mt-2 rounded-xl bg-surface px-3 py-2 text-sm text-muted">
            ¿Qué pasó hoy en el tatami?
          </div>
        </PreviewShell>
      ),
    },
    {
      key: "feed",
      title: "Feed y posts",
      body: "Publica sesiones y fotos. Elige visibilidad: público, amigos o academia. Toca un post para likes y comentarios.",
      preview: (
        <PreviewShell label="Feed">
          <div className="space-y-2 rounded-xl bg-surface p-3">
            <p className="text-sm font-semibold">Sofía Méndez</p>
            <p className="text-[13px] leading-relaxed text-foreground/85">
              Open mat con la academia. Tres spars y mucho passing.
            </p>
            <div className="flex gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" /> 2
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> 1
              </span>
            </div>
          </div>
        </PreviewShell>
      ),
    },
    {
      key: "academy",
      title: "Academia",
      body: "Únete a tu academia. El distintivo es personalizable (color incluido). Por defecto negro; tú eliges.",
      preview: (
        <PreviewShell label="Academia">
          <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="h-10 w-10 rounded-xl bg-foreground/10" />
            <div>
              <p className="text-sm font-semibold">
                {selectedAcademy?.name ?? "Tu academia"}
              </p>
              <span
                className="mt-1 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                style={{
                  backgroundColor: selectedAcademy?.badge_color ?? "#161616",
                }}
              >
                {selectedAcademy?.badge_label ?? "Academia"}
              </span>
            </div>
          </div>
        </PreviewShell>
      ),
    },
    {
      key: "roladas",
      title: "Roladas y competencias",
      body: "Organiza o únete a roladas, open mats y competencias. Invita a amigos de tu academia o zona.",
      preview: (
        <PreviewShell label="Roladas">
          <div className="flex items-start gap-3 rounded-xl bg-surface p-3">
            <CalendarDays className="mt-0.5 h-4 w-4 text-muted" />
            <div>
              <p className="text-sm font-semibold">Open mat viernes</p>
              <p className="text-xs text-muted">18:00 · Tu ciudad</p>
            </div>
          </div>
        </PreviewShell>
      ),
    },
    {
      key: "friends",
      title: "Amigos y ranking",
      body: "Conecta con gente cerca, reta a amigos y sube en el ranking de tu comunidad.",
      preview: (
        <PreviewShell label="Amigos / Ranking">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-surface p-3">
              <Users className="mb-1 h-4 w-4 text-muted" />
              <p className="text-xs font-medium">Amigos</p>
              <p className="text-[11px] text-muted">Conectar</p>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <Swords className="mb-1 h-4 w-4 text-muted" />
              <p className="text-xs font-medium">Ranking</p>
              <p className="text-[11px] text-muted">Tu puesto</p>
            </div>
          </div>
        </PreviewShell>
      ),
    },
    {
      key: "profile",
      title: "Tu perfil",
      body: "Rellena tus datos. Nada viene prellenado: cinturón, grados, academia y avatar los eliges tú.",
      preview: null,
      form: true,
    },
  ] as const;

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  const submitProfile = () => {
    setError(null);
    start(async () => {
      try {
        await completeOnboarding({
          display_name: displayName,
          username,
          city,
          belt,
          stripes,
          academy_id: academyId || null,
          avatar_url: avatarUrl,
          bio,
        });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 p-3 backdrop-blur-[3px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className="animate-rise flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-lift">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            Configuración · {step + 1}/{slides.length}
          </p>
          <GraduationCap className="h-4 w-4 text-muted" />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <h2
              id="tour-title"
              className="font-display text-2xl leading-tight tracking-tight"
            >
              {slide.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {slide.body}
            </p>
          </div>

          {"preview" in slide && slide.preview ? slide.preview : null}

          {"form" in slide && slide.form ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="on_name">Nombre</Label>
                  <Input
                    id="on_name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="on_user">Usuario</Label>
                  <Input
                    id="on_user"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tu.usuario"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="on_city">Ciudad</Label>
                <Input
                  id="on_city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Tu ciudad"
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="on_belt">Cinturón</Label>
                  <Select
                    id="on_belt"
                    value={belt}
                    onChange={(e) => setBelt(e.target.value as Belt)}
                  >
                    {BELTS.map((b) => (
                      <option key={b} value={b}>
                        {BELT_LABELS[b]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="on_stripes">Grados</Label>
                  <Select
                    id="on_stripes"
                    value={String(stripes)}
                    onChange={(e) => setStripes(Number(e.target.value))}
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="on_academy">Academia</Label>
                <Select
                  id="on_academy"
                  value={academyId}
                  onChange={(e) => setAcademyId(e.target.value)}
                >
                  <option value="">Sin academia aún</option>
                  {academies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.city}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="on_bio">Bio (opcional)</Label>
                <Input
                  id="on_bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Qué te gusta entrenar..."
                />
              </div>
              <div>
                <Label>Avatar</Label>
                <div className="mt-1.5">
                  <AvatarCatalog
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    preferredSeed={username || displayName || "bjjapp"}
                  />
                </div>
              </div>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
            </div>
          ) : null}

          <div className="flex gap-1.5 pt-1">
            {slides.map((s, i) => (
              <span
                key={s.key}
                className={cn(
                  "h-1 flex-1 rounded-full transition",
                  i <= step ? "bg-foreground" : "bg-border",
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/70 px-5 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={step === 0 || pending}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Atrás
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => {
                setError(null);
                start(async () => {
                  try {
                    await skipOnboarding();
                    router.refresh();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Error");
                  }
                });
              }}
            >
              Omitir
            </Button>
          </div>
          {isLast ? (
            <Button type="button" size="sm" disabled={pending} onClick={submitProfile}>
              Guardar y entrar
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep((s) => s + 1)}
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
