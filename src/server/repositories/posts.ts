"use server";

import type { Post, PostType } from "@/lib/types";
import { getStore, uid } from "../mock/store";
import { getProfile, requireSession } from "./helpers";

function enrich(post: Post): Post {
  return {
    ...post,
    image_urls: post.image_urls ?? [],
    author: getProfile(post.author_id) ?? undefined,
  };
}

export async function listFeed(): Promise<Post[]> {
  return getStore()
    .posts.map(enrich)
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
}

export async function listArticles(): Promise<Post[]> {
  return (await listFeed()).filter((p) => p.type === "article");
}

export async function getPost(id: string): Promise<Post | null> {
  const post = getStore().posts.find((p) => p.id === id);
  return post ? enrich(post) : null;
}

export async function createPost(input: {
  type: PostType;
  title?: string;
  body: string;
  cover_url?: string | null;
  image_urls?: string[];
}): Promise<Post> {
  const session = await requireSession();
  if (!input.body.trim()) throw new Error("El contenido es obligatorio");
  if (input.type === "article" && !input.title?.trim()) {
    throw new Error("El artículo necesita título");
  }

  const image_urls = (input.image_urls ?? []).filter(Boolean).slice(0, 4);
  const cover_url =
    input.cover_url?.trim() ||
    (input.type === "article" ? image_urls[0] ?? null : null);

  const post: Post = {
    id: uid("post"),
    author_id: session.id,
    type: input.type,
    title: input.title?.trim() || null,
    body: input.body.trim(),
    cover_url,
    image_urls,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  getStore().posts.unshift(post);
  return enrich(post);
}
