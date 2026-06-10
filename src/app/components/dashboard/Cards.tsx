import { useState } from 'react';
import { Snowflake, Plus, Eye, EyeOff, Wifi } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

const CARD_TRANSACTIONS = [
  { merchant: 'Apple Store', amount: '-$129.00', date: 'Jun 10', category: 'Tech' },
  { merchant: 'Uber', amount: '-$24.50', date: 'Jun 9', category: 'Transport' },
  { merchant: 'Whole Foods', amount: '-$87.30', date: 'Jun 9', category: 'Food' },
  { merchant: 'Netflix', amount: '-$15.99', date: 'Jun 8', category: 'Entertainment' },
  { merchant: 'Shell Gas', amount: '-$52.40', date: 'Jun 7', category: 'Transport' },
];

export function Cards() {
  const { t } = useLang();
  const d = t.dashboard.cards;
  const [showNumber, setShowNumber] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  const cards = [
    {
      type: 'virtual' as const,
      label: d.virtualCard,
      number: '4242 4242 4242 4242',
      expiry: '12/28',
      cvv: '342',
      holder: 'ALEX VOLKOV',
      balance: 2847.50,
      spent: 1834.20,
      limit: 5000,
      gradient: 'linear-gradient(135deg, #0066FF 0%, #00D4FF 100%)',
    },
    {
      type: 'physical' as const,
      label: d.physicalCard,
      number: '5189 3847 2910 4857',
      expiry: '09/29',
      cvv: '891',
      holder: 'ALEX VOLKOV',
      balance: 1200.00,
      spent: 643.70,
      limit: 3000,
      gradient: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    },
  ];

  const card = cards[activeCard];

  return (
    <div className="space-y-5">
      {/* Card selector */}
      <div className="flex gap-3">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={() => setActiveCard(i)}
            className="px-4 py-2 rounded-xl transition-all duration-150"
            style={{
              background: activeCard === i ? 'rgba(0,212,255,0.1)' : '#0A1628',
              border: `1px solid ${activeCard === i ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.08)'}`,
              color: activeCard === i ? '#00D4FF' : '#5A7A9C',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {c.label}
          </button>
        ))}
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
          style={{ background: '#0A1628', border: '1px dashed rgba(0,212,255,0.2)', color: '#5A7A9C', fontSize: 13 }}
        >
          <Plus size={14} /> Order Card
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Card visual + controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card */}
          <div
            className="relative rounded-2xl p-5 overflow-hidden"
            style={{
              background: card.gradient,
              aspectRatio: '1.586',
              filter: frozen ? 'grayscale(0.5) brightness(0.7)' : 'none',
              transition: 'filter 0.4s ease',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-30" style={{ background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

            {frozen && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,20,40,0.6)', backdropFilter: 'blur(2px)' }}>
                <div className="flex flex-col items-center gap-2">
                  <Snowflake size={32} style={{ color: '#00D4FF' }} />
                  <span style={{ color: '#E8F0FE', fontSize: 13, fontWeight: 700 }}>Card Frozen</span>
                </div>
              </div>
            )}

            <div className="relative flex flex-col h-full justify-between">
              <div className="flex items-start justify-between">
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#fff' }}>
                  Nova<span style={{ opacity: 0.7 }}>Crypt</span>
                </span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <Wifi size={18} style={{ color: 'rgba(255,255,255,0.7)', transform: 'rotate(90deg)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>VISA</span>
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#fff', letterSpacing: 2, marginBottom: 12 }}>
                  {showNumber ? card.number : '•••• •••• •••• ' + card.number.slice(-4)}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Card Holder</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', fontWeight: 600 }}>{card.holder}</div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Expires</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff' }}>{card.expiry}</div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>CVV</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff' }}>{showNumber ? card.cvv : '•••'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowNumber(!showNumber)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200"
              style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#5A7A9C', fontSize: 13 }}
            >
              {showNumber ? <EyeOff size={14} /> : <Eye size={14} />}
              {showNumber ? 'Hide Details' : 'Show Details'}
            </button>
            <button
              onClick={() => setFrozen(!frozen)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: frozen ? 'rgba(0,212,255,0.1)' : '#0A1628',
                border: `1px solid ${frozen ? 'rgba(0,212,255,0.3)' : 'rgba(255,59,92,0.2)'}`,
                color: frozen ? '#00D4FF' : '#FF3B5C',
                fontSize: 13,
              }}
            >
              <Snowflake size={14} />
              {frozen ? 'Unfreeze' : d.freeze}
            </button>
          </div>
        </div>

        {/* Right side info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: d.balance, value: `$${card.balance.toLocaleString('en', { minimumFractionDigits: 2 })}` },
              { label: d.spent, value: `$${card.spent.toLocaleString('en', { minimumFractionDigits: 2 })}` },
              { label: d.limit, value: `$${card.limit.toLocaleString()}` },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div style={{ fontSize: 11, color: '#5A7A9C', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#E8F0FE' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Spend progress */}
          <div className="p-4 rounded-xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
            <div className="flex justify-between mb-2">
              <span style={{ fontSize: 12, color: '#5A7A9C' }}>Monthly spend limit</span>
              <span style={{ fontSize: 12, color: '#E8F0FE', fontFamily: 'var(--font-mono)' }}>
                ${card.spent.toFixed(0)} / ${card.limit.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(card.spent / card.limit) * 100}%`, background: 'linear-gradient(90deg, #00D4FF, #0066FF)' }}
              />
            </div>
          </div>

          {/* Top-up button */}
          <button
            className="w-full py-3 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 14, boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}
          >
            {d.topup} Card
          </button>

          {/* Recent transactions */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)', fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>
              Recent Transactions
            </div>
            {CARD_TRANSACTIONS.map((tx, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: i < CARD_TRANSACTIONS.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.06)' }}>
                    <span style={{ fontSize: 10, color: '#5A7A9C' }}>{tx.merchant[0]}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{tx.merchant}</div>
                    <div style={{ fontSize: 11, color: '#5A7A9C' }}>{tx.category} · {tx.date}</div>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#FF3B5C' }}>{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
