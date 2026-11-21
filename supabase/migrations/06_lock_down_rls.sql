-- 06 - Lock down row-level security
--
-- BEFORE RUNNING:
--   1. Add SUPABASE_SECRET_KEY to .env.local (and to your hosting env,
--      e.g. Vercel). Supabase -> Project Settings -> API Keys -> Secret keys
--      ("sb_secret_..."). The legacy service_role key also works, as
--      SUPABASE_SERVICE_ROLE_KEY.
--      Checkout writes orders with that key; after this migration shoppers can
--      no longer write to `orders` / `order_items` directly, so checkout will
--      fail without it.
--   2. Restart / redeploy the app so it picks up the key.
--   3. Run this whole file in the Supabase SQL editor.
--
-- What it fixes:
--   * Any signed-up user could set profiles.is_admin = true on their own row
--     and become an admin (the "update own profile" policy allowed every
--     column).
--   * Every profile (emails, admin flags) was readable by anyone.
--   * orders / order_items / order_tracking / addresses / favorites / reviews
--     had no policies in the repo - whatever is configured in the dashboard is
--     replaced here with explicit owner-or-admin rules.
--
-- This DROPS every existing policy on the tables listed below and recreates
-- them. Policies on `products` and `stock_alerts` are left untouched.

begin;

-- ------------------------------------------------------------------
-- Helper: is the current user an admin?
-- security definer so policies on `profiles` can call it without recursion.
-- ------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Helper: does the current user own this order?
create or replace function public.owns_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.orders
        where orders.id = p_order_id and orders.user_id = auth.uid()
    )
$$;

grant execute on function public.owns_order(uuid) to anon, authenticated;

-- ------------------------------------------------------------------
-- Drop all existing policies on the tables we are taking over.
-- ------------------------------------------------------------------
do $$
declare
    pol record;
begin
    for pol in
        select schemaname, tablename, policyname
        from pg_policies
        where schemaname = 'public'
          and tablename in ('profiles', 'orders', 'order_items', 'order_tracking',
                            'shipments', 'addresses', 'favorites', 'reviews')
    loop
        execute format('drop policy %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    end loop;
end $$;

-- ------------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles: read own or admin"
    on public.profiles for select
    using (id = auth.uid() or public.is_admin());

create policy "profiles: insert own"
    on public.profiles for insert
    with check (id = auth.uid());

create policy "profiles: update own"
    on public.profiles for update
    using (id = auth.uid())
    with check (id = auth.uid());

-- Policies cannot restrict individual columns, so a trigger blocks anyone but
-- the service role / SQL editor from granting or removing admin rights.
create or replace function public.protect_is_admin()
returns trigger
language plpgsql
as $$
begin
    if (tg_op = 'INSERT' and coalesce(new.is_admin, false))
       or (tg_op = 'UPDATE' and new.is_admin is distinct from old.is_admin) then
        if coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
           and current_user not in ('postgres', 'supabase_admin') then
            raise exception 'is_admin can only be changed by the service role';
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists protect_is_admin on public.profiles;
create trigger protect_is_admin
    before insert or update on public.profiles
    for each row execute function public.protect_is_admin();

-- ------------------------------------------------------------------
-- orders - shoppers read their own; only admins (or the server's service
-- role, which bypasses RLS) write.
-- ------------------------------------------------------------------
alter table public.orders enable row level security;

create policy "orders: read own or admin"
    on public.orders for select
    using (user_id = auth.uid() or public.is_admin());

create policy "orders: admin update"
    on public.orders for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "orders: admin delete"
    on public.orders for delete
    using (public.is_admin());

-- ------------------------------------------------------------------
-- order_items
-- ------------------------------------------------------------------
alter table public.order_items enable row level security;

create policy "order_items: read own or admin"
    on public.order_items for select
    using (public.is_admin() or public.owns_order(order_id));

create policy "order_items: admin update"
    on public.order_items for update
    using (public.is_admin())
    with check (public.is_admin());

-- ------------------------------------------------------------------
-- order_tracking
-- ------------------------------------------------------------------
alter table public.order_tracking enable row level security;

create policy "order_tracking: read own or admin"
    on public.order_tracking for select
    using (public.is_admin() or public.owns_order(order_id));

create policy "order_tracking: admin insert"
    on public.order_tracking for insert
    with check (public.is_admin());

create policy "order_tracking: admin update"
    on public.order_tracking for update
    using (public.is_admin())
    with check (public.is_admin());

-- ------------------------------------------------------------------
-- shipments
-- ------------------------------------------------------------------
alter table public.shipments enable row level security;

create policy "shipments: read own or admin"
    on public.shipments for select
    using (public.is_admin() or public.owns_order(order_id));

create policy "shipments: admin insert"
    on public.shipments for insert
    with check (public.is_admin());

create policy "shipments: admin update"
    on public.shipments for update
    using (public.is_admin())
    with check (public.is_admin());

-- ------------------------------------------------------------------
-- addresses - private to their owner (admins can read for fulfilment).
-- ------------------------------------------------------------------
alter table public.addresses enable row level security;

create policy "addresses: read own or admin"
    on public.addresses for select
    using (user_id = auth.uid() or public.is_admin());

create policy "addresses: insert own"
    on public.addresses for insert
    with check (user_id = auth.uid());

create policy "addresses: update own"
    on public.addresses for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "addresses: delete own"
    on public.addresses for delete
    using (user_id = auth.uid());

-- ------------------------------------------------------------------
-- favorites - private to their owner.
-- ------------------------------------------------------------------
alter table public.favorites enable row level security;

create policy "favorites: read own"
    on public.favorites for select
    using (user_id = auth.uid());

create policy "favorites: insert own"
    on public.favorites for insert
    with check (user_id = auth.uid());

create policy "favorites: delete own"
    on public.favorites for delete
    using (user_id = auth.uid());

-- ------------------------------------------------------------------
-- reviews - public to read; you can only write as yourself.
-- ------------------------------------------------------------------
do $$
begin
    if to_regclass('public.reviews') is not null then
        execute 'alter table public.reviews enable row level security';
        execute $p$create policy "reviews: public read" on public.reviews
                   for select using (true)$p$;
        execute $p$create policy "reviews: insert own" on public.reviews
                   for insert with check (user_id = auth.uid())$p$;
        execute $p$create policy "reviews: update own" on public.reviews
                   for update using (user_id = auth.uid()) with check (user_id = auth.uid())$p$;
        execute $p$create policy "reviews: delete own or admin" on public.reviews
                   for delete using (user_id = auth.uid() or public.is_admin())$p$;
    end if;
end $$;

commit;
