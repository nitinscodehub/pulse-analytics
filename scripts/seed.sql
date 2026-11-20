-- Pulse Analytics — optional Neon Postgres schema + demo seed.
-- Run with: psql "$DATABASE_URL" -f scripts/seed.sql
-- The app itself works without this file using its built-in demo dataset.

create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  plan text not null check (plan in ('Starter', 'Pro', 'Business', 'Enterprise')),
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id text primary key,
  customer_id uuid not null references customers(id),
  amount_cents integer not null check (amount_cents > 0),
  status text not null check (status in ('Paid', 'Pending', 'Refunded')),
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id bigserial primary key,
  channel text not null,
  created_at timestamptz not null default now()
);

insert into customers (name, email, plan) values
  ('Aarav Sharma', 'aarav@northstar.io', 'Business'),
  ('Priya Mehta', 'priya@lumenlabs.co', 'Pro'),
  ('Rohan Verma', 'rohan@stackforge.dev', 'Enterprise'),
  ('Sneha Iyer', 'sneha@paperplane.app', 'Starter'),
  ('Kabir Khan', 'kabir@orbitpay.com', 'Pro'),
  ('Ananya Rao', 'ananya@bloomhive.in', 'Business'),
  ('Dev Patel', 'dev@quantbase.ai', 'Pro'),
  ('Meera Nair', 'meera@wavesync.io', 'Starter')
on conflict (email) do nothing;

insert into transactions (id, customer_id, amount_cents, status)
select
  'INV-' || (4820 - row_number() over ())::text,
  c.id,
  (array[4900, 9900, 19900, 49900])[(row_number() over () % 4) + 1],
  (array['Paid', 'Paid', 'Pending', 'Paid', 'Refunded'])[(row_number() over () % 5) + 1]
from customers c
on conflict (id) do nothing;

create or replace view daily_revenue as
select
  created_at::date as day,
  sum(amount_cents) / 100.0 as revenue,
  count(*) filter (where status = 'Paid') as paid_orders
from transactions
group by 1
order by 1;

create or replace view traffic_sources as
select
  channel,
  count(*) as sessions,
  round(100.0 * count(*) / sum(count(*)) over (), 1) as share
from sessions
group by 1;
