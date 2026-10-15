import { Avatar } from "@/components/profile/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";
import type { Post } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function PostCard({ post }: { post: Post }) {
  const author = post.author;
  const isArticle = post.type === "article";
  const images = post.image_urls?.length
    ? post.image_urls
    : post.cover_url
      ? [post.cover_url]
      : [];

  return (
    <article className="border-b border-border/80 px-4 py-5 last:border-b-0">
      <div className="flex gap-3">
        <Avatar
          name={author?.display_name ?? "?"}
          src={author?.avatar_url}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {author ? (
              <Link
                href={`/perfil/${author.username}`}
                className="truncate text-sm font-semibold hover:opacity-70"
              >
                {author.display_name}
              </Link>
            ) : (
              <span className="text-sm font-semibold">Atleta</span>
            )}
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted">
              {formatRelative(post.published_at)}
            </span>
            {isArticle ? <Badge className="ml-auto">Artículo</Badge> : null}
          </div>

          {isArticle && post.title ? (
            <Link href={`/blog/${post.id}`} className="group mt-2 block">
              <h3 className="font-display text-xl leading-snug tracking-tight group-hover:opacity-70">
                {post.title}
              </h3>
            </Link>
          ) : null}

          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
            {isArticle && post.body.length > 180
              ? `${post.body.slice(0, 180)}…`
              : post.body}
          </p>

          {images.length > 0 ? (
            <div
              className={
                images.length === 1
                  ? "mt-3 overflow-hidden rounded-2xl"
                  : "mt-3 grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl"
              }
            >
              {images.slice(0, 4).map((src) => (
                <div
                  key={src}
                  className={
                    images.length === 1
                      ? "relative aspect-[4/3] w-full"
                      : "relative aspect-square"
                  }
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {isArticle ? (
            <Link
              href={`/blog/${post.id}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Leer completo
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
