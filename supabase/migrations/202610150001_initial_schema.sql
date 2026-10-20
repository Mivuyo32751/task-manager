-- Groovy's first Supabase schema.
-- Safe to rerun: policies and trigger are replaced, tables are created only once.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  favorite_genres text[] not null default '{}',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) <= 60)
);

create table if not exists public.tracks (
  id text primary key,
  title text not null,
  artist text not null,
  album text,
  artwork_url text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  provider text not null default 'demo',
  provider_track_id text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  artwork_url text,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint playlists_title_length check (char_length(title) between 1 and 100)
);

create table if not exists public.playlist_tracks (
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  track_id text not null references public.tracks (id) on delete cascade,
  position integer not null check (position >= 0),
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id),
  unique (playlist_id, position)
);

create table if not exists public.user_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  track_id text not null references public.tracks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists public.user_saved_playlists (
  user_id uuid not null references public.profiles (id) on delete cascade,
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, playlist_id)
);

create table if not exists public.listening_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  track_id text not null references public.tracks (id) on delete cascade,
  listened_seconds integer not null check (listened_seconds between 1 and 86400),
  played_at timestamptz not null default now()
);

-- Demo metadata only. The playable audio remains in the current demo player;
-- replace provider='demo' entries after selecting an authorized music provider.
insert into public.tracks (id, title, artist, album, artwork_url, duration_seconds, provider, provider_track_id)
values
  ('demo-late-night-rotation', 'Late Night Rotation', 'Drake, Kendrick Lamar & J. Cole', 'Hip-Hop · Daily Playlist', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85', 168, 'demo', null),
  ('demo-soft-focus', 'Soft Focus', 'SZA & Tems', 'R&B · Daily Playlist', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=85', 192, 'demo', null),
  ('demo-afro-sunset', 'Afro Sunset', 'Tems & friends', 'Afrobeats · Daily Playlist', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85', 216, 'demo', null)
on conflict (id) do update set
  title = excluded.title,
  artist = excluded.artist,
  album = excluded.album,
  artwork_url = excluded.artwork_url,
  duration_seconds = excluded.duration_seconds,
  provider = excluded.provider,
  provider_track_id = excluded.provider_track_id;

insert into public.playlists (id, owner_id, title, description, artwork_url, visibility)
values
  ('00000000-0000-4000-8000-000000000001', null, 'Late Night Rotation', 'Hip-Hop · Drake, Kendrick Lamar & J. Cole', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85', 'public'),
  ('00000000-0000-4000-8000-000000000002', null, 'Soft Focus', 'R&B · SZA & Tems', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=85', 'public'),
  ('00000000-0000-4000-8000-000000000003', null, 'Afro Sunset', 'Afrobeats · Tems & friends', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85', 'public')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  artwork_url = excluded.artwork_url,
  visibility = excluded.visibility;

insert into public.playlist_tracks (playlist_id, track_id, position)
values
  ('00000000-0000-4000-8000-000000000001', 'demo-late-night-rotation', 0),
  ('00000000-0000-4000-8000-000000000002', 'demo-soft-focus', 0),
  ('00000000-0000-4000-8000-000000000003', 'demo-afro-sunset', 0)
on conflict (playlist_id, track_id) do update set position = excluded.position;

create index if not exists playlists_owner_id_idx on public.playlists (owner_id);
create index if not exists playlist_tracks_track_id_idx on public.playlist_tracks (track_id);
create index if not exists user_likes_track_id_idx on public.user_likes (track_id);
create index if not exists user_saved_playlists_playlist_id_idx on public.user_saved_playlists (playlist_id);
create index if not exists listening_events_user_played_at_idx on public.listening_events (user_id, played_at desc);

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.user_likes enable row level security;
alter table public.user_saved_playlists enable row level security;
alter table public.listening_events enable row level security;

revoke all on table public.profiles, public.tracks, public.playlists, public.playlist_tracks,
  public.user_likes, public.user_saved_playlists, public.listening_events from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.tracks, public.playlists, public.playlist_tracks to anon, authenticated;
grant insert, update, delete on table public.playlists, public.playlist_tracks to authenticated;
grant select, insert, delete on table public.user_likes, public.user_saved_playlists to authenticated;
grant select, insert on table public.listening_events to authenticated;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Catalog is readable" on public.tracks;
create policy "Catalog is readable" on public.tracks
  for select to anon, authenticated using (is_available);

drop policy if exists "Public or owned playlists are readable" on public.playlists;
create policy "Public or owned playlists are readable" on public.playlists
  for select to anon, authenticated
  using (visibility = 'public' or owner_id = (select auth.uid()));
drop policy if exists "Users can create their own playlists" on public.playlists;
create policy "Users can create their own playlists" on public.playlists
  for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "Users can update their own playlists" on public.playlists;
create policy "Users can update their own playlists" on public.playlists
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
drop policy if exists "Users can delete their own playlists" on public.playlists;
create policy "Users can delete their own playlists" on public.playlists
  for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "Visible playlist tracks are readable" on public.playlist_tracks;
create policy "Visible playlist tracks are readable" on public.playlist_tracks
  for select to anon, authenticated using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and (p.visibility = 'public' or p.owner_id = (select auth.uid()))
    )
  );
drop policy if exists "Playlist owners can add tracks" on public.playlist_tracks;
create policy "Playlist owners can add tracks" on public.playlist_tracks
  for insert to authenticated with check (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = (select auth.uid()))
  );
drop policy if exists "Playlist owners can update tracks" on public.playlist_tracks;
create policy "Playlist owners can update tracks" on public.playlist_tracks
  for update to authenticated using (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = (select auth.uid()))
  );
drop policy if exists "Playlist owners can remove tracks" on public.playlist_tracks;
create policy "Playlist owners can remove tracks" on public.playlist_tracks
  for delete to authenticated using (
    exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = (select auth.uid()))
  );

drop policy if exists "Users can read their likes" on public.user_likes;
create policy "Users can read their likes" on public.user_likes
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users can like tracks for themselves" on public.user_likes;
create policy "Users can like tracks for themselves" on public.user_likes
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Users can remove their likes" on public.user_likes;
create policy "Users can remove their likes" on public.user_likes
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Users can read their saved playlists" on public.user_saved_playlists;
create policy "Users can read their saved playlists" on public.user_saved_playlists
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users can save playlists for themselves" on public.user_saved_playlists;
create policy "Users can save playlists for themselves" on public.user_saved_playlists
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Users can remove their saved playlists" on public.user_saved_playlists;
create policy "Users can remove their saved playlists" on public.user_saved_playlists
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Users can read their listening history" on public.listening_events;
create policy "Users can read their listening history" on public.listening_events
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users can record their listening history" on public.listening_events;
create policy "Users can record their listening history" on public.listening_events
  for insert to authenticated with check (user_id = (select auth.uid()));

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, ''), '@', 1)), 60)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();
