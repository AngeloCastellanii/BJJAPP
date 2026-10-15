import { AppTour } from "@/components/onboarding/app-tour";
import { listAcademies } from "@/server/repositories/academies";
import { getSessionProfile } from "@/server/repositories/profiles";
import { AppNav } from "./app-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  const academies = session ? await listAcademies() : [];

  return (
    <div className="min-h-dvh">
      <AppNav />
      <main className="mx-auto min-h-dvh w-full max-w-xl px-4 pb-28 pt-4 md:ml-70 md:max-w-2xl md:px-6 md:pb-12 md:pt-8">
        {children}
      </main>
      {session ? (
        <AppTour
          needsOnboarding={!session.onboarding_completed}
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
