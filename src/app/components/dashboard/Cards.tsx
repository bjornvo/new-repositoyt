import { useState, useEffect } from 'react';
import { Snowflake, Plus, Eye, EyeOff, Wifi } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { getCards, issueCard, toggleCardFreeze, topUpCard, type Card } from '../../../services/cards';
import { getPortfolio, type WalletBalance } from '../../../services/portfolio';

const CARD_GRADIENTS = {
  virtual: 'linear-gradient(135deg, #0066FF 0%, #00D4FF 100%)',
  physical: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
};

export function Cards() {
  const { t } = useLang();
  const { user } = useAuth();
  const d = t.dashboard.cards;
  const [cards, setCards] = useState<Card[]>([]);
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNumber, setShowNumber] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpWalletId, setTopUpWalletId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = () => {
    Promise.all([getCards(user?.id ?? 'guest'), getPortfolio(user?.id ?? 'guest')]).then(([c, p]) => {
      setCards(c);
      setWallets(p.wallets);
      setTopUpWalletId(prev => prev || p.wallets[0]?.id || '');
      setLoading(false);
    });
  };

  useEffect(refresh, [user?.id]);

  const card = cards[activeCard];

  const handleFreeze = async () => {
    if (!card) return;
    await toggleCardFreeze(card.id);
    refresh();
  };

  const handleOrderCard = async () => {
    const type = cards.some(c => c.type === 'virtual') ? 'physical' : 'virtual';
    await issueCard(user?.id ?? 'guest', type, `${user?.firstName ?? 'ALEX'} ${user?.lastName ?? 'VOLKOV'}`.toUpperCase());
    refresh();
  };

  const handleTopUp = async () => {
    if (!card) return;
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) { setError('Enter a valid amount.'); return; }
    if (!topUpWalletId) { setError('Select a wallet.'); return; }
    setError('');
    setBusy(true);
    try {
      await topUpCard(card.id, topUpWalletId, amount);
      setTopUpOpen(false);
      setTopUpAmount('');
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Top-up failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#5A7A9C', fontSize: 13 }}>Loading cards…</div>;
  }

  if (!card) {
    return (
      <div className="p-6 rounded-2xl text-center" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
        <p style={{ color: '#5A7A9C', fontSize: 14, marginBottom: 12 }}>No cards yet.</p>
        <button onClick={handleOrderCard} className="px-4 py-2 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13 }}>
          Order your first card
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Card selector */}
      <div className="flex gap-3">
        {cards.map((c, i) => (
          <button
            key={c.id}
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
            {c.type === 'virtual' ? d.virtualCard : d.physicalCard}
          </button>
        ))}
        <button
          onClick={handleOrderCard}
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
              background: CARD_GRADIENTS[card.type],
              aspectRatio: '1.586',
              filter: card.frozen ? 'grayscale(0.5) brightness(0.7)' : 'none',
              transition: 'filter 0.4s ease',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

            {card.frozen && (
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
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff', fontWeight: 600 }}>{card.holderName}</div>
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
              onClick={handleFreeze}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: card.frozen ? 'rgba(0,212,255,0.1)' : '#0A1628',
                border: `1px solid ${card.frozen ? 'rgba(0,212,255,0.3)' : 'rgba(255,59,92,0.2)'}`,
                color: card.frozen ? '#00D4FF' : '#FF3B5C',
                fontSize: 13,
              }}
            >
              <Snowflake size={14} />
              {card.frozen ? 'Unfreeze' : d.freeze}
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
              { label: d.limit, value: `$${card.cardLimit.toLocaleString()}` },
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
                ${card.spent.toFixed(0)} / ${card.cardLimit.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((card.spent / card.cardLimit) * 100, 100)}%`, background: 'linear-gradient(90deg, #00D4FF, #0066FF)' }}
              />
            </div>
          </div>

          {/* Top-up button / form */}
          {!topUpOpen ? (
            <button
              onClick={() => { setTopUpOpen(true); setError(''); }}
              className="w-full py-3 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 14, boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}
            >
              {d.topup} Card
            </button>
          ) : (
            <div className="p-4 rounded-xl space-y-3" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
              <div>
                <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>From wallet</label>
                <select
                  value={topUpWalletId}
                  onChange={e => setTopUpWalletId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg outline-none"
                  style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }}
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.symbol} — ${w.usdValue.toLocaleString('en', { maximumFractionDigits: 0 })} available</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>Amount (USD)</label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={e => setTopUpAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-lg outline-none"
                  style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                />
              </div>
              {error && <p style={{ fontSize: 12, color: '#FF3B5C' }}>{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => setTopUpOpen(false)} className="flex-1 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#5A7A9C', fontSize: 13, fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={handleTopUp} disabled={busy} className="flex-1 py-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13, opacity: busy ? 0.7 : 1 }}>
                  {busy ? 'Processing…' : 'Confirm'}
                </button>
              </div>
            </div>
          )}

          {/* Recent transactions */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)', fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>
              Recent Transactions
            </div>
            <div className="px-4 py-6 text-center" style={{ color: '#5A7A9C', fontSize: 13 }}>
              No transactions yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
