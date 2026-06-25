import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { getPortfolio, type PortfolioSnapshot } from '../../../services/portfolio';
import { getMarketPrices, type MarketPrice } from '../../../services/market';
import { CryptoIcon } from '../common/CryptoIcon';

const COIN_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', MATIC: '#8247E5', USDC: '#2775CA',
  BNB: '#F0B90B', USDT: '#26A17B', XRP: '#23292F', ADA: '#0033AD', AVAX: '#E84142',
  DOT: '#E6007A', LINK: '#2A5ADA', UNI: '#FF007A', ATOM: '#2E3148',
};

const RANGE_DAYS: Record<string, number | null> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, ALL: null };
const RANGES = Object.keys(RANGE_DAYS);

type Range = typeof RANGES[number];

export function Portfolio() {
  const { t } = useLang();
  const { user } = useAuth();
  const d = t.dashboard.portfolio;
  const [range, setRange] = useState<Range>('1Y');
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [prices, setPrices] = useState<MarketPrice[]>([]);

  useEffect(() => {
    Promise.all([getPortfolio(user?.id ?? 'guest'), getMarketPrices()]).then(([p, pr]) => {
      setPortfolio(p);
      setPrices(pr);
    });
  }, [user?.id]);

  const totalBalance = portfolio?.totalUsd ?? 0;
  const changePct = portfolio?.change24hPct ?? 0;
  const change24h = totalBalance * (changePct / 100);

  const history = portfolio?.history ?? [];
  const chartData = useMemo(() => {
    const days = RANGE_DAYS[range];
    const sliced = days ? history.slice(-days) : history;
    return sliced.map(h => ({ date: h.date, v: h.value }));
  }, [history, range]);

  const oldestValue = chartData[0]?.v ?? totalBalance;
  const totalPnl = totalBalance - oldestValue;
  const pnlPct = oldestValue > 0 ? (totalPnl / oldestValue) * 100 : 0;

  const assets = useMemo(() => {
    const wallets = portfolio?.wallets ?? [];
    return wallets
      .map(w => {
        const price = prices.find(p => p.symbol === w.symbol);
        return {
          coin: w.symbol,
          name: price?.name ?? w.chain,
          amount: w.balance.toLocaleString('en', { maximumFractionDigits: 6 }),
          usd: w.usdValue,
          change: price?.change24h ?? 0,
          color: COIN_COLORS[w.symbol] ?? price?.color ?? '#00D4FF',
          alloc: totalBalance > 0 ? (w.usdValue / totalBalance) * 100 : 0,
        };
      })
      .sort((a, b) => b.usd - a.usd);
  }, [portfolio, prices, totalBalance]);

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: d.totalBalance,
            value: `$${totalBalance.toLocaleString('en', { minimumFractionDigits: 2 })}`,
            sub: `${change24h >= 0 ? '+' : ''}$${change24h.toLocaleString('en', { minimumFractionDigits: 2 })} today`,
            positive: change24h >= 0,
          },
          {
            label: d.change24h,
            value: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
            sub: `$${change24h.toLocaleString('en', { minimumFractionDigits: 2 })}`,
            positive: changePct >= 0,
          },
          {
            label: d.pnl,
            value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toLocaleString('en', { minimumFractionDigits: 2 })}`,
            sub: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}% all-time`,
            positive: totalPnl >= 0,
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
            <AreaChart data={chartData}>
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
          {assets.length === 0 && (
            <div className="px-5 py-6 text-center" style={{ color: '#5A7A9C', fontSize: 13 }}>No assets yet.</div>
          )}
          <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
            {assets.map((a) => (
              <div key={a.coin} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <CryptoIcon symbol={a.coin} color={a.color} size={36} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>{a.amount} {a.coin}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block">
                    <div className="h-1 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${a.alloc}%`, background: a.color }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#5A7A9C', textAlign: 'right', marginTop: 2 }}>{a.alloc.toFixed(0)}%</div>
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
                <Pie data={assets} dataKey="alloc" nameKey="coin" innerRadius={50} outerRadius={75} paddingAngle={2} stroke="none">
                  {assets.map((a) => <Cell key={`cell-${a.coin}`} fill={a.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {assets.map((a) => (
              <div key={a.coin} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                  <span style={{ fontSize: 12, color: '#8AA8C4' }}>{a.coin}</span>
                </div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#5A7A9C' }}>{a.alloc.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
