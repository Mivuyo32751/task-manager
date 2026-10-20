# Apply the first Groovy migration

1. Open the Groovy project folder in VS Code and open `supabase/migrations/202610150001_initial_schema.sql`.
2. Copy the entire file.
3. In the Supabase dashboard for Groovy, choose **SQL Editor → New query**. (The current `/editor` URL is the Table Editor; SQL Editor is a separate item in the dashboard sidebar.)
4. Paste the SQL and click **Run**.
5. Open **Table Editor** and confirm these tables exist: `profiles`, `tracks`, `playlists`, `playlist_tracks`, `user_likes`, `user_saved_playlists`, and `listening_events`.

The migration creates tables and access policies. It does not add music, change Auth settings, or connect the website yet. RLS is enabled so signed-in users can access only their own profiles, likes, saved playlists, and listening events. Public visitors can read only available catalog tracks and public playlists.

The migration is safe to run a second time if the first run reports a transient dashboard error. If SQL Editor shows an error, copy the exact message (do not copy any project secrets) and use it to diagnose the migration before changing the database.

After the migration succeeds, the next app-connection step is to copy `.env.local.example` to `.env.local` and fill in the project URL and **publishable** key from **Project Settings → API Keys**. Never use a `service_role` or `sb_secret_...` key in a browser-visible `NEXT_PUBLIC_` variable. Restart the Next.js server after changing `.env.local`.
