# FocusFlow — Productivity SaaS Dashboard

A gamified productivity app with Supabase auth, real-time todos, and a weekly planner.

## Setup

### 1. Environment Variables

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Database

Run `supabase-schema.sql` in your Supabase Dashboard → SQL Editor. This creates:
- `profiles` — auto-populated on signup via trigger
- `todos` — user task list
- `planner_tasks` — weekly calendar events
- `focus_sessions` — timer history

### 3. Supabase Auth

In your Supabase project → Authentication → URL Configuration:
- Site URL: `http://localhost:3000` (dev) or your production URL
- Redirect URLs: add `http://localhost:3000/auth/callback`

To enable Google OAuth: Authentication → Providers → Google → enable + add credentials.

### 4. Install & Run

```bash
pnpm install
pnpm dev
```

## What Changed

- **Auth** — Real login (`/login`) and signup (`/signup`) pages with email/password + Google OAuth
- **Middleware** — Protects `/dashboard`, `/planner`, `/focus`, `/leaderboard`, `/profile` routes
- **No mock data** — `lib/mock-data.ts` deleted; `lib/db.ts` provides all Supabase helpers
- **Sidebar** — Loads real user profile; Sign Out button
- **Dashboard** — Real weekly activity, recent sessions, XP progress
- **Planner** — Weekly calendar + todo list both fully persisted to Supabase (per-week, per-user)
- **Profile** — Real stats, monthly chart, activity heatmap from actual session data
- **Leaderboard** — Ranks all real users by XP
