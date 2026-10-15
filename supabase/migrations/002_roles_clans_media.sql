-- Roles, clanes, verificación de cinturón e imágenes en posts

create type public.user_role as enum ('user', 'coach', 'master', 'owner');
create type public.membership_status as enum ('pending', 'accepted', 'rejected', 'cancelled');

alter type public.gathering_type add value if not exists 'competition';
alter type public.gathering_type add value if not exists 'tope';
alter type public.gathering_type add value if not exists 'seminar';

alter table public.academies
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists logo_url text,
  add column if not exists badge_label text not null default 'Clan',
  add column if not exists badge_color text not null default '#161616',
  add column if not exists owner_id uuid references public.profiles (id) on delete set null;

alter table public.profiles
  add column if not exists role public.user_role not null default 'user',
  add column if not exists belt_verified boolean not null default false,
  add column if not exists belt_verified_by uuid references public.profiles (id) on delete set null,
  add column if not exists belt_verified_at timestamptz;

create table if not exists public.academy_memberships (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.membership_status not null default 'pending',
  role_in_academy public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academy_id, profile_id)
);

create table if not exists public.belt_promotions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  promoted_by uuid not null references public.profiles (id) on delete cascade,
  from_belt public.belt not null,
  from_stripes int not null default 0,
  to_belt public.belt not null,
  to_stripes int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists image_urls text[] not null default '{}';
