-- Auto-provision a profiles row whenever someone signs up.
-- Runs as SECURITY DEFINER so it works even before email confirmation,
-- when the client has no session yet to satisfy the profiles RLS policy.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', split_part(new.email, '@', 1)),
    (floor(random() * 6))::smallint
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
