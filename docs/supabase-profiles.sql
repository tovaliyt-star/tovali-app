-- ═══════════════════════════════════════════════════════════════
-- TOVALI APP - PROFILES TABLE SETUP
-- ═══════════════════════════════════════════════════════════════
-- Instructions:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Paste and run this entire file
-- 3. Verify: Tables → profiles exists
-- 4. Verify: Database → Triggers → on_auth_user_created exists
-- ═══════════════════════════════════════════════════════════════

-- Create profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  user_type text check (user_type in ('customer','provider')),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS Policies (idempotent with DO $$ block)
do $$
begin
  -- Policy: Users can view own profile
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'profiles' 
    and policyname = 'Profiles are viewable by owner'
  ) then
    create policy "Profiles are viewable by owner"
      on public.profiles for select 
      using (auth.uid() = id);
  end if;

  -- Policy: Users can edit own profile
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'profiles' 
    and policyname = 'Profiles are editable by owner'
  ) then
    create policy "Profiles are editable by owner"
      on public.profiles for update 
      using (auth.uid() = id);
  end if;
end$$;

-- Trigger function to auto-create profile after user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name',''),
    coalesce(new.raw_user_meta_data->>'phone',''),
    coalesce(new.raw_user_meta_data->>'user_type','customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create trigger (drop first to ensure clean state)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════
-- After running above, execute these to verify:

-- 1. Check if table exists:
-- select * from information_schema.tables where table_name = 'profiles';

-- 2. Check policies:
-- select * from pg_policies where tablename = 'profiles';

-- 3. Check trigger:
-- select * from information_schema.triggers where trigger_name = 'on_auth_user_created';

-- 4. View all profiles:
-- select * from public.profiles;

-- ═══════════════════════════════════════════════════════════════
-- MANUAL PROFILE INSERT (if trigger didn't fire for existing users)
-- ═══════════════════════════════════════════════════════════════
-- Replace USER_ID_HERE with actual UUID from auth.users:

-- insert into public.profiles (id, name, phone, user_type)
-- select 
--   id,
--   raw_user_meta_data->>'name',
--   raw_user_meta_data->>'phone',
--   coalesce(raw_user_meta_data->>'user_type', 'customer')
-- from auth.users
-- where id = 'USER_ID_HERE'
-- on conflict (id) do nothing;

