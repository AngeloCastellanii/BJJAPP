import { SignInPanel } from "@/components/auth/auth-gate";
import { CommentForm, LikeButton } from "@/components/feed/post-actions";
import { Avatar } from "@/components/profile/avatar";
import { Badge } from "@/components/ui/badge";
import { SoftPanel } from "@/components/ui/card";
import { formatRelative } from "@/lib/format";
import type { PostVisibility } from "@/lib/types";
import {
  getPost,
  listComments,
  listLikes,
} from "@/server/repositories/posts";
import { getSessionProfile } from "@/server/repositories/profiles";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const visibilityLabel: Record<PostVisibility, string> = {
  public: "Público",
  friends: "Amigos",
  academy: "Academia",
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const [likes, comments] = await Promise.all([
    listLikes(post.id),
    listComments(post.id),
  ]);
  const images = post.image_urls?.length
    ? post.image_urls
    : post.cover_url
      ? [post.cover_url]
      : [];

  return (
    <div className="animate-rise space-y-5">
      <Link
        href="/"
        className="inline-block text-sm text-muted transition hover:text-foreground"
      >
        ← Feed
      </Link>

      <SoftPanel className="p-5">
        <div className="flex items-center gap-3">
          {post.author ? (
            <Link href={`/perfil/${post.author.username}`}>
              <Avatar
                name={post.author.display_name}
                src={post.author.avatar_url}
              />
            </Link>
          ) : (
            <Avatar name="?" />
          )}
          <div className="min-w-0 flex-1">
            {post.author ? (
              <Link
                href={`/perfil/${post.author.username}`}
                className="truncate text-sm font-semibold hover:opacity-70"
              >
                {post.author.display_name}
              </Link>
            ) : (
              <p className="text-sm font-semibold">Atleta</p>
            )}
            <p className="text-xs text-muted">
              {formatRelative(post.published_at)}
              {post.visibility ? ` · ${visibilityLabel[post.visibility]}` : null}
            </p>
          </div>
          {post.type === "article" ? <Badge>Artículo</Badge> : null}
        </div>

        {post.title ? (
          <h1 className="mt-4 font-display text-3xl leading-tight tracking-tight">
            {post.title}
          </h1>
        ) : null}

        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
          {post.body}
        </p>

        {images.length > 0 ? (
          <div
            className={
              images.length === 1
                ? "mt-4 overflow-hidden rounded-2xl"
                : "mt-4 grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl"
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
                  sizes="(max-width: 768px) 100vw, 640px"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
          <LikeButton
            postId={post.id}
            liked={Boolean(post.liked_by_me)}
            count={post.like_count ?? likes.length}
          />
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <MessageCircle className="h-4 w-4" />
            {comments.length}
          </span>
        </div>
      </SoftPanel>

      {likes.length > 0 ? (
        <section className="space-y-2">
          <h2 className="px-1 text-sm font-medium text-muted">Me gusta</h2>
          <SoftPanel className="p-3">
            <div className="flex flex-wrap gap-3">
              {likes.map((like) => (
                <Link
                  key={like.id}
                  href={
                    like.profile
                      ? `/perfil/${like.profile.username}`
                      : "#"
                  }
                  className="flex items-center gap-2 rounded-2xl px-1 py-1 hover:bg-surface-2"
                >
                  <Avatar
                    name={like.profile?.display_name ?? "?"}
                    src={like.profile?.avatar_url}
                    size="sm"
                  />
                  <span className="text-sm">
                    {like.profile?.display_name ?? "Atleta"}
                  </span>
                </Link>
              ))}
            </div>
          </SoftPanel>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-medium text-muted">Comentarios</h2>
        <SoftPanel className="divide-y divide-border/80">
          {comments.length === 0 ? (
            <p className="px-4 py-5 text-sm text-muted">Sé el primero en comentar.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3 px-4 py-4">
                {c.author ? (
                  <Link href={`/perfil/${c.author.username}`}>
                    <Avatar
                      name={c.author.display_name}
                      src={c.author.avatar_url}
                      size="sm"
                    />
                  </Link>
                ) : (
                  <Avatar name="?" size="sm" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {c.author?.display_name ?? "Atleta"}
                    </p>
                    <span className="text-xs text-muted">
                      {formatRelative(c.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {c.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </SoftPanel>
        <SoftPanel className="p-4">
          <CommentForm postId={post.id} />
        </SoftPanel>
      </section>
    </div>
  );
}
