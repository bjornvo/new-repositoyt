import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Stake {
  id: string;
  asset: string;
  amount: number;
  apy: number;
  earned: number;
  status: 'active' | 'unlocking' | 'unstaked';
  lockPeriodDays: number;
  startedAt: string;
  unlockAt: string | null;
}

export interface StakingPool {
  id: string;
  asset: string;
  apy: number;
  minAmount: number;
  lockPeriodDays: number;
  totalStaked: number;
  color: string;
}

const MOCK_STAKES: Stake[] = [
  { id: 's1', asset: 'ETH', amount: 2.0, apy: 4.2, earned: 0.021, status: 'active', lockPeriodDays: 30, startedAt: '2026-05-10', unlockAt: '2026-06-10' },
  { id: 's2', asset: 'SOL', amount: 20, apy: 6.8, earned: 0.38, status: 'active', lockPeriodDays: 14, startedAt: '2026-05-27', unlockAt: '2026-06-10' },
  { id: 's3', asset: 'MATIC', amount: 5000, apy: 5.1, earned: 7.12, status: 'unlocking', lockPeriodDays: 0, startedAt: '2026-04-01', unlockAt: '2026-06-11' },
];

export const STAKING_POOLS: StakingPool[] = [
  { id: 'p1', asset: 'ETH', apy: 4.2, minAmount: 0.1, lockPeriodDays: 30, totalStaked: 48200, color: '#627EEA' },
  { id: 'p2', asset: 'SOL', apy: 6.8, minAmount: 1, lockPeriodDays: 14, totalStaked: 125000, color: '#9945FF' },
  { id: 'p3', asset: 'BTC', apy: 2.1, minAmount: 0.01, lockPeriodDays: 90, totalStaked: 8400, color: '#F7931A' },
  { id: 'p4', asset: 'MATIC', apy: 5.1, minAmount: 100, lockPeriodDays: 0, totalStaked: 2100000, color: '#8247E5' },
  { id: 'p5', asset: 'USDC', apy: 8.5, minAmount: 100, lockPeriodDays: 7, totalStaked: 5800000, color: '#2775CA' },
];

export async function getStakes(userId: string): Promise<Stake[]> {
  if (!isSupabaseConfigured || !supabase) return MOCK_STAKES;

  const { data, error } = await supabase.from('stakes').select('*').eq('user_id', userId).neq('status', 'unstaked');
  if (error) throw new Error(error.message);

  return (data ?? []).map(r => ({
    id: r.id, asset: r.asset, amount: r.amount, apy: r.apy, earned: r.earned,
    status: r.status, lockPeriodDays: r.lock_period_days,
    startedAt: r.started_at, unlockAt: r.unlock_at,
  }));
}

export async function stakeAsset(userId: string, poolId: string, amount: number): Promise<Stake> {
  const pool = STAKING_POOLS.find(p => p.id === poolId);
  if (!pool) throw new Error('Pool not found');

  if (!isSupabaseConfigured || !supabase) {
    const stake: Stake = {
      id: `s${Date.now()}`, asset: pool.asset, amount, apy: pool.apy, earned: 0,
      status: 'active', lockPeriodDays: pool.lockPeriodDays,
      startedAt: new Date().toISOString().slice(0, 10),
      unlockAt: pool.lockPeriodDays > 0
        ? new Date(Date.now() + pool.lockPeriodDays * 86400000).toISOString().slice(0, 10)
        : null,
    };
    MOCK_STAKES.push(stake);
    return stake;
  }

  const unlockAt = pool.lockPeriodDays > 0
    ? new Date(Date.now() + pool.lockPeriodDays * 86400000).toISOString()
    : null;

  const { data, error } = await supabase.from('stakes').insert({
    user_id: userId, asset: pool.asset, amount, apy: pool.apy, earned: 0,
    status: 'active', lock_period_days: pool.lockPeriodDays,
    started_at: new Date().toISOString(), unlock_at: unlockAt,
  }).select().single();
  if (error) throw new Error(error.message);

  return { id: data.id, asset: data.asset, amount: data.amount, apy: data.apy, earned: data.earned,
    status: data.status, lockPeriodDays: data.lock_period_days, startedAt: data.started_at, unlockAt: data.unlock_at };
}
