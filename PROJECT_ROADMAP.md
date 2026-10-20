# Groovy project roadmap

## Goal

Turn the current music app demo into a clear, responsive product that can safely connect to real accounts, a licensed catalog, and playback.

## Stage 1 — Usable on desktop and mobile

- Replace the phone-only desktop frame with responsive desktop navigation and layouts.
- Make Stats readable and honest: show playback-derived activity and explain when there is no data.
- Review every control for clear labels, useful feedback, and keyboard/touch access.
- Keep demo content clearly marked.

**Done when:** Home, Search, Player, Library, Profile, Queue, and Stats are usable at phone, tablet, and desktop widths without misleading demo numbers.

## Stage 2 — Reliable developer workflow

- Use Git Bash consistently and keep the local development address fixed at `http://localhost:3000`.
- Document how to stop an old server that is holding the port.
- Keep the build, lint, and type checks passing before each milestone is accepted.

**Done when:** A developer can start, stop, and reopen the app without guessing the port.

## Stage 3 — Accounts and saved data

- Connect Supabase Auth and Postgres.
- Move demo browser-only profiles, likes, and saved mixes to authenticated records.
- Apply and verify row-level security so users cannot access each other's private data.
- Persist playlists and listening history after the user account is connected.

**Done when:** The same user sees their profile and Library after signing in from another browser/device.

## Stage 4 — Real catalog and playback decision

- Choose a music provider that allows Groovy's intended use and user experience.
- Confirm catalog access, playback restrictions, commercial approval/licensing, and subscription requirements before building against it.
- Integrate provider search, metadata, authorization, and playback; keep the demo catalog as a fallback during development.

**Done when:** Users can search and play only music Groovy is authorized to provide, with clear unavailable/error states.

## Stage 5 — Release readiness

- Add security/privacy review, account deletion/export, rate limits, error reporting, accessibility review, and mobile/desktop QA.
- Measure performance and verify keyboard navigation, screen-reader labels, and playback behavior on supported browsers.
- Deploy a private test version and collect user feedback before public release.

**Done when:** The app has completed a documented QA pass and all content, data, and operational requirements are met.

## Current checkpoint

Stage 1 is in progress. The Stats page and desktop layouts are being improved; playback-derived stats are local to this browser until Stage 3. Real commercial music playback is not enabled until Stage 4's provider and rights checks are complete.
