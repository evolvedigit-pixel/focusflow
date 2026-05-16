-- ============================================================
-- FocusFlow — Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  level int not null default 1,
  xp int not null default 0,
  xp_to_next_level int not null default 1000,
  streak int not null default 0,
  total_focus_hours numeric not null default 0,
  sessions_completed int not null default 0,
  productivity_score int not null default 0,
  joined_date timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Todos table
-- ============================================================
create table if not exists public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text not null default 'work',
  priority text not null default 'medium', -- low | medium | high
  due_date date,
  completed boolean not null default false,
  xp_reward int not null default 25,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.todos enable row level security;
create policy "Users manage own todos" on public.todos for all using (auth.uid() = user_id);

-- ============================================================
-- Weekly planner tasks table
-- ============================================================
create table if not exists public.planner_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text not null default 'work',
  day int not null, -- 0=Mon … 6=Sun
  start_hour numeric not null, -- e.g. 9, 10.5
  duration numeric not null default 1, -- hours
  completed boolean not null default false,
  week_start date not null, -- ISO date of Monday for that week
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.planner_tasks enable row level security;
create policy "Users manage own planner tasks" on public.planner_tasks for all using (auth.uid() = user_id);

-- ============================================================
-- Focus sessions table
-- ============================================================
create table if not exists public.focus_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null default 'pomodoro',
  duration int not null, -- minutes
  xp_earned int not null default 0,
  completed_at timestamp with time zone default now()
);

alter table public.focus_sessions enable row level security;
create policy "Users manage own sessions" on public.focus_sessions for all using (auth.uid() = user_id);
