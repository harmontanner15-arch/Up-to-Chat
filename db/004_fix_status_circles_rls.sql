-- Fix "infinite recursion detected in policy for relation status_circles".
-- status_circles' insert policy queried availability_status, whose select
-- policy in turn queried status_circles — a circular dependency between
-- the two tables' RLS policies, which Postgres can't evaluate. Route both
-- checks through SECURITY DEFINER functions so the inner queries bypass
-- RLS instead of re-triggering the other table's policy.

create or replace function public.status_owner(p_status_id uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select user_id from availability_status where id = p_status_id;
$$;

create or replace function public.status_shared_with(p_status_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from status_circles sc
    join circle_members cm on cm.circle_id = sc.circle_id
    where sc.status_id = p_status_id and cm.user_id = p_user_id
  );
$$;

drop policy if exists "owner broadcasts to circles" on status_circles;
create policy "owner broadcasts to circles" on status_circles
  for insert with check (
    public.status_owner(status_circles.status_id) = auth.uid()
  );

drop policy if exists "circle members can read shared status" on availability_status;
create policy "circle members can read shared status" on availability_status
  for select using (
    user_id = auth.uid()
    or public.status_shared_with(availability_status.id, auth.uid())
  );
