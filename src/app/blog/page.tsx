import { PageHeader } from "@/components/layout/page-header";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { listArticles } from "@/server/repositories/posts";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Blog" };

export default async function BlogPage() {
  const articles = await listArticles();

  return (
    <div>
      <PageHeader
        eyebrow="Lecturas"
        title="Blog"
        description="Artículos de la comunidad."
      />
      {articles.length === 0 ? (
        <EmptyState title="Sin artículos" />
      ) : (
        <SoftPanel className="animate-rise-delay-1">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.id}`}
              className="flex items-start justify-between gap-3 border-b border-border/80 px-4 py-4 transition last:border-b-0 hover:bg-surface-2/50"
            >
              <div className="min-w-0">
                <p className="font-display text-lg leading-snug tracking-tight">
                  {article.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {article.body}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {article.author?.display_name} ·{" "}
                  {formatDate(article.published_at)}
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted" />
            </Link>
          ))}
        </SoftPanel>
      )}
    </div>
  );
}
