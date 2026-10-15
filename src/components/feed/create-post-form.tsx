"use client";

import { Avatar } from "@/components/profile/avatar";
import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { fileToDataUrl } from "@/lib/media";
import type { PostVisibility } from "@/lib/types";
import { createPost } from "@/server/repositories/posts";
import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string }[] = [
  { value: "public", label: "Público" },
  { value: "friends", label: "Amigos" },
  { value: "academy", label: "Academia" },
];

export function CreatePostForm({
  authorName,
  authorAvatar,
  hasAcademy = false,
}: {
  authorName: string;
  authorAvatar?: string | null;
  hasAcademy?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState<"post" | "article">("post");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const imagesRef = useRef<string[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setBody("");
    setTitle("");
    setImages([]);
    imagesRef.current = [];
    setVisibility("public");
    setExpanded(false);
  };

  return (
    <SoftPanel className="animate-rise-delay-1">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-2/60"
        >
          <Avatar name={authorName} src={authorAvatar} size="sm" />
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
            const snapshot = [...imagesRef.current];
            start(async () => {
              try {
                await createPost({
                  type,
                  title,
                  body,
                  image_urls: snapshot,
                  cover_url: type === "article" ? snapshot[0] : null,
                  visibility,
                });
                reset();
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Error");
              }
            });
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={authorName} src={authorAvatar} size="sm" />
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

          <div className="flex flex-wrap gap-1.5">
            {VISIBILITY_OPTIONS.filter(
              (o) => o.value !== "academy" || hasAcademy,
            ).map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setVisibility(o.value)}
                className={
                  visibility === o.value
                    ? "rounded-xl bg-accent-soft px-3 py-1.5 text-xs font-medium text-foreground"
                    : "rounded-xl px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-foreground"
                }
              >
                {o.label}
              </button>
            ))}
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {images.map((src, i) => (
                <div
                  key={`${src.slice(0, 24)}-${i}`}
                  className="relative overflow-hidden rounded-2xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-foreground/70 p-1 text-accent-fg"
                    onClick={() => {
                      const next = imagesRef.current.filter((_, idx) => idx !== i);
                      imagesRef.current = next;
                      setImages(next);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground">
              <ImagePlus className="h-4 w-4" />
              Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setError(null);
                  start(async () => {
                    try {
                      const url = await fileToDataUrl(file, 1000, 0.8);
                      const next = [...imagesRef.current, url].slice(0, 4);
                      imagesRef.current = next;
                      setImages(next);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Error");
                    }
                  });
                  e.target.value = "";
                }}
              />
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={reset}>
                Cancelar
              </Button>
              <Button size="sm" disabled={pending || !body.trim()}>
                Publicar
              </Button>
            </div>
          </div>
        </form>
      )}
    </SoftPanel>
  );
}
