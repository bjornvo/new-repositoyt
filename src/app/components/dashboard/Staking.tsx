import { useState, useEffect } from 'react';
import { Layers, TrendingUp, Gift } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getStakes, stakeAsset, STAKING_POOLS, type Stake } from '../../../services/staking';

const POOLS = [
  { coin: 'ETH', name: 'Ethereum 2.0', color: '#627EEA', staked: '2.000', usd: '$7,042', rewards: '0.0821 ETH', rewardUsd: '$289', apy: 4.8, lockup: 'Flexible', icon: 'E' },
  { coin: 'SOL', name: 'Solana', color: '#9945FF', staked: '20.00', usd: '$3,648', rewards: '1.420 SOL', rewardUsd: '$259', apy: 7.2, lockup: 'Flexible', icon: 'S' },
  { coin: 'BNB', name: 'BNB Chain', color: '#F0B90B', staked: '5.000', usd: '$3,062', rewards: '0.210 BNB', rewardUsd: '$129', apy: 4.1, lockup: 'Flexible', icon: 'B' },
  { coin: 'USDT', name: 'Tether Yield', color: '#26A17B', staked: '3000.00', usd: '$3,000', rewards: '142.50 USDT', rewardUsd: '$143', apy: 8.5, lockup: '30 days', icon: 'U' },
];

const AVAILABLE_POOLS = [
  { coin: 'BTC', name: 'Bitcoin Lending', apy: 3.2, minStake: '0.01 BTC', color: '#F7931A', lockup: 'Flexible' },
  { coin: 'USDC', name: 'USDC Savings', apy: 9.1, minStake: '100 USDC', color: '#2775CA', lockup: '7 days' },
  { coin: 'ETH', name: 'Liquid Staking', apy: 5.4, minStake: '0.1 ETH', color: '#627EEA', lockup: 'Flexible' },
  { coin: 'AVAX', name: 'Avalanche', apy: 11.2, minStake: '1 AVAX', color: '#E84142', lockup: '14 days' },
  { coin: 'DOT', name: 'Polkadot', apy: 14.8, minStake: '10 DOT', color: '#E6007A', lockup: '28 days' },
  { coin: 'MATIC', name: 'Polygon', apy: 6.7, minStake: '1 MATIC', color: '#8247E5', lockup: 'Flexible' },
];

const rewardsChart = [
  { month: 'Jan', earn: 120 }, { month: 'Feb', earn: 145 }, { month: 'Mar', earn: 189 },
  { month: 'Apr', earn: 210 }, { month: 'May', earn: 195 }, { month: 'Jun', earn: 248 },
];

export function Staking() {
  const { t } = useLang();
  const { user } = useAuth();
  const d = t.dashboard.staking;
  const [stakeOpen, setStakeOpen] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakes, setStakes] = useState<Stake[]>([]);

  useEffect(() => {
    getStakes(user?.id ?? 'guest').then(setStakes);
  }, [user?.id]);

  const handleStake = async (poolId: string) => {
    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0) return;
    await stakeAsset(user?.id ?? 'guest', poolId, amount);
    const updated = await getStakes(user?.id ?? 'guest');
    setStakes(updated);
    setStakeOpen(null);
    setStakeAmount('');
  };

  const totalStaked = stakes.reduce((s, st) => s + st.amount * 100, 0) || 16752;
  const totalEarned = stakes.reduce((s, st) => s + st.earned * 100, 0) || 820;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: d.staked, value: `$${totalStaked.toLocaleString()}`, icon: Layers, color: '#A855F7' },
          { label: d.earned, value: `$${totalEarned.toLocaleString()}`, icon: Gift, color: '#00C896' },
          { label: 'Avg ' + d.apy, value: '6.1%', icon: TrendingUp, color: '#F0B429' },
        ].map((card, i) => (
          <div key={i} className="p-4 rounded-2xl flex items-center gap-4" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.color + '15' }}>
              <card.icon size={18} style={{ color: card.color }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#5A7A9C', marginBottom: 2 }}>{card.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: '#E8F0FE' }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active stakes */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>Active Stakes</div>
          <button
            className="px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,200,150,0.1)', color: '#00C896', fontSize: 12, fontWeight: 600, border: '1px solid rgba(0,200,150,0.2)' }}
          >
            {d.claimAll} — $820.00
          </button>
        </div>
        {POOLS.map((pool, i) => (
          <div key={pool.coin} style={{ borderBottom: i < POOLS.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none' }}>
            <div className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: pool.color + '22' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: pool.color }}>{pool.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{pool.name}</div>
                  <div style={{ fontSize: 11, color: '#5A7A9C' }}>{pool.lockup} · {pool.staked} {pool.coin}</div>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <div style={{ fontSize: 11, color: '#5A7A9C' }}>{d.staked}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{pool.usd}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#5A7A9C' }}>Rewards</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: '#00C896' }}>{pool.rewardUsd}</div>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: 11, color: '#5A7A9C' }}>{d.apy}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#F0B429' }}>{pool.apy}%</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: 12, fontWeight: 600 }}>
                    {d.stake}
                  </button>
                  <button className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,59,92,0.08)', color: '#FF3B5C', fontSize: 12, fontWeight: 600 }}>
                    {d.unstake}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rewards chart + available pools */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 p-4 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 12 }}>Monthly Rewards</div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rewardsChart}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5A7A9C' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`$${v}`, 'Earned']} />
                <Bar dataKey="earn" name="earnings" fill="#00D4FF" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Available pools */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)', fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>
            Available Pools
          </div>
          {AVAILABLE_POOLS.map((pool, i) => (
            <div
              key={pool.coin + i}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors"
              style={{ borderBottom: i < AVAILABLE_POOLS.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: pool.color + '22' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: pool.color }}>{pool.coin[0]}</span>
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{pool.name}</div>
                <div style={{ fontSize: 11, color: '#5A7A9C' }}>Min: {pool.minStake} · {pool.lockup}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: '#F0B429', minWidth: 60, textAlign: 'right' }}>
                {pool.apy}% <span style={{ fontSize: 10, color: '#5A7A9C' }}>APY</span>
              </div>
              <button
                className="px-3 py-1 rounded-lg"
                style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: 11, fontWeight: 600 }}
              >
                {d.stake}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
