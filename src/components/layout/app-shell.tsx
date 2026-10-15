import { AppNav } from "./app-nav";
import { DemoBanner } from "./demo-banner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <AppNav />
      <main className="mx-auto min-h-dvh w-full max-w-xl px-4 pb-28 pt-4 md:ml-70 md:max-w-2xl md:px-6 md:pb-12 md:pt-8">
        <DemoBanner />
        {children}
      </main>
    </div>
  );
}
