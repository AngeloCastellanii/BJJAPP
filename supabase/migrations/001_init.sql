-- BJJApp initial schema + RLS
-- Apply in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

create type public.belt as enum (
  'white', 'blue', 'purple', 'brown', 'black', 'coral', 'red'
);

create type public.gathering_type as enum ('rolada', 'open_mat', 'event');
create type public.gathering_status as enum ('upcoming', 'ongoing', 'archived', 'cancelled');
create type public.partnership_status as enum ('pending', 'accepted', 'rejected', 'cancelled');
create type public.match_status as enum ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
create type public.post_type as enum ('post', 'article');
create type public.participant_status as enum ('invited', 'joined', 'declined', 'cancelled');

create table public.academies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  country text not null default 'VE',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  bio text,
  avatar_url text,
  city text not null default '',
  country text not null default 'VE',
  lat double precision,
  lng double precision,
  belt public.belt not null default 'white',
  stripes int not null default 0 check (stripes between 0 and 4),
  academy_id uuid references public.academies (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status public.partnership_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create table public.gatherings (
  id uuid primary key default gen_random_uuid(),
  type public.gathering_type not null,
  title text not null,
  description text,
  location_name text not null,
  city text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity int,
  host_id uuid not null references public.profiles (id) on delete cascade,
  academy_id uuid references public.academies (id) on delete set null,
  status public.gathering_status not null default 'upcoming',
  created_at timestamptz not null default now()
);

create table public.gathering_participants (
  id uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references public.gatherings (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.participant_status not null default 'invited',
  created_at timestamptz not null default now(),
  unique (gathering_id, profile_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.profiles (id) on delete cascade,
  opponent_id uuid not null references public.profiles (id) on delete cascade,
  status public.match_status not null default 'pending',
  winner_id uuid references public.profiles (id) on delete set null,
  notes text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  gathering_id uuid references public.gatherings (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (challenger_id <> opponent_id)
);

create table public.techniques (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  position text not null,
  description text
);

create table public.technique_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  technique_id uuid not null references public.techniques (id) on delete cascade,
  notes text,
  practiced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  type public.post_type not null default 'post',
  title text,
  body text not null,
  cover_url text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create or replace view public.ranking_week as
select winner_id as profile_id, count(*)::int as wins
from public.matches
where status = 'completed'
  and winner_id is not null
  and completed_at >= date_trunc('week', now())
group by winner_id;

create or replace view public.ranking_month as
select winner_id as profile_id, count(*)::int as wins
from public.matches
where status = 'completed'
  and winner_id is not null
  and completed_at >= date_trunc('month', now())
group by winner_id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.academies enable row level security;
alter table public.profiles enable row level security;
alter table public.partnerships enable row level security;
alter table public.gatherings enable row level security;
alter table public.gathering_participants enable row level security;
alter table public.matches enable row level security;
alter table public.techniques enable row level security;
alter table public.technique_logs enable row level security;
alter table public.posts enable row level security;

create policy "Academies are readable" on public.academies for select using (true);
create policy "Profiles are readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Partnerships readable by members" on public.partnerships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "Partnerships insert requester" on public.partnerships
  for insert with check (auth.uid() = requester_id);
create policy "Partnerships update members" on public.partnerships
  for update using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Gatherings readable" on public.gatherings for select using (true);
create policy "Gatherings insert host" on public.gatherings
  for insert with check (auth.uid() = host_id);
create policy "Gatherings update host" on public.gatherings
  for update using (auth.uid() = host_id);

create policy "Participants readable" on public.gathering_participants for select using (true);
create policy "Participants insert self or host" on public.gathering_participants
  for insert with check (
    auth.uid() = profile_id
    or auth.uid() = (select host_id from public.gatherings g where g.id = gathering_id)
  );
create policy "Participants update self" on public.gathering_participants
  for update using (auth.uid() = profile_id);

create policy "Matches readable by members" on public.matches
  for select using (auth.uid() = challenger_id or auth.uid() = opponent_id or status = 'completed');
create policy "Matches insert challenger" on public.matches
  for insert with check (auth.uid() = challenger_id);
create policy "Matches update members" on public.matches
  for update using (auth.uid() = challenger_id or auth.uid() = opponent_id);

create policy "Techniques readable" on public.techniques for select using (true);
create policy "Technique logs readable own" on public.technique_logs
  for select using (auth.uid() = profile_id);
create policy "Technique logs insert own" on public.technique_logs
  for insert with check (auth.uid() = profile_id);

create policy "Posts readable" on public.posts for select using (true);
create policy "Posts insert own" on public.posts
  for insert with check (auth.uid() = author_id);
create policy "Posts update own" on public.posts
  for update using (auth.uid() = author_id);
