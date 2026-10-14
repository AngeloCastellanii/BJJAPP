"use client";

import { Avatar } from "@/components/profile/avatar";
import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { createPost } from "@/server/repositories/posts";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CreatePostForm({ authorName }: { authorName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<"post" | "article">("post");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <SoftPanel className="animate-rise-delay-1">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-2/60"
        >
          <Avatar name={authorName} size="sm" />
          <span className="flex-1 text-sm text-muted">
            ¿Qué pasó hoy en el tatami?
          </span>
          <span className="rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg">
            Publicar
          </span>
        </button>
      ) : (
        <form
          className="space-y-3 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            start(async () => {
              try {
                await createPost({ type, title, body });
                setBody("");
                setTitle("");
                setExpanded(false);
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Error");
              }
            });
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={authorName} size="sm" />
              <p className="text-sm font-medium">{authorName.split(" ")[0]}</p>
            </div>
            <Segmented
              value={type}
              onChange={setType}
              options={[
                { value: "post", label: "Post" },
                { value: "article", label: "Artículo" },
              ]}
            />
          </div>
          {type === "article" ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del artículo"
              className="border-0 bg-transparent px-0 shadow-none focus:bg-transparent focus:shadow-none"
            />
          ) : null}
          <Textarea
            autoFocus
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              type === "article"
                ? "Escribe el artículo..."
                : "Comparte una sesión, tip o victoria..."
            }
            className="min-h-24 border-0 bg-transparent px-0 shadow-none focus:bg-transparent focus:shadow-none"
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setExpanded(false);
                setBody("");
                setTitle("");
              }}
            >
              Cancelar
            </Button>
            <Button size="sm" disabled={pending || !body.trim()}>
              Publicar
            </Button>
          </div>
        </form>
      )}
    </SoftPanel>
  );
}
