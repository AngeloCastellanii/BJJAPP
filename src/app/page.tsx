import { SignInPanel } from "@/components/auth/auth-gate";
import { CreatePostForm } from "@/components/feed/create-post-form";
import { PostCard } from "@/components/feed/post-card";
import { QuickActions } from "@/components/home/quick-actions";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listFeed } from "@/server/repositories/posts";
import { getSessionProfile } from "@/server/repositories/profiles";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSessionProfile();

  if (!session) {
    return (
      <div className="flex min-h-[80dvh] flex-col justify-center gap-10 py-6">
        <div className="animate-rise text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
            MatLink
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight md:text-6xl">
            Entrena.
            <br />
            Conecta.
            <br />
            Compite.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Roladas, partners, peleas y ranking en una app limpia para tu
            comunidad de jiu-jitsu.
          </p>
        </div>
        <SignInPanel />
      </div>
    );
  }

  const feed = await listFeed();
  const firstName = session.display_name.split(" ")[0];

  return (
    <div className="space-y-5">
      <header className="animate-rise flex items-end justify-between gap-4 pt-1">
        <div>
          <p className="text-[13px] text-muted">Hola, {firstName}</p>
          <h1 className="font-display text-[2rem] leading-none tracking-tight">
            Hoy en el mat
          </h1>
        </div>
        <Link
          href="/roladas"
          className="rounded-2xl bg-accent px-3.5 py-2.5 text-sm font-medium text-accent-fg shadow-[var(--shadow-sm)]"
        >
          Roladas
        </Link>
      </header>

      <QuickActions />
      <CreatePostForm authorName={session.display_name} />

      <section className="animate-rise-delay-2">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-medium text-muted">Actividad</h2>
          <Link href="/blog" className="text-sm text-muted hover:text-foreground">
            Blog
          </Link>
        </div>
        {feed.length === 0 ? (
          <EmptyState
            title="Todo quieto"
            description="Comparte tu primera sesión o tip."
            icon={<MessageSquare className="h-5 w-5" />}
          />
        ) : (
          <SoftPanel>
            {feed.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </SoftPanel>
        )}
      </section>
    </div>
  );
}
