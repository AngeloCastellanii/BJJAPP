"use server";

import type { Post, PostType } from "@/lib/types";
import { getStore, uid } from "../mock/store";
import { getProfile, requireSession } from "./helpers";

function enrich(post: Post): Post {
  return { ...post, author: getProfile(post.author_id) ?? undefined };
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
}): Promise<Post> {
  const session = requireSession();
  if (!input.body.trim()) throw new Error("El contenido es obligatorio");
  if (input.type === "article" && !input.title?.trim()) {
    throw new Error("El artículo necesita título");
  }

  const post: Post = {
    id: uid("post"),
    author_id: session.id,
    type: input.type,
    title: input.title?.trim() || null,
    body: input.body.trim(),
    cover_url: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  getStore().posts.unshift(post);
  return enrich(post);
}
