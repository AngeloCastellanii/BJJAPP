import { Avatar } from "@/components/profile/avatar";
import { SoftPanel } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { getPost } from "@/server/repositories/posts";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post || post.type !== "article") notFound();

  const cover = post.cover_url || post.image_urls?.[0];

  return (
    <article className="animate-rise space-y-5">
      <Link
        href="/blog"
        className="inline-block text-sm text-muted transition hover:text-foreground"
      >
        ← Blog
      </Link>
      <header className="space-y-4">
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-3">
          <Avatar
            name={post.author?.display_name ?? "?"}
            src={post.author?.avatar_url}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium">{post.author?.display_name}</p>
            <p className="text-xs text-muted">
              {formatDate(post.published_at)}
            </p>
          </div>
        </div>
      </header>
      {cover ? (
        <div className="relative aspect-video overflow-hidden rounded-3xl">
          <Image
            src={cover}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
      ) : null}
      <SoftPanel className="p-5">
        <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-foreground/90">
          {post.body}
        </div>
      </SoftPanel>
    </article>
  );
}
