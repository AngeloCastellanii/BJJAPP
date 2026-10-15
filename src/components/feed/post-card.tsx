import { Avatar } from "@/components/profile/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";
import type { Post, PostVisibility } from "@/lib/types";
import { ChevronRight, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const visibilityLabel: Record<PostVisibility, string> = {
  public: "Público",
  friends: "Amigos",
  academy: "Academia",
};

export function PostCard({ post }: { post: Post }) {
  const author = post.author;
  const isArticle = post.type === "article";
  const images = post.image_urls?.length
    ? post.image_urls
    : post.cover_url
      ? [post.cover_url]
      : [];
  const href = isArticle ? `/blog/${post.id}` : `/post/${post.id}`;

  return (
    <article className="border-b border-border/80 px-4 py-5 last:border-b-0">
      <div className="flex gap-3">
        {author ? (
          <Link href={`/perfil/${author.username}`}>
            <Avatar name={author.display_name} src={author.avatar_url} />
          </Link>
        ) : (
          <Avatar name="?" />
        )}
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
            {post.visibility && post.visibility !== "public" ? (
              <Badge className="ml-auto">{visibilityLabel[post.visibility]}</Badge>
            ) : isArticle ? (
              <Badge className="ml-auto">Artículo</Badge>
            ) : null}
          </div>

          <Link href={href} className="mt-2 block">
            {isArticle && post.title ? (
              <h3 className="font-display text-xl leading-snug tracking-tight hover:opacity-70">
                {post.title}
              </h3>
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
                        ? "relative aspect-4/3 w-full"
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
          </Link>

          <div className="mt-3 flex items-center gap-4">
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
            >
              <Heart
                className={`h-4 w-4 ${post.liked_by_me ? "fill-danger text-danger" : ""}`}
              />
              {post.like_count ?? 0}
            </Link>
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comment_count ?? 0}
            </Link>
            {isArticle ? (
              <Link
                href={href}
                className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Leer completo
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
