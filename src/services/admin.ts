import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  kycStatus: string;
  createdAt: string;
  walletCount: number;
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
  kycStatus: ['verified', 'verified', 'pending', 'verified'][i % 4],
  createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  walletCount: 2 + (i % 4),
}));

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured || !supabase) return MOCK_STATS;

  const [{ count: totalUsers }, { count: totalTx }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('transactions').select('*', { count: 'exact', head: true }),
  ]);

  return {
    ...MOCK_STATS,
    totalUsers: totalUsers ?? MOCK_STATS.totalUsers,
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

  const users: AdminUser[] = (data ?? []).map(r => ({
    id: r.id, email: r.email, firstName: r.first_name ?? '', lastName: r.last_name ?? '',
    plan: r.plan, kycStatus: r.kyc_status, createdAt: r.created_at, walletCount: 0,
  }));

  return { users, total: count ?? 0 };
}
