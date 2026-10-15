"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  CalendarDays,
  GraduationCap,
  MessageSquare,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "bjjapp-tour-v1";

const slides = [
  {
    icon: MessageSquare,
    title: "Bienvenido a BJJApp",
    body: "La red de tu academia y tu zona: entrena, comparte y fortalece amistades en el tatami.",
  },
  {
    icon: MessageSquare,
    title: "Feed y posts",
    body: "Publica sesiones, tips y fotos. Elige quién lo ve: todos, tus amigos o tu academia.",
  },
  {
    icon: GraduationCap,
    title: "Academia",
    body: "Únete a tu academia, conoce gente de otras escuelas cerca y organiza open mats juntos.",
  },
  {
    icon: CalendarDays,
    title: "Roladas y competencias",
    body: "Arma roladas, open mats y competencias. Invita a amigos de tu academia o de la zona.",
  },
  {
    icon: Swords,
    title: "Peleas y ranking",
    body: "Reta a amigos, registra resultados y sube en el ranking de tu comunidad.",
  },
  {
    icon: Users,
    title: "Amigos y perfil",
    body: "Descubre personas cerca, conecta como amigos y personaliza tu perfil con avatares DiceBear.",
  },
  {
    icon: Trophy,
    title: "Cómo empezar",
    body: "Entra con tu perfil o crea uno nuevo. Usa Más para ranking, academia, técnicas y blog.",
  },
] as const;

export function AppTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "done") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  const slide = slides[step];
  const Icon = slide.icon;
  const isLast = step === slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/35 p-4 backdrop-blur-[3px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className="animate-rise w-full max-w-md overflow-hidden rounded-4xl border border-border/80 bg-surface shadow-lift">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            Tour · {step + 1}/{slides.length}
          </p>
          <button
            type="button"
            onClick={close}
            className="rounded-xl p-2 text-muted transition hover:bg-surface-2 hover:text-foreground"
            aria-label="Cerrar tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft">
            <Icon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
          </div>
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

          <div className="flex gap-1.5 pt-1">
            {slides.map((_, i) => (
              <span
                key={slides[i].title}
                className={cn(
                  "h-1 flex-1 rounded-full transition",
                  i <= step ? "bg-foreground" : "bg-border",
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/70 px-5 py-4">
          <button
            type="button"
            onClick={close}
            className="text-sm text-muted transition hover:text-foreground"
          >
            Saltar
          </button>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
              >
                Atrás
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (isLast) close();
                else setStep((s) => s + 1);
              }}
            >
              {isLast ? "Empezar" : "Siguiente"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
