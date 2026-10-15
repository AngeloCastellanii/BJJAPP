-- Feed: visibilidad, likes y comentarios (alineado con el modelo de la app)

do $$ begin
  create type public.post_visibility as enum ('public', 'friends', 'academy');
exception
  when duplicate_object then null;
end $$;

alter table public.posts
  add column if not exists visibility public.post_visibility not null default 'public',
  add column if not exists academy_id uuid references public.academies (id) on delete set null;

alter table public.academies
  alter column badge_label set default 'Academia';

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, profile_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_likes_post_id_idx on public.post_likes (post_id);
create index if not exists post_comments_post_id_idx on public.post_comments (post_id);

alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

create policy "post_likes_select" on public.post_likes
  for select using (true);

create policy "post_likes_mutate_own" on public.post_likes
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "post_comments_select" on public.post_comments
  for select using (true);

create policy "post_comments_insert_own" on public.post_comments
  for insert with check (auth.uid() = author_id);

create policy "post_comments_update_own" on public.post_comments
  for update using (auth.uid() = author_id);

create policy "post_comments_delete_own" on public.post_comments
  for delete using (auth.uid() = author_id);
