-- Coastal Learning schema. Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type user_role as enum ('tutor', 'parent');
create type session_format as enum ('in_home', 'online');
create type session_type as enum ('consultation', 'session_45', 'session_60');
create type booking_status as enum ('pending', 'confirmed', 'declined', 'cancelled', 'completed');

-- ---------- profiles (one per auth user) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'parent',
  full_name text not null default '',
  email text not null default '',
  phone text,
  created_at timestamptz not null default now()
);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when new.email = (select value from app_settings where key = 'tutor_email') then 'tutor' else 'parent' end
  );
  return new;
end $$;

create table app_settings (key text primary key, value text not null);
insert into app_settings (key, value) values ('tutor_email', 'lindsaykgagnon@gmail.com');

create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure handle_new_user();

create or replace function is_tutor() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'tutor');
$$;

-- ---------- families & children ----------
create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table family_members (
  family_id uuid not null references families(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  primary key (family_id, profile_id)
);

create table children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  first_name text not null,
  grade text not null,
  school text,
  current_focus text,
  home_practice text,
  notes_private text,          -- tutor only
  created_at timestamptz not null default now()
);

create or replace function in_family(fid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from family_members where family_id = fid and profile_id = auth.uid());
$$;

create or replace function child_family(cid uuid) returns uuid language sql stable security definer set search_path = public as $$
  select family_id from children where id = cid;
$$;

-- ---------- availability & bookings ----------
create table availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  slot_minutes smallint not null default 60,
  format session_format[] not null default '{in_home,online}',
  active boolean not null default true
);

create table blocked_times (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  type session_type not null,
  format session_format not null,
  status booking_status not null default 'pending',
  -- who booked (may be a prospect with no account yet)
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  child_name text not null,
  child_grade text not null,
  notes text,
  -- links once the family exists
  family_id uuid references families(id) on delete set null,
  child_id uuid references children(id) on delete set null,
  video_room text,             -- Jitsi room name for online sessions
  created_at timestamptz not null default now()
);
create index bookings_starts_idx on bookings (starts_at);

-- ---------- learning record ----------
create table briefings (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  session_date date not null default current_date,
  focus text not null,
  worked_on text not null,
  wins text,
  next_steps text,
  home_practice text,
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  name text not null,
  level smallint not null check (level between 0 and 100),
  sort smallint not null default 0,
  updated_at timestamptz not null default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  uploaded_by uuid references profiles(id) on delete set null,
  storage_path text not null,
  file_name text not null,
  size_bytes bigint,
  mime text,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- row level security ----------
alter table profiles enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;
alter table children enable row level security;
alter table availability_rules enable row level security;
alter table blocked_times enable row level security;
alter table bookings enable row level security;
alter table briefings enable row level security;
alter table skills enable row level security;
alter table files enable row level security;
alter table messages enable row level security;
alter table app_settings enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid() or is_tutor());
create policy "update own profile" on profiles for update using (id = auth.uid());

create policy "families: members or tutor" on families for select using (in_family(id) or is_tutor());
create policy "families: tutor writes" on families for all using (is_tutor()) with check (is_tutor());

create policy "members: self or tutor" on family_members for select using (profile_id = auth.uid() or is_tutor());
create policy "members: tutor writes" on family_members for all using (is_tutor()) with check (is_tutor());

create policy "children: family or tutor" on children for select using (in_family(family_id) or is_tutor());
create policy "children: tutor writes" on children for all using (is_tutor()) with check (is_tutor());

create policy "availability: public read" on availability_rules for select using (true);
create policy "availability: tutor writes" on availability_rules for all using (is_tutor()) with check (is_tutor());
create policy "blocked: public read" on blocked_times for select using (true);
create policy "blocked: tutor writes" on blocked_times for all using (is_tutor()) with check (is_tutor());

-- anyone may request a booking; only tutor and the family can read it
create policy "bookings: insert" on bookings for insert with check (status = 'pending');
create policy "bookings: read" on bookings for select using (is_tutor() or (family_id is not null and in_family(family_id)));
create policy "bookings: tutor writes" on bookings for update using (is_tutor()) with check (is_tutor());
create policy "bookings: tutor deletes" on bookings for delete using (is_tutor());

create policy "briefings: family or tutor" on briefings for select using (is_tutor() or in_family(child_family(child_id)));
create policy "briefings: tutor writes" on briefings for all using (is_tutor()) with check (is_tutor());

create policy "skills: family or tutor" on skills for select using (is_tutor() or in_family(child_family(child_id)));
create policy "skills: tutor writes" on skills for all using (is_tutor()) with check (is_tutor());

create policy "files: family or tutor" on files for select using (is_tutor() or in_family(child_family(child_id)));
create policy "files: family or tutor insert" on files for insert with check (is_tutor() or in_family(child_family(child_id)));
create policy "files: tutor deletes" on files for delete using (is_tutor());

create policy "messages: family or tutor" on messages for select using (is_tutor() or in_family(family_id));
create policy "messages: family or tutor insert" on messages for insert with check (sender_id = auth.uid() and (is_tutor() or in_family(family_id)));
create policy "messages: mark read" on messages for update using (is_tutor() or in_family(family_id));

create policy "settings: tutor" on app_settings for all using (is_tutor()) with check (is_tutor());

-- public view of busy times (no personal data) so prospects see real availability
create view public_busy as
  select starts_at, ends_at from bookings where status in ('pending','confirmed')
  union all
  select starts_at, ends_at from blocked_times;
grant select on public_busy to anon, authenticated;

-- ---------- storage ----------
insert into storage.buckets (id, name, public) values ('student-files', 'student-files', false)
  on conflict (id) do nothing;

-- object path: <child_id>/<uuid>-<filename>
create policy "student files read" on storage.objects for select
  using (bucket_id = 'student-files' and (is_tutor() or in_family(child_family((storage.foldername(name))[1]::uuid))));
create policy "student files insert" on storage.objects for insert
  with check (bucket_id = 'student-files' and (is_tutor() or in_family(child_family((storage.foldername(name))[1]::uuid))));
create policy "student files delete" on storage.objects for delete
  using (bucket_id = 'student-files' and is_tutor());

-- ---------- Lindsay's default availability (edit in Admin > Availability) ----------
insert into availability_rules (weekday, start_time, end_time) values
  (1, '15:00', '19:00'), (2, '15:00', '19:00'), (3, '15:00', '19:00'), (4, '15:00', '19:00'),
  (5, '15:00', '18:00'), (6, '09:00', '12:00');
