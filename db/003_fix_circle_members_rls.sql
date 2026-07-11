-- Fix "infinite recursion detected in policy for relation circle_members".
-- The original "members can view roster" policy queried circle_members
-- from within its own USING clause, which Postgres can't evaluate for a
-- self-referencing RLS policy. Route the membership check through a
-- SECURITY DEFINER function instead, which runs as the function owner
-- (bypassing RLS for the inner query) rather than re-triggering the policy.

create or replace function public.is_circle_member(p_circle_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from circle_members
    where circle_id = p_circle_id and user_id = p_user_id
  );
$$;

drop policy if exists "members can view roster" on circle_members;
create policy "members can view roster" on circle_members
  for select using (
    public.is_circle_member(circle_members.circle_id, auth.uid())
  );
