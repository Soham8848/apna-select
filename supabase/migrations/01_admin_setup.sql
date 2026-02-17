-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  updated_at timestamp with time zone,
  
  primary key (id),
  constraint profiles_email_key unique (email)
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create PRODUCTS table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  price numeric not null,
  compare_at_price numeric,
  image_url text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on products
alter table public.products enable row level security;

-- Policies for products
create policy "Products are viewable by everyone."
  on products for select
  using ( true );

create policy "Only admins can insert products."
  on products for insert
  with check ( 
    exists (
      select 1 from profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "Only admins can update products."
  on products for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "Only admins can delete products."
  on products for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and is_admin = true
    )
  );
