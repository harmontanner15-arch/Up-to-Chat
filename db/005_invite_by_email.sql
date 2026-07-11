-- Let a circle owner invite an existing user by email without exposing
-- the full user list. SECURITY DEFINER lets this read auth.users (normally
-- off-limits to clients) but only ever returns a single exact-match row.

create or replace function public.find_profile_by_email(p_email text)
returns table (id uuid, first_name text, avatar_color smallint)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.first_name, p.avatar_color
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(u.email) = lower(p_email)
  limit 1;
$$;

revoke all on function public.find_profile_by_email(text) from public;
grant execute on function public.find_profile_by_email(text) to authenticated;
