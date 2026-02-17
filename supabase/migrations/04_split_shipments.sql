
-- Create shipments table
create table if not exists public.shipments (
    id uuid not null default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    courier_name text not null,
    tracking_number text not null,
    created_at timestamp with time zone not null default now(),
    constraint shipments_pkey primary key (id)
);

-- Enable RLS for shipments
alter table public.shipments enable row level security;

-- Create policies for shipments
create policy "Admins can view all shipments"
    on public.shipments for select
    using ( exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) );

create policy "Admins can insert shipments"
    on public.shipments for insert
    with check ( exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) );

create policy "Users can view their own order shipments"
    on public.shipments for select
    using ( exists (select 1 from public.orders where id = public.shipments.order_id and user_id = auth.uid()) );

-- Add shipment_id to order_items
alter table public.order_items 
add column if not exists shipment_id uuid references public.shipments(id);

-- Add phone and email to addresses table if they don't exist
-- Note: 'email' might be redundant if we use auth.email(), but useful for guest checkout or specific contact info
alter table public.addresses 
add column if not exists phone text,
add column if not exists email text;
