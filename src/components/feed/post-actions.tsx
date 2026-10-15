"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { addComment, toggleLike } from "@/server/repositories/posts";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LikeButton({
  postId,
  liked,
  count,
}: {
  postId: string;
  liked: boolean;
  count: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [localLiked, setLocalLiked] = useState(liked);
  const [localCount, setLocalCount] = useState(count);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setLocalLiked((v) => !v);
        setLocalCount((c) => (localLiked ? c - 1 : c + 1));
        start(async () => {
          try {
            const post = await toggleLike(postId);
            setLocalLiked(Boolean(post.liked_by_me));
            setLocalCount(post.like_count ?? 0);
            router.refresh();
          } catch {
            setLocalLiked(liked);
            setLocalCount(count);
          }
        });
      }}
      className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground disabled:opacity-50"
    >
      <Heart
        className={`h-4 w-4 ${localLiked ? "fill-danger text-danger" : ""}`}
      />
      {localCount}
    </button>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          try {
            await addComment(postId, body);
            setBody("");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error");
          }
        });
      }}
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escribe un comentario..."
        className="min-h-20"
        required
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button size="sm" disabled={pending || !body.trim()}>
        Comentar
      </Button>
    </form>
  );
}
