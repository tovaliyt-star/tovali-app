# Supabase Database Setup

## TODO: Database Schema

### 1. Profiles Table

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text,
  user_type text check (user_type in ('customer', 'provider')) not null,
  avatar text,
  address text,
  city text,
  zip_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);
```

### 2. Providers Table

```sql
-- Create providers table for provider-specific data
create table providers (
  id uuid references auth.users on delete cascade primary key,
  profile_image_url text,
  id_document_url text,
  license_document_url text,
  is_verified boolean default false,
  verification_date timestamp with time zone,
  rating decimal(3,2) default 0.00,
  completed_jobs integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table providers enable row level security;

-- Policies
create policy "Providers can view own data"
  on providers for select
  using (auth.uid() = id);

create policy "Providers can update own data"
  on providers for update
  using (auth.uid() = id);

create policy "Public can view verified providers"
  on providers for select
  using (is_verified = true);
```

### 3. Storage Buckets

```sql
-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('profile-images', 'profile-images', false),
  ('documents', 'documents', false);

-- Storage policies for profile images
create policy "Users can upload own profile image"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own profile image"
  on storage.objects for select
  using (
    bucket_id = 'profile-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for documents
create policy "Providers can upload own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 4. Automatic Profile Creation Trigger

```sql
-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, user_type)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'user_type', 'customer')
  );
  
  -- If provider, create provider record
  if (new.raw_user_meta_data->>'user_type' = 'provider') then
    insert into public.providers (id)
    values (new.id);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Next Steps

1. Log into Supabase Dashboard
2. Go to SQL Editor
3. Run the SQL commands above in order
4. Test by creating a new user via the app
5. Verify that profiles are created automatically
6. Upload test documents to verify storage policies

