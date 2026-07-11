# Up to Chat

Let your circles know when you're genuinely free to talk — no more phone tag,
unanswered calls, or guessing whether it's a good time.

## Stack

- **Expo (React Native + TypeScript)** — iOS, Android, and web from one codebase.
- **React Navigation** — bottom tab navigation (Home / Circles / Alerts).
- **Supabase** — Postgres, auth (email/password), row-level security, and realtime.

## Status

The app is wired to a live Supabase backend:

- **Auth** — email/password sign-up and sign-in (`src/screens/AuthScreen.tsx`,
  `src/state/AuthContext.tsx`) gate the main app.
- **Home** — greeting, the "I'm up to chat" toggle with a live countdown,
  duration picker, activity picker, and circle picker. Going "up to chat"
  writes to `availability_status` + `status_circles`.
- **Circles** — circles you belong to, with member avatars and live active
  counts, plus a "+ new circle" flow that creates a `circles` row and adds
  you as owner in `circle_members`.
- **Alerts** — live cards (Call now / dismiss) for circle members currently
  up to chat, plus a history feed. A realtime subscription on
  `availability_status` keeps this in sync across devices.

Data access lives in `src/data/api.ts`; `src/state/AppStore.tsx` wires it into
React state. `db/schema.sql` and `db/002_profile_trigger.sql` are the two
migrations that need to be run (in order) against a fresh Supabase project.

## Getting started

```bash
npm install
npm run web      # run in the browser
npm run ios      # requires macOS + Xcode, or use Expo Go
npm run android  # requires Android Studio, or use Expo Go
```

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `db/schema.sql`, then `db/002_profile_trigger.sql`.
3. Copy `.env.example` to `.env` and fill in your project URL and anon/publishable key
   (Project Settings → API).
4. Restart `expo start` so the new env vars are picked up.

Without a configured `.env`, auth calls will fail with a "Failed to fetch"
banner — the UI still renders, but nothing can be created or fetched.

## Roadmap

- Real contact invites into circles (beyond the creator)
- Push notifications when a circle member goes "up to chat"
- Custom statuses, recurring availability windows, favorite contacts
- Connection analytics, contacts/calendar integrations
