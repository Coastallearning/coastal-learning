-- The auth service runs the new-user trigger as supabase_auth_admin, which needs explicit grants.
grant usage on schema public to supabase_auth_admin;
grant select on public.app_settings to supabase_auth_admin;
grant insert, select on public.profiles to supabase_auth_admin;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare tutor text;
begin
  select value into tutor from public.app_settings where key = 'tutor_email';
  insert into public.profiles (id, email, full_name, role)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', ''),
          case when lower(new.email) = lower(coalesce(tutor, '')) then 'tutor'::user_role else 'parent'::user_role end);
  return new;
exception when others then
  raise log 'handle_new_user failed: %', sqlerrm;
  return new;
end $$;
alter function public.handle_new_user() owner to postgres;
