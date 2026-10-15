"use server";

import type {
  Post,
  PostComment,
  PostLike,
  PostType,
  PostVisibility,
  Profile,
} from "@/lib/types";
import { getStore, uid } from "../mock/store";
import { getProfile, requireSession } from "./helpers";
import { getSessionProfile } from "./profiles";

function areFriends(a: string, b: string) {
  return getStore().partnerships.some(
    (p) =>
      p.status === "accepted" &&
      ((p.requester_id === a && p.addressee_id === b) ||
        (p.addressee_id === a && p.requester_id === b)),
  );
}

function canViewPost(post: Post, viewer: Profile | null) {
  const visibility = post.visibility ?? "public";
  if (visibility === "public") return true;
  if (!viewer) return false;
  if (viewer.id === post.author_id) return true;
  if (visibility === "friends") return areFriends(viewer.id, post.author_id);
  if (visibility === "academy") {
    return Boolean(
      post.academy_id &&
        viewer.academy_id &&
        post.academy_id === viewer.academy_id,
    );
  }
  return false;
}

function enrich(post: Post, viewerId?: string | null): Post {
  const store = getStore();
  const likes = store.postLikes.filter((l) => l.post_id === post.id);
  const comments = store.postComments.filter((c) => c.post_id === post.id);
  return {
    ...post,
    image_urls: post.image_urls ?? [],
    visibility: post.visibility ?? "public",
    academy_id: post.academy_id ?? null,
    author: getProfile(post.author_id) ?? undefined,
    like_count: likes.length,
    comment_count: comments.length,
    liked_by_me: viewerId
      ? likes.some((l) => l.profile_id === viewerId)
      : false,
  };
}

export async function listFeed(): Promise<Post[]> {
  const viewer = await getSessionProfile();
  return getStore()
    .posts.filter((p) => canViewPost(p, viewer))
    .map((p) => enrich(p, viewer?.id))
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
  if (!post) return null;
  const viewer = await getSessionProfile();
  if (!canViewPost(post, viewer)) return null;
  return enrich(post, viewer?.id);
}

export async function listLikes(postId: string): Promise<PostLike[]> {
  return getStore()
    .postLikes.filter((l) => l.post_id === postId)
    .map((l) => ({ ...l, profile: getProfile(l.profile_id) ?? undefined }))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export async function listComments(postId: string): Promise<PostComment[]> {
  return getStore()
    .postComments.filter((c) => c.post_id === postId)
    .map((c) => ({ ...c, author: getProfile(c.author_id) ?? undefined }))
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
}

export async function toggleLike(postId: string): Promise<Post> {
  const session = await requireSession();
  const store = getStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post || !canViewPost(post, session)) {
    throw new Error("Post no encontrado");
  }

  const idx = store.postLikes.findIndex(
    (l) => l.post_id === postId && l.profile_id === session.id,
  );
  if (idx >= 0) store.postLikes.splice(idx, 1);
  else {
    store.postLikes.push({
      id: uid("like"),
      post_id: postId,
      profile_id: session.id,
      created_at: new Date().toISOString(),
    });
  }
  return enrich(post, session.id);
}

export async function addComment(
  postId: string,
  body: string,
): Promise<PostComment> {
  const session = await requireSession();
  const store = getStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post || !canViewPost(post, session)) {
    throw new Error("Post no encontrado");
  }
  const text = body.trim();
  if (!text) throw new Error("El comentario no puede estar vacío");

  const comment: PostComment = {
    id: uid("cmt"),
    post_id: postId,
    author_id: session.id,
    body: text,
    created_at: new Date().toISOString(),
  };
  store.postComments.push(comment);
  return { ...comment, author: session };
}

export async function createPost(input: {
  type: PostType;
  title?: string;
  body: string;
  cover_url?: string | null;
  image_urls?: string[];
  visibility?: PostVisibility;
}): Promise<Post> {
  const session = await requireSession();
  if (!input.body.trim()) throw new Error("El contenido es obligatorio");
  if (input.type === "article" && !input.title?.trim()) {
    throw new Error("El artículo necesita título");
  }

  const visibility = input.visibility ?? "public";
  if (visibility === "academy" && !session.academy_id) {
    throw new Error("Necesitas una academia para publicar solo a tu academia");
  }

  const image_urls = (input.image_urls ?? []).filter(Boolean).slice(0, 4);
  const cover_url =
    input.cover_url?.trim() ||
    (input.type === "article" ? (image_urls[0] ?? null) : null);

  const post: Post = {
    id: uid("post"),
    author_id: session.id,
    type: input.type,
    title: input.title?.trim() || null,
    body: input.body.trim(),
    cover_url,
    image_urls,
    visibility,
    academy_id: visibility === "academy" ? session.academy_id : null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  getStore().posts.unshift(post);
  return enrich(post, session.id);
}
