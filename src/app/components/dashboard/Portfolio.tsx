import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { getPortfolio, type PortfolioSnapshot } from '../../../services/portfolio';

const portfolioHistory = [
  { date: 'Jan', v: 42000 }, { date: 'Feb', v: 38500 }, { date: 'Mar', v: 51000 },
  { date: 'Apr', v: 47200 }, { date: 'May', v: 58400 }, { date: 'Jun', v: 54100 },
  { date: 'Jul', v: 63800 }, { date: 'Aug', v: 61200 }, { date: 'Sep', v: 71500 },
  { date: 'Oct', v: 68900 }, { date: 'Nov', v: 78300 }, { date: 'Dec', v: 74832 },
];

const ASSETS = [
  { coin: 'BTC', name: 'Bitcoin', amount: '0.8420', usd: 57124, change: 2.43, color: '#F7931A', alloc: 36 },
  { coin: 'ETH', name: 'Ethereum', amount: '3.210', usd: 11302, change: 1.82, color: '#627EEA', alloc: 23 },
  { coin: 'SOL', name: 'Solana', amount: '34.50', usd: 6294, change: 5.21, color: '#9945FF', alloc: 15 },
  { coin: 'USDT', name: 'Tether USD', amount: '5000.00', usd: 5000, change: 0.01, color: '#26A17B', alloc: 12 },
  { coin: 'BNB', name: 'BNB Chain', amount: '8.400', usd: 5143, change: -0.87, color: '#F0B90B', alloc: 8 },
  { coin: 'Other', name: 'Other Assets', amount: '—', usd: 2969, change: 1.44, color: '#5A7A9C', alloc: 6 },
];

const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

type Range = typeof RANGES[number];

export function Portfolio() {
  const { t } = useLang();
  const { user } = useAuth();
  const d = t.dashboard.portfolio;
  const [range, setRange] = useState<Range>('1Y');
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);

  useEffect(() => {
    getPortfolio(user?.id ?? 'guest').then(setPortfolio);
  }, [user?.id]);

  // The asset list + chart below are a hardcoded showcase. Derive the header
  // total from the same assets so the screen is always coherent (no $0 / no
  // mismatch with the list). If real wallet data is present (totalUsd > 0),
  // prefer it.
  const assetsTotal = ASSETS.reduce((sum, a) => sum + a.usd, 0);
  const hasRealData = !!(portfolio && portfolio.totalUsd > 0);
  const totalBalance = hasRealData ? portfolio!.totalUsd : assetsTotal;
  const changePct = portfolio?.change24hPct ?? 3.96;
  const change24h = totalBalance * (changePct / 100);
  const totalPnl = totalBalance * 0.433;
  const pnlPct = 76.28;

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: d.totalBalance,
            value: `$${totalBalance.toLocaleString('en', { minimumFractionDigits: 2 })}`,
            sub: `${change24h >= 0 ? '+' : ''}$${change24h.toLocaleString('en', { minimumFractionDigits: 2 })} today`,
            positive: true,
          },
          {
            label: d.change24h,
            value: `+${changePct}%`,
            sub: `$${change24h.toLocaleString('en', { minimumFractionDigits: 2 })}`,
            positive: true,
          },
          {
            label: d.pnl,
            value: `+$${totalPnl.toLocaleString('en', { minimumFractionDigits: 2 })}`,
            sub: `+${pnlPct}% all-time`,
            positive: true,
          },
        ].map((card, i) => (
          <div key={i} className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div style={{ fontSize: 12, color: '#5A7A9C', marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: '#E8F0FE' }}>{card.value}</div>
            <div className="flex items-center gap-1.5 mt-1">
              {card.positive ? <TrendingUp size={13} style={{ color: '#00C896' }} /> : <TrendingDown size={13} style={{ color: '#FF3B5C' }} />}
              <span style={{ fontSize: 12, color: card.positive ? '#00C896' : '#FF3B5C', fontFamily: 'var(--font-mono)' }}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>Portfolio Performance</div>
            <div style={{ fontSize: 12, color: '#5A7A9C' }}>2025 — 2026</div>
          </div>
          <div className="flex gap-1">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-2.5 py-1 rounded-lg transition-all duration-150"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  background: range === r ? 'rgba(0,212,255,0.15)' : 'transparent',
                  color: range === r ? '#00D4FF' : '#5A7A9C',
                  border: range === r ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5A7A9C', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5A7A9C', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, fontSize: 12 }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'Portfolio']}
              />
              <Area type="monotone" dataKey="v" name="portfolio" stroke="#00D4FF" strokeWidth={2} fill="url(#portGrad)" dot={false} activeDot={{ r: 4, fill: '#00D4FF' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assets + Allocation */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Asset list */}
        <div className="lg:col-span-2 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{d.assets}</div>
          </div>
          <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
            {ASSETS.map((a) => (
              <div key={a.coin} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: a.color + '1A' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: a.color }}>{a.coin.slice(0, 3)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>{a.amount !== '—' ? `${a.amount} ${a.coin}` : a.coin}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block">
                    <div className="h-1 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${a.alloc}%`, background: a.color }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#5A7A9C', textAlign: 'right', marginTop: 2 }}>{a.alloc}%</div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE', fontFamily: 'var(--font-mono)' }}>
                      ${a.usd.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: a.change >= 0 ? '#00C896' : '#FF3B5C' }}>
                      {a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation donut */}
        <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE', marginBottom: 12 }}>{d.allocation}</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ASSETS} dataKey="alloc" nameKey="coin" innerRadius={50} outerRadius={75} paddingAngle={2} stroke="none">
                  {ASSETS.map((a) => <Cell key={`cell-${a.coin}`} fill={a.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, name: string) => [`${v}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {ASSETS.map((a) => (
              <div key={a.coin} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                  <span style={{ fontSize: 12, color: '#8AA8C4' }}>{a.coin}</span>
                </div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#5A7A9C' }}>{a.alloc}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
