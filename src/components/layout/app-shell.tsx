import { AppTour } from "@/components/onboarding/app-tour";
import { cn } from "@/lib/cn";
import { listAcademies } from "@/server/repositories/academies";
import { getSessionProfile } from "@/server/repositories/profiles";
import { AppNav } from "./app-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  const ready = Boolean(session?.onboarding_completed);
  const academies =
    session && !session.onboarding_completed ? await listAcademies() : [];

  return (
    <div className="min-h-dvh">
      {ready ? <AppNav /> : null}
      <main
        className={cn(
          "mx-auto min-h-dvh w-full max-w-xl px-4 pt-4 md:max-w-2xl md:px-6 md:pt-8",
          ready ? "pb-28 md:ml-70 md:pb-12" : "pb-10",
        )}
      >
        {ready || !session ? children : null}
      </main>
      {session && !session.onboarding_completed ? (
        <AppTour
          needsOnboarding
          academies={academies.map((a) => ({
            id: a.id,
            name: a.name,
            city: a.city,
            badge_color: a.badge_color,
            badge_label: a.badge_label,
          }))}
        />
      ) : null}
    </div>
  );
}
