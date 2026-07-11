# Up to Chat

Let your circles know when you're genuinely free to talk — no more phone tag,
unanswered calls, or guessing whether it's a good time.

## Stack

- **Expo (React Native + TypeScript)** — iOS, Android, and web from one codebase.
- **React Navigation** — bottom tab navigation (Home / Circles / Alerts).
- **Supabase** — Postgres, auth, and row-level security (schema included, not yet wired to the UI).

## Status

This build ships the three core MVP screens running on local mock data/state
(`src/state/AppStore.tsx`), matching the product's home / circles / alerts flow:

- **Home** — greeting, the "I'm up to chat" toggle with a live countdown,
  duration picker, activity picker, and circle picker.
- **Circles** — list of circles with member avatars and active counts, plus
  a "+ new circle" flow.
- **Alerts** — a live card when you're up to chat (Call now / dismiss),
  plus a history feed of past availability from your circles.

A full Supabase schema lives in `db/schema.sql` (profiles, circles,
circle_members, availability_status, status_circles, alert_dismissals, with
RLS policies) and a client is scaffolded in `src/lib/supabase.ts`. Swapping
`AppStore` from local state to Supabase queries/subscriptions is the next step —
see "Connecting Supabase" below.

## Getting started

```bash
npm install
npm run web      # run in the browser
npm run ios      # requires macOS + Xcode, or use Expo Go
npm run android  # requires Android Studio, or use Expo Go
```

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `db/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env` and fill in your project URL and anon key.
4. Restart `expo start` so the new env vars are picked up.

Until this is done, the app runs entirely on local mock data — nothing is
sent over the network.

## Roadmap

- Auth + real contact invites into circles
- Push notifications when a circle member goes "up to chat"
- Custom statuses, recurring availability windows, favorite contacts
- Connection analytics, contacts/calendar integrations
