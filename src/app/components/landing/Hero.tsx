import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowRight, Play, TrendingUp } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const chartData = [
  { v: 38200 }, { v: 41500 }, { v: 39800 }, { v: 44100 }, { v: 42600 },
  { v: 47300 }, { v: 45800 }, { v: 51200 }, { v: 49700 }, { v: 54600 },
  { v: 52100 }, { v: 58900 }, { v: 56400 }, { v: 62800 }, { v: 61200 },
  { v: 67500 }, { v: 65800 }, { v: 71200 }, { v: 69600 }, { v: 74800 },
];

const STATS = [
  { key: 'stat1', value: '$8.4B' },
  { key: 'stat2', value: '2.4M' },
  { key: 'stat3', value: '147' },
  { key: 'stat4', value: '99.97%' },
];

const FLOATING_COINS = [
  { symbol: 'BTC', price: '$67,842', change: '+2.4%', color: '#F7931A', top: '15%', right: '5%' },
  { symbol: 'ETH', price: '$3,521', change: '+1.8%', color: '#627EEA', top: '40%', right: '2%' },
  { symbol: 'SOL', price: '$182.4', change: '+5.2%', color: '#9945FF', top: '65%', right: '8%' },
];

export function Hero() {
  const { t } = useLang();
  const navigate = useNavigate();
  const onEnterDashboard = () => navigate('/get-started');

  return (
    <section
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
      style={{ background: '#050B14' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,102,255,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center w-full">
        {/* Left content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}
          >
            <div className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
            <span style={{ color: '#00D4FF', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
              {t.hero.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              color: '#E8F0FE',
              whiteSpace: 'pre-line',
            }}
          >
            {t.hero.headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 mb-10"
            style={{ color: '#5A7A9C', fontSize: 18, lineHeight: 1.7, maxWidth: 480 }}
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2 px-7 py-4 rounded-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #00D4FF, #0066FF)',
                color: '#050B14',
                fontSize: 15,
                fontWeight: 700,
                boxShadow: '0 0 40px rgba(0,212,255,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 60px rgba(0,212,255,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.3)'; e.currentTarget.style.transform = 'none'; }}
            >
              {t.hero.cta}
              <ArrowRight size={18} />
            </button>
            <button
              className="flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-200"
              style={{
                color: '#E8F0FE',
                fontSize: 15,
                fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.15)' }}
              >
                <Play size={12} style={{ color: '#00D4FF', marginLeft: 2 }} />
              </div>
              {t.hero.demo}
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {STATS.map((s) => (
              <div key={s.key}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, color: '#00D4FF' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: '#5A7A9C', marginTop: 2 }}>
                  {t.hero[s.key as keyof typeof t.hero]}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — dashboard preview */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative hidden md:block"
        >
          {/* Main card */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'rgba(10, 22, 40, 0.9)',
              border: '1px solid rgba(0,212,255,0.15)',
              boxShadow: '0 0 80px rgba(0,212,255,0.08), 0 40px 80px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ color: '#5A7A9C', fontSize: 12, marginBottom: 4 }}>Portfolio Value</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: '#E8F0FE' }}>
                  $74,832.40
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp size={14} style={{ color: '#00C896' }} />
                  <span style={{ color: '#00C896', fontSize: 13, fontFamily: 'var(--font-mono)' }}>+$2,847.20 (3.96%)</span>
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.2)' }}
              >
                <TrendingUp size={18} style={{ color: '#00C896' }} />
              </div>
            </div>

            <div className="h-40 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Value']}
                  />
                  <Area type="monotone" dataKey="v" stroke="#00D4FF" strokeWidth={2} fill="url(#heroGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Asset list */}
            <div className="mt-4 space-y-2">
              {[
                { coin: 'BTC', name: 'Bitcoin', amount: '0.842', usd: '$57,124', change: '+2.4%', color: '#F7931A' },
                { coin: 'ETH', name: 'Ethereum', amount: '3.21', usd: '$11,302', change: '+1.8%', color: '#627EEA' },
                { coin: 'SOL', name: 'Solana', amount: '34.5', usd: '$6,294', change: '+5.2%', color: '#9945FF' },
              ].map(a => (
                <div key={a.coin} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${a.color}22` }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: a.color }}>{a.coin}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>{a.amount} {a.coin}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', fontFamily: 'var(--font-mono)' }}>{a.usd}</div>
                    <div style={{ fontSize: 11, color: '#00C896', fontFamily: 'var(--font-mono)' }}>{a.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating coin cards */}
          {FLOATING_COINS.map((coin, i) => (
            <motion.div
              key={coin.symbol}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="absolute px-3 py-2 rounded-xl"
              style={{
                top: coin.top,
                right: coin.right,
                background: 'rgba(10,22,40,0.95)',
                border: '1px solid rgba(0,212,255,0.12)',
                transform: 'translateX(70px)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full" style={{ background: coin.color + '33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: coin.color }}>{coin.symbol[0]}</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: '#E8F0FE' }}>{coin.price}</div>
                  <div style={{ fontSize: 10, color: '#00C896' }}>{coin.change}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #050B14, transparent)' }}
      />
    </section>
  );
}
