-- Up to Chat: Supabase schema + RLS
-- Run against a fresh Supabase project (SQL editor or `supabase db push`).

create extension if not exists "pgcrypto";

-- One row per authenticated user, mirrors auth.users.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  avatar_color smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists circle_members (
  circle_id uuid not null references circles (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

-- A single "I'm up to chat" broadcast.
create table if not exists availability_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  activity text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  is_active boolean not null default true
);

-- Which circles a given status was broadcast to.
create table if not exists status_circles (
  status_id uuid not null references availability_status (id) on delete cascade,
  circle_id uuid not null references circles (id) on delete cascade,
  primary key (status_id, circle_id)
);

-- Per-user dismissal of an alert, so the feed stays personal.
create table if not exists alert_dismissals (
  user_id uuid not null references profiles (id) on delete cascade,
  status_id uuid not null references availability_status (id) on delete cascade,
  dismissed_at timestamptz not null default now(),
  primary key (user_id, status_id)
);

create index if not exists idx_circle_members_user on circle_members (user_id);
create index if not exists idx_status_circles_circle on status_circles (circle_id);
create index if not exists idx_availability_status_user on availability_status (user_id);

-- Row Level Security -------------------------------------------------------

alter table profiles enable row level security;
alter table circles enable row level security;
alter table circle_members enable row level security;
alter table availability_status enable row level security;
alter table status_circles enable row level security;
alter table alert_dismissals enable row level security;

-- profiles: anyone signed in can look up a name/initials for avatars; you can only edit yourself.
create policy "profiles are readable by authenticated users" on profiles
  for select using (auth.role() = 'authenticated');
create policy "users manage their own profile" on profiles
  for update using (auth.uid() = id);
create policy "users insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- circles: visible to members, mutable by the owner.
create policy "members can view their circles" on circles
  for select using (
    exists (select 1 from circle_members cm where cm.circle_id = circles.id and cm.user_id = auth.uid())
  );
create policy "owners manage their circles" on circles
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- circle_members: members can see the roster; owners manage membership.
create policy "members can view roster" on circle_members
  for select using (
    exists (select 1 from circle_members cm where cm.circle_id = circle_members.circle_id and cm.user_id = auth.uid())
  );
create policy "owners manage membership" on circle_members
  for insert with check (
    exists (select 1 from circles c where c.id = circle_members.circle_id and c.owner_id = auth.uid())
  );
create policy "owners remove membership" on circle_members
  for delete using (
    exists (select 1 from circles c where c.id = circle_members.circle_id and c.owner_id = auth.uid())
  );

-- availability_status: owners manage their own broadcasts; circle members can read them.
create policy "users manage their own status" on availability_status
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "circle members can read shared status" on availability_status
  for select using (
    user_id = auth.uid()
    or exists (
      select 1
      from status_circles sc
      join circle_members cm on cm.circle_id = sc.circle_id
      where sc.status_id = availability_status.id and cm.user_id = auth.uid()
    )
  );

-- status_circles: the status owner decides which circles it goes to; members can see the link.
create policy "owner broadcasts to circles" on status_circles
  for insert with check (
    exists (select 1 from availability_status s where s.id = status_circles.status_id and s.user_id = auth.uid())
  );
create policy "members can see broadcast targets" on status_circles
  for select using (
    exists (select 1 from circle_members cm where cm.circle_id = status_circles.circle_id and cm.user_id = auth.uid())
  );

-- alert_dismissals: fully private to each user.
create policy "users manage their own dismissals" on alert_dismissals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
