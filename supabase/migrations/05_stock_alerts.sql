-- Back-in-stock alerts
--
-- Out-of-stock product pages are currently dead ends: the shopper arrived with
-- intent, found nothing to do, and left with no way for us to reach them. This
-- table turns that traffic into a mailing list of people who have already told
-- us exactly which product they want.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create table if not exists public.stock_alerts (
    id uuid primary key default gen_random_uuid(),
    product_id bigint not null references public.products (id) on delete cascade,
    email text not null,
    -- Set when we have actually emailed this person, so a restock does not
    -- notify the same shopper twice.
    notified_at timestamptz,
    created_at timestamptz not null default now()
);

-- One request per person per product.
create unique index if not exists stock_alerts_product_email_idx
    on public.stock_alerts (product_id, lower(email));

create index if not exists stock_alerts_pending_idx
    on public.stock_alerts (product_id)
    where notified_at is null;

alter table public.stock_alerts enable row level security;

-- Anyone may register interest, including guests: requiring an account here
-- would throw away most of the demand this table exists to capture.
drop policy if exists "stock_alerts_public_insert" on public.stock_alerts;
create policy "stock_alerts_public_insert"
    on public.stock_alerts
    for insert
    to anon, authenticated
    with check (true);

-- Deliberately no public select policy. These are customer email addresses;
-- only the service role (admin tooling, the restock job) may read them.
