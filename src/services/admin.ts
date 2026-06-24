import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalVolume: number;
  totalStaked: number;
  revenue: number;
  newUsersToday: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  createdAt: string;
  walletCount: number;
  balanceUsd: number;
  isSuspended: boolean;
}

export interface PlatformSettings {
  spotFeePct: number;
  withdrawalFeePct: number;
  stakingFeePct: number;
  dailyWithdrawLimit: number;
  kycLevel1Limit: number;
  kycLevel2Limit: number;
}

export interface AdminTransaction {
  id: string;
  userLabel: string;
  type: string;
  asset: string;
  amountUsd: number;
  fee: number;
  status: string;
  createdAt: string;
  flagged: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'maintenance';
  active: boolean;
  createdAt: string;
}

const MOCK_STATS: AdminStats = {
  totalUsers: 24831,
  activeUsers: 8421,
  totalVolume: 8_420_000_000,
  totalStaked: 234_000_000,
  revenue: 1_240_000,
  newUsersToday: 142,
};

const MOCK_USERS: AdminUser[] = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i + 1}`,
  email: `user${i + 1}@example.com`,
  firstName: ['Alex', 'Maria', 'James', 'Sofia', 'Liu', 'Arjun', 'Emma', 'Noah'][i % 8],
  lastName: ['Smith', 'Chen', 'Patel', 'Kim', 'Müller', 'Santos', 'Ivanov', 'Brown'][i % 8],
  plan: ['starter', 'pro', 'institutional'][i % 3],
  kycStatus: (['verified', 'verified', 'pending', 'verified'] as const)[i % 4],
  createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  walletCount: 2 + (i % 4),
  balanceUsd: 1000 + i * 4271.5,
  isSuspended: i === 5,
}));

const MOCK_SETTINGS: PlatformSettings = {
  spotFeePct: 0.30, withdrawalFeePct: 0.50, stakingFeePct: 0.00,
  dailyWithdrawLimit: 500000, kycLevel1Limit: 10000, kycLevel2Limit: 1000000,
};

let _mockAnnouncements: Announcement[] = [
  { id: 'a1', title: 'Scheduled Maintenance', body: 'Card processing will be unavailable Jun 15 02:00–04:00 UTC.', active: true, type: 'maintenance', createdAt: new Date().toISOString() },
  { id: 'a2', title: 'New Feature: SOL Staking', body: 'Solana liquid staking now available with 7.2% APY.', active: false, type: 'info', createdAt: new Date().toISOString() },
];

/** Whether the currently signed-in user has admin privileges (checked server-side via RLS-safe RPC). */
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return Boolean(data);
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured || !supabase) return MOCK_STATS;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { data: volumeRows },
    { data: stakeRows },
    { data: feeRows },
    { count: newUsersToday },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('transactions').select('usd_value'),
    supabase.from('stakes').select('amount, asset').neq('status', 'unstaked'),
    supabase.from('transactions').select('fee'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
  ]);

  const totalVolume = (volumeRows ?? []).reduce((s, r) => s + Number(r.usd_value), 0);
  const totalStaked = (stakeRows ?? []).reduce((s, r) => s + Number(r.amount), 0);
  // `fee` is recorded in USD by the send_funds/swap_assets/create_stake RPCs.
  const revenue = (feeRows ?? []).reduce((s, r) => s + Number(r.fee), 0);

  return {
    ...MOCK_STATS,
    totalUsers: totalUsers ?? MOCK_STATS.totalUsers,
    totalVolume: totalVolume || MOCK_STATS.totalVolume,
    totalStaked: totalStaked || MOCK_STATS.totalStaked,
    revenue: revenue || MOCK_STATS.revenue,
    newUsersToday: newUsersToday ?? MOCK_STATS.newUsersToday,
  };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Set a user's KYC status. Writes to profiles.kyc_status when Supabase is
 * configured; no-op (resolves) in mock mode so the UI stays in charge of state.
 */
export async function updateKycStatus(
  userId: string,
  status: 'verified' | 'pending' | 'rejected',
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(300);
    return;
  }
  const { error } = await supabase
    .from('profiles')
    .update({ kyc_status: status })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

/**
 * Set a user's total USD balance to `newUsdValue`. Because real balance is the
 * sum of the user's wallets, we collapse it onto a single admin-managed
 * adjustment wallet (chain/symbol = "ADMIN"/"USD") and zero the rest so the
 * aggregate matches exactly. Mock mode just resolves.
 */
export async function adjustUserBalance(userId: string, newUsdValue: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(300);
    return;
  }
  if (!Number.isFinite(newUsdValue) || newUsdValue < 0) {
    throw new Error('Balance must be a non-negative number');
  }

  // Look for an existing admin-adjustment wallet.
  const { data: existing, error: selErr } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', userId)
    .eq('chain', 'ADMIN')
    .eq('symbol', 'USD')
    .limit(1)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);

  // Zero out all other wallets so the summed balance equals the target.
  const { error: zeroErr } = await supabase
    .from('wallets')
    .update({ usd_value: 0 })
    .eq('user_id', userId)
    .neq('chain', 'ADMIN');
  if (zeroErr) throw new Error(zeroErr.message);

  if (existing?.id) {
    const { error } = await supabase
      .from('wallets')
      .update({ usd_value: newUsdValue, balance: newUsdValue })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('wallets').insert({
      user_id: userId,
      chain: 'ADMIN',
      symbol: 'USD',
      address: 'admin-adjustment',
      balance: newUsdValue,
      usd_value: newUsdValue,
    });
    if (error) throw new Error(error.message);
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getAdminUsers(page = 0, pageSize = 20): Promise<{ users: AdminUser[]; total: number }> {
  if (!isSupabaseConfigured || !supabase) {
    return { users: MOCK_USERS.slice(page * pageSize, (page + 1) * pageSize), total: MOCK_USERS.length };
  }

  const from = page * pageSize;
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .range(from, from + pageSize - 1)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const ids = (data ?? []).map(r => r.id);
  const { data: walletRows } = ids.length
    ? await supabase.from('wallets').select('user_id, usd_value').in('user_id', ids)
    : { data: [] as { user_id: string; usd_value: number }[] };

  const balanceByUser = new Map<string, { sum: number; count: number }>();
  for (const w of walletRows ?? []) {
    const entry = balanceByUser.get(w.user_id) ?? { sum: 0, count: 0 };
    entry.sum += Number(w.usd_value);
    entry.count += 1;
    balanceByUser.set(w.user_id, entry);
  }

  const users: AdminUser[] = (data ?? []).map(r => ({
    id: r.id, email: r.email, firstName: r.first_name ?? '', lastName: r.last_name ?? '',
    plan: r.plan, kycStatus: r.kyc_status, createdAt: r.created_at,
    walletCount: balanceByUser.get(r.id)?.count ?? 0,
    balanceUsd: balanceByUser.get(r.id)?.sum ?? 0,
    isSuspended: r.is_suspended,
  }));

  return { users, total: count ?? 0 };
}

const MOCK_TRANSACTIONS_ADMIN: AdminTransaction[] = [
  { id: 'TX001', userLabel: 'Alex Volkov', type: 'swap', asset: 'ETH → BTC', amountUsd: 5282, fee: 15.85, status: 'completed', createdAt: new Date().toISOString(), flagged: false },
  { id: 'TX002', userLabel: 'Marcus Weber', type: 'send', asset: 'USDT', amountUsd: 250000, fee: 0, status: 'pending', createdAt: new Date().toISOString(), flagged: true },
  { id: 'TX003', userLabel: 'Sarah Chen', type: 'receive', asset: 'BTC', amountUsd: 48200, fee: 0, status: 'completed', createdAt: new Date().toISOString(), flagged: false },
  { id: 'TX004', userLabel: 'Priya Nair', type: 'stake', asset: 'ETH', amountUsd: 7042, fee: 0, status: 'completed', createdAt: new Date().toISOString(), flagged: false },
];

/** Large transactions (≥ $100k) are surfaced with a flag so admins can review them first. */
const FLAG_THRESHOLD_USD = 100_000;

export async function getAdminTransactions(limit = 50): Promise<AdminTransaction[]> {
  if (!isSupabaseConfigured || !supabase) return MOCK_TRANSACTIONS_ADMIN;

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const userIds = Array.from(new Set((data ?? []).map(r => r.user_id)));
  const { data: profileRows } = userIds.length
    ? await supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds)
    : { data: [] as { id: string; first_name: string | null; last_name: string | null; email: string }[] };
  const nameById = new Map((profileRows ?? []).map(p => [p.id, `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email]));

  return (data ?? []).map(r => ({
    id: r.id,
    userLabel: nameById.get(r.user_id) ?? 'Unknown',
    type: r.type,
    asset: r.asset,
    amountUsd: Number(r.usd_value),
    fee: Number(r.fee),
    status: r.status,
    createdAt: r.created_at,
    flagged: Number(r.usd_value) >= FLAG_THRESHOLD_USD,
  }));
}

export async function toggleUserSuspension(userId: string, suspended: boolean): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const u = MOCK_USERS.find(u => u.id === userId);
    if (u) u.isSuspended = suspended;
    return;
  }
  const { error } = await supabase.from('profiles').update({ is_suspended: suspended }).eq('id', userId);
  if (error) throw new Error(error.message);
}

// ── Platform settings ─────────────────────────────────────────────────────────

export async function getPlatformSettings(): Promise<PlatformSettings> {
  if (!isSupabaseConfigured || !supabase) return MOCK_SETTINGS;

  const { data, error } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
  if (error) throw new Error(error.message);

  return {
    spotFeePct: data.spot_fee_pct,
    withdrawalFeePct: data.withdrawal_fee_pct,
    stakingFeePct: data.staking_fee_pct,
    dailyWithdrawLimit: data.daily_withdraw_limit,
    kycLevel1Limit: data.kyc_level1_limit,
    kycLevel2Limit: data.kyc_level2_limit,
  };
}

export async function updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    Object.assign(MOCK_SETTINGS, updates);
    return;
  }

  const { error } = await supabase.from('admin_settings').update({
    spot_fee_pct: updates.spotFeePct,
    withdrawal_fee_pct: updates.withdrawalFeePct,
    staking_fee_pct: updates.stakingFeePct,
    daily_withdraw_limit: updates.dailyWithdrawLimit,
    kyc_level1_limit: updates.kycLevel1Limit,
    kyc_level2_limit: updates.kycLevel2Limit,
  }).eq('id', 1);
  if (error) throw new Error(error.message);
}

// ── Announcements ─────────────────────────────────────────────────────────────

export async function getAnnouncements(activeOnly = false): Promise<Announcement[]> {
  if (!isSupabaseConfigured || !supabase) {
    return activeOnly ? _mockAnnouncements.filter(a => a.active) : _mockAnnouncements;
  }

  let query = supabase.from('announcements').select('*').order('created_at', { ascending: false });
  if (activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map(r => ({ id: r.id, title: r.title, body: r.body, type: r.type, active: r.active, createdAt: r.created_at }));
}

export async function createAnnouncement(userId: string, ann: { title: string; body: string; type: Announcement['type'] }): Promise<Announcement> {
  if (!isSupabaseConfigured || !supabase) {
    const created: Announcement = { id: `a${Date.now()}`, ...ann, active: true, createdAt: new Date().toISOString() };
    _mockAnnouncements = [created, ..._mockAnnouncements];
    return created;
  }

  const { data, error } = await supabase.from('announcements').insert({
    title: ann.title, body: ann.body, type: ann.type, active: true, created_by: userId,
  }).select().single();
  if (error) throw new Error(error.message);

  return { id: data.id, title: data.title, body: data.body, type: data.type, active: data.active, createdAt: data.created_at };
}

export async function toggleAnnouncement(id: string, active: boolean): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const ann = _mockAnnouncements.find(a => a.id === id);
    if (ann) ann.active = active;
    return;
  }
  const { error } = await supabase.from('announcements').update({ active }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    _mockAnnouncements = _mockAnnouncements.filter(a => a.id !== id);
    return;
  }
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── User management ───────────────────────────────────────────────────────────

/**
 * Creates a new user account. Goes through the standard signUp flow, but on a
 * throwaway Supabase client (no persisted session) so the *admin's* own login
 * session in this tab isn't replaced by the new user's session — there is no
 * admin "create user" API available without a service-role key on a server,
 * which this client-only app intentionally never holds.
 */
export async function createUser(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  plan: 'starter' | 'pro' | 'institutional';
}): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    MOCK_USERS.unshift({
      id: `user-${Date.now()}`, email: params.email, firstName: params.firstName, lastName: params.lastName,
      plan: params.plan, kycStatus: 'pending', createdAt: new Date().toISOString(), walletCount: 0, balanceUsd: 0, isSuspended: false,
    });
    return;
  }

  const throwawayClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await throwawayClient.auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: { first_name: params.firstName, last_name: params.lastName } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('User creation failed');

  // `on_auth_user_created` already inserted the profile row; this just sets the plan.
  const { error: profileError } = await supabase.from('profiles').update({ plan: params.plan }).eq('id', data.user.id);
  if (profileError) throw new Error(profileError.message);
}

export async function deleteUser(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const idx = MOCK_USERS.findIndex(u => u.id === userId);
    if (idx >= 0) MOCK_USERS.splice(idx, 1);
    return;
  }
  const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
  if (error) throw new Error(error.message);
}

/** Manually logs a transaction for a user and keeps their matching wallet balance in sync. */
export async function logManualTransaction(
  userId: string,
  params: { type: 'send' | 'receive' | 'stake' | 'unstake' | 'earn'; symbol: string; amount: number; status?: 'completed' | 'pending' | 'failed' },
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(300);
    return;
  }
  const { error } = await supabase.rpc('admin_log_transaction', {
    p_user_id: userId,
    p_type: params.type,
    p_symbol: params.symbol,
    p_amount: params.amount,
    p_status: params.status ?? 'completed',
  });
  if (error) throw new Error(error.message);
}
