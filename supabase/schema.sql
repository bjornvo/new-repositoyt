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
  is_admin      boolean not null default false,
  is_suspended  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists is_suspended boolean not null default false;

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ── Admin helper ─────────────────────────────────────────────────────────────
-- security definer + fixed search_path: lets RLS policies check "is this caller
-- an admin?" without being blocked by the (intentionally) row-scoped policies
-- on public.profiles above (a normal SELECT under RLS could only ever see the
-- caller's own row, which would make this function useless inside other
-- tables' policies).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Admins can read / moderate every profile (KYC review, user management, etc.)
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select using (public.is_admin());

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
  on public.profiles for update using (public.is_admin());

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

drop policy if exists "Users can manage own wallets" on public.wallets;
create policy "Users can manage own wallets"
  on public.wallets for all using (auth.uid() = user_id);

drop policy if exists "Admins can manage all wallets" on public.wallets;
create policy "Admins can manage all wallets"
  on public.wallets for all using (public.is_admin());

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

drop policy if exists "Users can read own transactions" on public.transactions;
create policy "Users can read own transactions"
  on public.transactions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own transactions" on public.transactions;
create policy "Users can insert own transactions"
  on public.transactions for insert with check (auth.uid() = user_id);

drop policy if exists "Admins can read all transactions" on public.transactions;
create policy "Admins can read all transactions"
  on public.transactions for select using (public.is_admin());

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

drop policy if exists "Users can manage own stakes" on public.stakes;
create policy "Users can manage own stakes"
  on public.stakes for all using (auth.uid() = user_id);

drop policy if exists "Admins can read all stakes" on public.stakes;
create policy "Admins can read all stakes"
  on public.stakes for select using (public.is_admin());

-- ── Cards ─────────────────────────────────────────────────────────────────────
-- Fictitious sandbox card data only (this product never touches a real card
-- network), so storing the demo PAN/CVV in plain columns is fine — there is no
-- real cardholder data here to protect.
create table if not exists public.cards (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('virtual', 'physical')),
  number      text not null,
  expiry      text not null,
  cvv         text not null,
  holder_name text not null,
  balance     numeric(18, 2) not null default 0,
  spent       numeric(18, 2) not null default 0,
  card_limit  numeric(18, 2) not null default 5000,
  frozen      boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.cards enable row level security;

drop policy if exists "Users can manage own cards" on public.cards;
create policy "Users can manage own cards"
  on public.cards for all using (auth.uid() = user_id);

drop policy if exists "Admins can read all cards" on public.cards;
create policy "Admins can read all cards"
  on public.cards for select using (public.is_admin());

-- ── Market prices ─────────────────────────────────────────────────────────────
-- Stand-in for a live price feed. Exchange/Portfolio/Ticker read from here so
-- the whole app shares one consistent set of prices; admins can edit them from
-- Platform Settings without a deploy.
create table if not exists public.market_prices (
  symbol      text primary key,
  name        text not null,
  price       numeric(18, 8) not null,
  change_24h  numeric(6, 2) not null default 0,
  color       text not null default '#00D4FF',
  updated_at  timestamptz not null default now()
);

alter table public.market_prices enable row level security;

drop policy if exists "Anyone can read market prices" on public.market_prices;
create policy "Anyone can read market prices"
  on public.market_prices for select using (true);

drop policy if exists "Admins can manage market prices" on public.market_prices;
create policy "Admins can manage market prices"
  on public.market_prices for all using (public.is_admin());

insert into public.market_prices (symbol, name, price, change_24h, color) values
  ('BTC',  'Bitcoin',     67842.50, 2.43,  '#F7931A'),
  ('ETH',  'Ethereum',     3521.18, 1.82,  '#627EEA'),
  ('SOL',  'Solana',        182.40, 5.21,  '#9945FF'),
  ('BNB',  'BNB Chain',     612.33, -0.87, '#F0B90B'),
  ('MATIC','Polygon',         0.8921, 2.18,'#8247E5'),
  ('USDT', 'Tether',          1.00, 0.01,  '#26A17B'),
  ('USDC', 'USD Coin',        1.00, 0.00,  '#2775CA'),
  ('XRP',  'XRP',             0.6241, 3.14,'#23292F'),
  ('ADA',  'Cardano',         0.5831, -1.23,'#0033AD'),
  ('AVAX', 'Avalanche',      42.87, 4.56,  '#E84142'),
  ('DOT',  'Polkadot',        8.92, -0.34, '#E6007A'),
  ('LINK', 'Chainlink',      18.43, 3.72,  '#2A5ADA'),
  ('UNI',  'Uniswap',        12.64, -2.01, '#FF007A'),
  ('ATOM', 'Cosmos',          9.78, 1.45,  '#2E3148')
on conflict (symbol) do nothing;

-- ── Announcements ─────────────────────────────────────────────────────────────
create table if not exists public.announcements (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  body        text not null,
  type        text not null default 'info' check (type in ('info', 'warning', 'maintenance')),
  active      boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "Anyone can read active announcements" on public.announcements;
create policy "Anyone can read active announcements"
  on public.announcements for select using (active = true or public.is_admin());

drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements"
  on public.announcements for all using (public.is_admin());

-- ── Admin settings (singleton row) ────────────────────────────────────────────
create table if not exists public.admin_settings (
  id                  smallint primary key default 1 check (id = 1),
  spot_fee_pct        numeric(5, 2) not null default 0.30,
  withdrawal_fee_pct  numeric(5, 2) not null default 0.50,
  staking_fee_pct     numeric(5, 2) not null default 0.00,
  daily_withdraw_limit numeric(18, 2) not null default 500000,
  kyc_level1_limit    numeric(18, 2) not null default 10000,
  kyc_level2_limit    numeric(18, 2) not null default 1000000,
  updated_at          timestamptz not null default now()
);

alter table public.admin_settings enable row level security;

drop policy if exists "Admins can read settings" on public.admin_settings;
create policy "Admins can read settings"
  on public.admin_settings for select using (public.is_admin());

drop policy if exists "Admins can update settings" on public.admin_settings;
create policy "Admins can update settings"
  on public.admin_settings for update using (public.is_admin());

insert into public.admin_settings (id) values (1) on conflict (id) do nothing;

-- ── Updated_at triggers ───────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists admin_settings_updated_at on public.admin_settings;
create trigger admin_settings_updated_at
  before update on public.admin_settings
  for each row execute function public.handle_updated_at();

drop trigger if exists market_prices_updated_at on public.market_prices;
create trigger market_prices_updated_at
  before update on public.market_prices
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists transactions_user_id_created_at on public.transactions(user_id, created_at desc);
create index if not exists wallets_user_id on public.wallets(user_id);
create index if not exists stakes_user_id_status on public.stakes(user_id, status);
create index if not exists cards_user_id on public.cards(user_id);
create index if not exists announcements_active on public.announcements(active);

-- ═══════════════════════════════════════════════════════════════════════════
-- RPC functions — every balance-mutating action goes through one of these so
-- the read-then-write is atomic (no lost updates from two tabs sending at once)
-- and so the business rule (fee %, ownership check, sufficient balance) lives
-- in one place instead of being re-implemented in every client call site.
-- ═══════════════════════════════════════════════════════════════════════════

-- Find (or lazily create) the caller's wallet for a symbol — used internally
-- by swap/unstake/topup so credits always land somewhere.
create or replace function public._get_or_create_wallet(p_user_id uuid, p_symbol text, p_chain text)
returns public.wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets;
begin
  select * into w from public.wallets where user_id = p_user_id and symbol = p_symbol limit 1;
  if w.id is null then
    insert into public.wallets (user_id, chain, symbol, address, balance, usd_value)
    values (p_user_id, coalesce(p_chain, p_symbol), p_symbol, 'internal', 0, 0)
    returning * into w;
  end if;
  return w;
end;
$$;

-- Send funds out of one of the caller's wallets (simulates broadcasting to an
-- external address — there is no counterpart credit since the recipient isn't
-- necessarily a NovaCrypt user).
create or replace function public.send_funds(p_wallet_id uuid, p_amount numeric, p_to_address text)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets;
  v_price numeric;
  fee_pct numeric;
  fee_usd numeric;
  usd_amount numeric;
  tx public.transactions;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  select * into w from public.wallets where id = p_wallet_id and user_id = auth.uid();
  if w.id is null then
    raise exception 'Wallet not found';
  end if;
  if w.balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  select price into v_price from public.market_prices where symbol = w.symbol;
  select coalesce(withdrawal_fee_pct, 0.5) into fee_pct from public.admin_settings where id = 1;
  usd_amount := p_amount * coalesce(v_price, 1);
  fee_usd := usd_amount * coalesce(fee_pct, 0.5) / 100;

  update public.wallets
    set balance = balance - p_amount,
        usd_value = greatest(usd_value - usd_amount, 0)
    where id = w.id;

  insert into public.transactions (user_id, type, asset, amount, usd_value, status, to_address, fee)
  values (auth.uid(), 'send', w.symbol, p_amount, usd_amount, 'completed', p_to_address, fee_usd)
  returning * into tx;

  return tx;
end;
$$;

-- Swap one asset for another at the current market_prices rate, minus the
-- platform's spot fee.
create or replace function public.swap_assets(p_from_symbol text, p_to_symbol text, p_from_amount numeric)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  from_w public.wallets;
  to_w public.wallets;
  price_from numeric;
  price_to numeric;
  fee_pct numeric;
  fee_amount numeric;
  net_amount numeric;
  to_amount numeric;
  usd_amount numeric;
  tx public.transactions;
begin
  if p_from_amount is null or p_from_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;
  if p_from_symbol = p_to_symbol then
    raise exception 'Cannot swap an asset into itself';
  end if;

  select price into price_from from public.market_prices where symbol = p_from_symbol;
  select price into price_to from public.market_prices where symbol = p_to_symbol;
  if price_from is null or price_to is null then
    raise exception 'Unknown asset';
  end if;

  select * into from_w from public.wallets where user_id = auth.uid() and symbol = p_from_symbol limit 1;
  if from_w.id is null or from_w.balance < p_from_amount then
    raise exception 'Insufficient balance';
  end if;

  select coalesce(spot_fee_pct, 0.3) into fee_pct from public.admin_settings where id = 1;
  fee_amount := p_from_amount * coalesce(fee_pct, 0.3) / 100;
  net_amount := p_from_amount - fee_amount;
  to_amount := net_amount * price_from / price_to;
  usd_amount := p_from_amount * price_from;

  update public.wallets
    set balance = balance - p_from_amount,
        usd_value = greatest(usd_value - usd_amount, 0)
    where id = from_w.id;

  to_w := public._get_or_create_wallet(auth.uid(), p_to_symbol, p_to_symbol);
  update public.wallets
    set balance = balance + to_amount,
        usd_value = usd_value + (to_amount * price_to)
    where id = to_w.id;

  insert into public.transactions (user_id, type, asset, amount, usd_value, status, fee)
  values (auth.uid(), 'swap', p_from_symbol || '→' || p_to_symbol, p_from_amount, usd_amount, 'completed', fee_amount * price_from)
  returning * into tx;

  return tx;
end;
$$;

-- Open a stake: deducts the wallet now so the same balance can't be both
-- "available" and "staked" at once.
create or replace function public.create_stake(p_symbol text, p_amount numeric, p_apy numeric, p_lock_period_days integer)
returns public.stakes
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets;
  v_price numeric;
  usd_amount numeric;
  stake public.stakes;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  select * into w from public.wallets where user_id = auth.uid() and symbol = p_symbol limit 1;
  if w.id is null or w.balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  select price into v_price from public.market_prices where symbol = p_symbol;
  usd_amount := p_amount * coalesce(v_price, 1);

  update public.wallets
    set balance = balance - p_amount,
        usd_value = greatest(usd_value - usd_amount, 0)
    where id = w.id;

  insert into public.stakes (user_id, asset, amount, apy, status, lock_period_days, unlock_at)
  values (
    auth.uid(), p_symbol, p_amount, p_apy, 'active', p_lock_period_days,
    case when p_lock_period_days > 0 then now() + (p_lock_period_days || ' days')::interval else null end
  )
  returning * into stake;

  insert into public.transactions (user_id, type, asset, amount, usd_value, status, fee)
  values (auth.uid(), 'stake', p_symbol, p_amount, usd_amount, 'completed', 0);

  return stake;
end;
$$;

-- Close a stake: credits principal + accrued rewards back to the wallet.
create or replace function public.unstake_position(p_stake_id uuid)
returns public.stakes
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.stakes;
  w public.wallets;
  v_price numeric;
  payout numeric;
  usd_amount numeric;
begin
  select * into s from public.stakes where id = p_stake_id and user_id = auth.uid();
  if s.id is null then
    raise exception 'Stake not found';
  end if;
  if s.status = 'unstaked' then
    raise exception 'Stake already closed';
  end if;

  payout := s.amount + s.earned;
  select price into v_price from public.market_prices where symbol = s.asset;
  usd_amount := payout * coalesce(v_price, 1);

  w := public._get_or_create_wallet(auth.uid(), s.asset, s.asset);
  update public.wallets
    set balance = balance + payout,
        usd_value = usd_value + usd_amount
    where id = w.id;

  update public.stakes set status = 'unstaked', unlock_at = now() where id = s.id;

  insert into public.transactions (user_id, type, asset, amount, usd_value, status, fee)
  values (auth.uid(), 'unstake', s.asset, payout, usd_amount, 'completed', 0);

  select * into s from public.stakes where id = p_stake_id;
  return s;
end;
$$;

-- Toggle freeze on one of the caller's cards.
create or replace function public.toggle_card_freeze(p_card_id uuid)
returns public.cards
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.cards;
begin
  update public.cards set frozen = not frozen
    where id = p_card_id and user_id = auth.uid()
    returning * into c;
  if c.id is null then
    raise exception 'Card not found';
  end if;
  return c;
end;
$$;

-- Move USD value from a crypto wallet onto a card's spendable balance.
create or replace function public.topup_card(p_card_id uuid, p_wallet_id uuid, p_usd_amount numeric)
returns public.cards
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets;
  c public.cards;
  v_price numeric;
  asset_amount numeric;
begin
  if p_usd_amount is null or p_usd_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  select * into w from public.wallets where id = p_wallet_id and user_id = auth.uid();
  if w.id is null then
    raise exception 'Wallet not found';
  end if;
  select price into v_price from public.market_prices where symbol = w.symbol;
  asset_amount := p_usd_amount / coalesce(v_price, 1);
  if w.balance < asset_amount then
    raise exception 'Insufficient balance';
  end if;

  update public.wallets
    set balance = balance - asset_amount,
        usd_value = greatest(usd_value - p_usd_amount, 0)
    where id = w.id;

  update public.cards set balance = balance + p_usd_amount
    where id = p_card_id and user_id = auth.uid()
    returning * into c;
  if c.id is null then
    raise exception 'Card not found';
  end if;

  insert into public.transactions (user_id, type, asset, amount, usd_value, status, fee)
  values (auth.uid(), 'send', w.symbol, asset_amount, p_usd_amount, 'completed', 0);

  return c;
end;
$$;

-- ── Admin-only RPCs ────────────────────────────────────────────────────────────

-- Manually log a transaction for a user and keep the matching wallet balance in
-- sync (e.g. recording an off-platform deposit/withdrawal, a support credit).
-- 'swap' isn't accepted here — a manual swap needs an explicit asset pair,
-- which doesn't fit this single-asset ledger entry.
create or replace function public.admin_log_transaction(
  p_user_id uuid, p_type text, p_symbol text, p_amount numeric, p_status text default 'completed'
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price numeric;
  usd_amount numeric;
  w public.wallets;
  tx public.transactions;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;
  if p_type not in ('send', 'receive', 'stake', 'unstake', 'earn') then
    raise exception 'Invalid transaction type';
  end if;
  if p_status not in ('completed', 'pending', 'failed') then
    raise exception 'Invalid status';
  end if;

  select price into v_price from public.market_prices where symbol = p_symbol;
  usd_amount := p_amount * coalesce(v_price, 1);

  w := public._get_or_create_wallet(p_user_id, p_symbol, p_symbol);

  if p_type in ('receive', 'earn', 'unstake') then
    update public.wallets set balance = balance + p_amount, usd_value = usd_value + usd_amount where id = w.id;
  else
    if w.balance < p_amount then
      raise exception 'Insufficient balance for this debit';
    end if;
    update public.wallets set balance = balance - p_amount, usd_value = greatest(usd_value - usd_amount, 0) where id = w.id;
  end if;

  insert into public.transactions (user_id, type, asset, amount, usd_value, status, fee)
  values (p_user_id, p_type, p_symbol, p_amount, usd_amount, p_status, 0)
  returning * into tx;

  return tx;
end;
$$;

-- Hard-delete a user. Runs as the function owner (the role that ran this
-- schema, normally `postgres`), which — unlike `anon`/`authenticated` — has
-- the grants needed to delete from auth.users directly. Everything FK'd to
-- profiles.id (wallets, transactions, stakes, cards) cascades with it.
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Cannot delete your own account';
  end if;
  delete from auth.users where id = p_user_id;
end;
$$;

-- Edit any profile field for any user (name, plan, KYC, 2FA flag, suspension).
-- Pass null for a field to leave it unchanged.
create or replace function public.admin_update_profile(
  p_user_id uuid,
  p_first_name text default null,
  p_last_name text default null,
  p_plan text default null,
  p_kyc_status text default null,
  p_two_fa_enabled boolean default null,
  p_is_suspended boolean default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if p_plan is not null and p_plan not in ('starter', 'pro', 'institutional') then
    raise exception 'Invalid plan';
  end if;
  if p_kyc_status is not null and p_kyc_status not in ('pending', 'verified', 'rejected') then
    raise exception 'Invalid KYC status';
  end if;

  update public.profiles set
    first_name = coalesce(p_first_name, first_name),
    last_name = coalesce(p_last_name, last_name),
    plan = coalesce(p_plan, plan),
    kyc_status = coalesce(p_kyc_status, kyc_status),
    two_fa_enabled = coalesce(p_two_fa_enabled, two_fa_enabled),
    is_suspended = coalesce(p_is_suspended, is_suspended)
  where id = p_user_id
  returning * into p;

  if p.id is null then
    raise exception 'User not found';
  end if;
  return p;
end;
$$;

-- Directly set a wallet's balance/usd_value, for any user's wallet.
create or replace function public.admin_update_wallet(
  p_wallet_id uuid, p_balance numeric, p_usd_value numeric
)
returns public.wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if p_balance is null or p_balance < 0 or p_usd_value is null or p_usd_value < 0 then
    raise exception 'Balance and USD value must be non-negative';
  end if;

  update public.wallets set balance = p_balance, usd_value = p_usd_value
    where id = p_wallet_id
    returning * into w;
  if w.id is null then
    raise exception 'Wallet not found';
  end if;
  return w;
end;
$$;

-- Edit any card field for any user's card (number/cvv/expiry included — see
-- the note above the cards table: this is sandbox-only demo card data).
create or replace function public.admin_update_card(
  p_card_id uuid,
  p_holder_name text default null,
  p_number text default null,
  p_expiry text default null,
  p_cvv text default null,
  p_balance numeric default null,
  p_spent numeric default null,
  p_card_limit numeric default null,
  p_frozen boolean default null
)
returns public.cards
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.cards;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if p_balance is not null and p_balance < 0 then
    raise exception 'Balance must be non-negative';
  end if;
  if p_spent is not null and p_spent < 0 then
    raise exception 'Spent must be non-negative';
  end if;
  if p_card_limit is not null and p_card_limit < 0 then
    raise exception 'Limit must be non-negative';
  end if;

  update public.cards set
    holder_name = coalesce(p_holder_name, holder_name),
    number = coalesce(p_number, number),
    expiry = coalesce(p_expiry, expiry),
    cvv = coalesce(p_cvv, cvv),
    balance = coalesce(p_balance, balance),
    spent = coalesce(p_spent, spent),
    card_limit = coalesce(p_card_limit, card_limit),
    frozen = coalesce(p_frozen, frozen)
  where id = p_card_id
  returning * into c;

  if c.id is null then
    raise exception 'Card not found';
  end if;
  return c;
end;
$$;

-- Delete any user's card outright.
create or replace function public.admin_delete_card(p_card_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  delete from public.cards where id = p_card_id;
end;
$$;

-- Edit an existing transaction record for any user (does not touch wallet
-- balances — use admin_update_wallet separately if the balance should change
-- to match).
create or replace function public.admin_update_transaction(
  p_transaction_id uuid,
  p_type text default null,
  p_asset text default null,
  p_amount numeric default null,
  p_usd_value numeric default null,
  p_status text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  tx public.transactions;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if p_type is not null and p_type not in ('send','receive','swap','stake','unstake','earn') then
    raise exception 'Invalid transaction type';
  end if;
  if p_status is not null and p_status not in ('completed','pending','failed') then
    raise exception 'Invalid status';
  end if;

  update public.transactions set
    type = coalesce(p_type, type),
    asset = coalesce(p_asset, asset),
    amount = coalesce(p_amount, amount),
    usd_value = coalesce(p_usd_value, usd_value),
    status = coalesce(p_status, status)
  where id = p_transaction_id
  returning * into tx;

  if tx.id is null then
    raise exception 'Transaction not found';
  end if;
  return tx;
end;
$$;

-- Delete a transaction record outright (does not touch wallet balances).
create or replace function public.admin_delete_transaction(p_transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  delete from public.transactions where id = p_transaction_id;
end;
$$;

-- Create a new wallet for any user (e.g. onboarding them onto an asset that
-- has no balance yet).
create or replace function public.admin_create_wallet(
  p_user_id uuid, p_chain text, p_symbol text, p_balance numeric default 0, p_usd_value numeric default 0
)
returns public.wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if p_chain is null or p_chain = '' or p_symbol is null or p_symbol = '' then
    raise exception 'Chain and symbol are required';
  end if;
  if coalesce(p_balance, 0) < 0 or coalesce(p_usd_value, 0) < 0 then
    raise exception 'Balance and USD value must be non-negative';
  end if;

  insert into public.wallets (user_id, chain, symbol, address, balance, usd_value)
  values (p_user_id, p_chain, p_symbol, 'internal', coalesce(p_balance, 0), coalesce(p_usd_value, 0))
  returning * into w;

  return w;
end;
$$;

-- Create a new card for any user (sandbox-only demo card data, see the note
-- above the cards table).
create or replace function public.admin_create_card(
  p_user_id uuid, p_type text, p_holder_name text, p_number text, p_expiry text, p_cvv text,
  p_balance numeric default 0, p_spent numeric default 0, p_card_limit numeric default 5000, p_frozen boolean default false
)
returns public.cards
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.cards;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if p_type not in ('virtual', 'physical') then
    raise exception 'Invalid card type';
  end if;
  if p_holder_name is null or p_holder_name = '' or p_number is null or p_number = '' or p_expiry is null or p_expiry = '' or p_cvv is null or p_cvv = '' then
    raise exception 'Holder name, number, expiry and CVV are required';
  end if;
  if coalesce(p_balance, 0) < 0 or coalesce(p_spent, 0) < 0 or coalesce(p_card_limit, 0) < 0 then
    raise exception 'Balance, spent and limit must be non-negative';
  end if;

  insert into public.cards (user_id, type, number, expiry, cvv, holder_name, balance, spent, card_limit, frozen)
  values (p_user_id, p_type, p_number, p_expiry, p_cvv, p_holder_name, coalesce(p_balance, 0), coalesce(p_spent, 0), coalesce(p_card_limit, 5000), coalesce(p_frozen, false))
  returning * into c;

  return c;
end;
$$;

-- Create a raw transaction record for any user without touching wallet
-- balances (use admin_log_transaction instead when the wallet balance should
-- move in lockstep).
create or replace function public.admin_create_transaction(
  p_user_id uuid, p_type text, p_asset text, p_amount numeric, p_usd_value numeric, p_status text default 'completed'
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  tx public.transactions;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
  if p_type not in ('send','receive','swap','stake','unstake','earn') then
    raise exception 'Invalid transaction type';
  end if;
  if p_status not in ('completed','pending','failed') then
    raise exception 'Invalid status';
  end if;
  if p_asset is null or p_asset = '' then
    raise exception 'Asset is required';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  insert into public.transactions (user_id, type, asset, amount, usd_value, status, fee)
  values (p_user_id, p_type, p_asset, p_amount, coalesce(p_usd_value, 0), p_status, 0)
  returning * into tx;

  return tx;
end;
$$;
