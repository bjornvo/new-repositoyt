-- NovaCrypt Bank — Supabase Schema
-- Run this in the Supabase SQL Editor to initialize the database.

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  first_name    text,
  last_name     text,
  plan          text not null default 'starter' check (plan in ('starter', 'pro', 'institutional')),
  kyc_status    text not null default 'pending' check (kyc_status in ('pending', 'verified', 'rejected')),
  two_fa_enabled boolean not null default false,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ── Wallets ───────────────────────────────────────────────────────────────────
create table if not exists public.wallets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  chain       text not null,
  symbol      text not null,
  address     text not null,
  balance     numeric(24, 8) not null default 0,
  usd_value   numeric(18, 2) not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "Users can manage own wallets"
  on public.wallets for all using (auth.uid() = user_id);

-- ── Transactions ──────────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null check (type in ('send','receive','swap','stake','unstake','earn')),
  asset        text not null,
  amount       numeric(24, 8) not null,
  usd_value    numeric(18, 2) not null,
  status       text not null default 'pending' check (status in ('completed','pending','failed')),
  from_address text,
  to_address   text,
  tx_hash      text,
  fee          numeric(18, 8) not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can read own transactions"
  on public.transactions for select using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert with check (auth.uid() = user_id);

-- ── Stakes ────────────────────────────────────────────────────────────────────
create table if not exists public.stakes (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  asset            text not null,
  amount           numeric(24, 8) not null,
  apy              numeric(5, 2) not null,
  earned           numeric(24, 8) not null default 0,
  status           text not null default 'active' check (status in ('active','unlocking','unstaked')),
  lock_period_days integer not null default 0,
  started_at       timestamptz not null default now(),
  unlock_at        timestamptz,
  created_at       timestamptz not null default now()
);

alter table public.stakes enable row level security;

create policy "Users can manage own stakes"
  on public.stakes for all using (auth.uid() = user_id);

-- ── Updated_at trigger ────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ── Auto-create profile on signup ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists transactions_user_id_created_at on public.transactions(user_id, created_at desc);
create index if not exists wallets_user_id on public.wallets(user_id);
create index if not exists stakes_user_id_status on public.stakes(user_id, status);
