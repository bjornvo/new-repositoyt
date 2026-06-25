import { useState, useEffect } from 'react';
import { Layers, TrendingUp, Gift } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getStakes, stakeAsset, unstakeAsset, STAKING_POOLS, type Stake } from '../../../services/staking';
import { getMarketPrices, type MarketPrice } from '../../../services/market';
import { CryptoIcon } from '../common/CryptoIcon';

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
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    Promise.all([getStakes(user?.id ?? 'guest'), getMarketPrices()]).then(([s, p]) => {
      setStakes(s);
      setPrices(p);
      setLoading(false);
    });
  };

  useEffect(refresh, [user?.id]);

  const priceFor = (symbol: string) => prices.find(p => p.symbol === symbol)?.price ?? 1;

  const handleStake = async (poolId: string) => {
    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0) { setError('Enter a valid amount.'); return; }
    setError('');
    setBusyId(poolId);
    try {
      await stakeAsset(user?.id ?? 'guest', poolId, amount);
      setStakeOpen(null);
      setStakeAmount('');
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Staking failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleUnstake = async (stakeId: string) => {
    setBusyId(stakeId);
    try {
      await unstakeAsset(stakeId);
      refresh();
    } finally {
      setBusyId(null);
    }
  };

  const activeStakes = stakes.filter(s => s.status !== 'unstaked');
  const totalStaked = activeStakes.reduce((s, st) => s + st.amount * priceFor(st.asset), 0);
  const totalEarned = activeStakes.reduce((s, st) => s + st.earned * priceFor(st.asset), 0);
  const avgApy = activeStakes.length ? activeStakes.reduce((s, st) => s + st.apy, 0) / activeStakes.length : 0;

  if (loading) {
    return <div style={{ color: '#5A7A9C', fontSize: 13 }}>Loading stakes…</div>;
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: d.staked, value: `$${totalStaked.toLocaleString('en', { maximumFractionDigits: 0 })}`, icon: Layers, color: '#A855F7' },
          { label: d.earned, value: `$${totalEarned.toLocaleString('en', { maximumFractionDigits: 2 })}`, icon: Gift, color: '#00C896' },
          { label: 'Avg ' + d.apy, value: `${avgApy.toFixed(1)}%`, icon: TrendingUp, color: '#F0B429' },
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
          <div style={{ fontSize: 12, color: '#00C896', fontWeight: 600 }}>
            {d.earned}: ${totalEarned.toLocaleString('en', { maximumFractionDigits: 2 })}
          </div>
        </div>
        {activeStakes.length === 0 && (
          <div className="px-5 py-6 text-center" style={{ color: '#5A7A9C', fontSize: 13 }}>No active stakes yet — open one from the pools below.</div>
        )}
        {activeStakes.map((stake, i) => {
          const pool = STAKING_POOLS.find(p => p.asset === stake.asset);
          const usd = stake.amount * priceFor(stake.asset);
          return (
            <div key={stake.id} style={{ borderBottom: i < activeStakes.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none' }}>
              <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <CryptoIcon symbol={stake.asset} color={pool?.color ?? '#00D4FF'} size={36} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{stake.asset}</div>
                    <div style={{ fontSize: 11, color: '#5A7A9C' }}>
                      {stake.lockPeriodDays > 0 ? `${stake.lockPeriodDays}d lock` : 'Flexible'} · {stake.amount.toLocaleString('en', { maximumFractionDigits: 6 })} {stake.asset}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <div style={{ fontSize: 11, color: '#5A7A9C' }}>{d.staked}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>${usd.toLocaleString('en', { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#5A7A9C' }}>Rewards</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: '#00C896' }}>
                      {stake.earned.toLocaleString('en', { maximumFractionDigits: 6 })} {stake.asset}
                    </div>
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize: 11, color: '#5A7A9C' }}>{d.apy}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#F0B429' }}>{stake.apy}%</div>
                  </div>
                  <button
                    onClick={() => handleUnstake(stake.id)}
                    disabled={busyId === stake.id}
                    className="px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,59,92,0.08)', color: '#FF3B5C', fontSize: 12, fontWeight: 600, opacity: busyId === stake.id ? 0.6 : 1 }}
                  >
                    {busyId === stake.id ? '…' : d.unstake}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
          {STAKING_POOLS.map((pool, i) => (
            <div key={pool.id}>
              <div
                className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{ borderBottom: stakeOpen === pool.id || i < STAKING_POOLS.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <CryptoIcon symbol={pool.asset} color={pool.color} size={28} />
                <div className="flex-1">
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{pool.asset} Pool</div>
                  <div style={{ fontSize: 11, color: '#5A7A9C' }}>
                    Min: {pool.minAmount} {pool.asset} · {pool.lockPeriodDays > 0 ? `${pool.lockPeriodDays}d lock` : 'Flexible'}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: '#F0B429', minWidth: 60, textAlign: 'right' }}>
                  {pool.apy}% <span style={{ fontSize: 10, color: '#5A7A9C' }}>APY</span>
                </div>
                <button
                  onClick={() => { setStakeOpen(stakeOpen === pool.id ? null : pool.id); setError(''); }}
                  className="px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: 11, fontWeight: 600 }}
                >
                  {d.stake}
                </button>
              </div>
              {stakeOpen === pool.id && (
                <div className="px-4 py-3 space-y-2" style={{ borderBottom: i < STAKING_POOLS.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none', background: 'rgba(0,212,255,0.02)' }}>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={e => setStakeAmount(e.target.value)}
                      placeholder={`Min ${pool.minAmount} ${pool.asset}`}
                      className="flex-1 px-3 py-2 rounded-lg outline-none"
                      style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                    />
                    <button
                      onClick={() => handleStake(pool.id)}
                      disabled={busyId === pool.id}
                      className="px-4 py-2 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 12, opacity: busyId === pool.id ? 0.7 : 1 }}
                    >
                      {busyId === pool.id ? '…' : 'Confirm'}
                    </button>
                  </div>
                  {error && <p style={{ fontSize: 12, color: '#FF3B5C' }}>{error}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
