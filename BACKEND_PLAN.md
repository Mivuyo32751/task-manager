# Groovy backend plan

## What the app does today

- Next.js serves the pages, but Groovy has no database or API of its own yet.
- Demo accounts, the active session, and Library likes/saved mixes live in this browser's `localStorage`.
- The available tracks, artwork, and audio URLs are fixed in `app/music-data.ts`.
- This is useful for a visual demo, but accounts and saved music do not sync to another device. Browser storage is not a safe place for production credentials or private account data.

## Recommended first backend

Keep the existing Next.js app and add **Supabase** for hosted Postgres and user authentication. Next.js pages call server endpoints; endpoints use the signed-in user's session to read or update that user's rows. The browser should never receive a database service key.

Groovy should store music metadata and provider IDs, not copy commercial audio. Playback must come from a licensed catalog or provider that permits the intended use. The current SoundHelix URLs are demo audio and must not be treated as a Drake, Kendrick Lamar, J. Cole, SZA, or Tems catalog.

## How the main flows should work

1. **Sign up / sign in**: Supabase Auth checks the email and password and returns a protected session. Groovy creates or loads a profile row. Signing out clears the session. Passwords never go into Groovy tables or browser storage.
2. **Browse and search**: the app requests catalog metadata from the server. Search returns tracks, artists, albums, and playlists. Selecting a playable result opens the player with its provider track ID.
3. **Play a track**: the app asks the approved catalog/provider for playback details, then plays only what that provider allows. The player retains its current track and queue while the user navigates around the app.
4. **Like or save**: the app sends an authenticated request. The server writes the user's like or saved playlist to Postgres. The Library loads these rows for the current user.
5. **Queue**: queue operations update client playback state immediately. If Groovy should restore a queue after sign-in or on another device, persist queue entries against the user as well.
6. **Listening stats**: after meaningful playback (for example, a track listened to for a minimum threshold), record a playback event. Stats are computed from those events, not guessed from a button press.

## Initial data model

- `profiles`: `id` (same UUID as Auth user), display name, avatar URL, chosen genres, created/updated timestamps.
- `artists`: provider ID, name, image URL, genre metadata.
- `albums`: provider ID, artist ID, title, artwork URL, release date.
- `tracks`: provider ID, album ID, title, duration, artwork URL, explicit flag, playback availability metadata.
- `playlists`: ID, owner ID (nullable for Groovy editorial playlists), title, description, artwork URL, visibility.
- `playlist_tracks`: playlist ID, track ID, position.
- `user_likes`: user ID, track ID, created timestamp; unique on user + track.
- `user_saved_playlists`: user ID, playlist ID, created timestamp; unique on user + playlist.
- `playback_events`: user ID, track ID, played-at timestamp, listened seconds.

Enable row-level security so a user can only edit their own profile, likes, saved playlists, and private playlists. Catalog/editorial rows should be readable by signed-in or public visitors as appropriate, but only server/admin jobs should edit them.

## Build order

1. Create/configure the Supabase project and local environment variables.
2. Add Auth and move profile sign-up/sign-in off `localStorage`.
3. Add database schema and row-level security policies.
4. Replace Library storage with authenticated likes and saved playlists.
5. Add catalog/search endpoints and agree on a legal playback provider before replacing demo tracks.
6. Add durable queue and playback-event based stats.

Until steps 1-4 are connected, the current browser-based profile and Library remain demo-only. Do not put Supabase secrets in a `NEXT_PUBLIC_` variable; only the public anon key belongs in browser configuration, with row-level security enabled.
