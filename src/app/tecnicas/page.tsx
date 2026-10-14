import { SignInPanel } from "@/components/auth/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { LogTechniqueForm } from "@/components/techniques/log-technique-form";
import { Badge } from "@/components/ui/badge";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { getSessionProfile } from "@/server/repositories/profiles";
import {
  listMyTechniqueLogs,
  listTechniques,
} from "@/server/repositories/techniques";

export const metadata = { title: "Técnicas" };

export default async function TecnicasPage() {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const [techniques, logs] = await Promise.all([
    listTechniques(),
    listMyTechniqueLogs(),
  ]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Progreso"
        title="Técnicas"
        description="Registra lo que entrenaste."
      />

      <LogTechniqueForm techniques={techniques} />

      <section>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted">Historial</h2>
        {logs.length === 0 ? (
          <EmptyState title="Aún no registraste técnicas" />
        ) : (
          <SoftPanel>
            {logs.map((log) => (
              <div
                key={log.id}
                className="space-y-1.5 border-b border-border/80 px-4 py-4 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{log.technique?.name}</p>
                    <p className="text-xs text-muted">
                      {formatDate(log.practiced_at)}
                    </p>
                  </div>
                  <Badge>{log.technique?.category}</Badge>
                </div>
                {log.notes ? (
                  <p className="text-sm text-muted">{log.notes}</p>
                ) : null}
              </div>
            ))}
          </SoftPanel>
        )}
      </section>

      <section>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted">Catálogo</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {techniques.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-surface p-4 shadow-sm"
            >
              <p className="font-medium">{t.name}</p>
              <p className="mt-1 text-xs text-muted">
                {t.category} · {t.position}
              </p>
              {t.description ? (
                <p className="mt-2 text-sm text-muted">{t.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
