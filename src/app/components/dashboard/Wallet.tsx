import { useState, useEffect } from 'react';
import { Copy, Check, QrCode, Send, ArrowDownLeft, Plus } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { getPortfolio, type WalletBalance } from '../../../services/portfolio';
import { sendFunds } from '../../../services/wallet';
import { CryptoIcon } from '../common/CryptoIcon';

const COIN_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', MATIC: '#8247E5', USDC: '#2775CA',
  BNB: '#F0B90B', USDT: '#26A17B', XRP: '#23292F', ADA: '#0033AD', AVAX: '#E84142',
  DOT: '#E6007A', LINK: '#2A5ADA', UNI: '#FF007A', ATOM: '#2E3148',
};

export function Wallet() {
  const { t } = useLang();
  const { user } = useAuth();
  const d = t.dashboard.wallet;
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const loadWallets = () => {
    getPortfolio(user?.id ?? 'guest').then(p => {
      setWallets(p.wallets);
      setLoading(false);
    });
  };

  useEffect(loadWallets, [user?.id]);

  const wallet = wallets[selected];

  const handleCopy = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!wallet) return;
    const amount = parseFloat(sendAmount);
    if (!amount || amount <= 0) { setSendError('Enter a valid amount.'); return; }
    if (amount > wallet.balance) { setSendError('Insufficient balance.'); return; }
    if (!sendAddress.trim()) { setSendError('Enter a recipient address.'); return; }
    setSendError('');
    setSending(true);
    try {
      await sendFunds(wallet.id, amount, sendAddress.trim());
      setSendOpen(false);
      setSendAmount('');
      setSendAddress('');
      loadWallets();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Send failed.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#5A7A9C', fontSize: 13 }}>Loading wallets…</div>;
  }

  if (!wallet) {
    return <div style={{ color: '#5A7A9C', fontSize: 13 }}>No wallets yet.</div>;
  }

  return (
    <div className="space-y-5">
      {/* Wallet selector */}
      <div className="flex flex-wrap gap-2">
        {wallets.map((w, i) => {
          const color = COIN_COLORS[w.symbol] ?? '#00D4FF';
          return (
            <button
              key={w.id}
              onClick={() => setSelected(i)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150"
              style={{
                background: selected === i ? 'rgba(0,212,255,0.1)' : '#0A1628',
                border: `1px solid ${selected === i ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.08)'}`,
                color: selected === i ? '#00D4FF' : '#5A7A9C',
              }}
            >
              <CryptoIcon symbol={w.symbol} color={color} size={20} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{w.symbol}</span>
            </button>
          );
        })}
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150"
          style={{ background: '#0A1628', border: '1px dashed rgba(0,212,255,0.2)', color: '#5A7A9C', fontSize: 13 }}
        >
          <Plus size={14} />
          Add Wallet
        </button>
      </div>

      {/* Main wallet card */}
      <div
        className="p-6 rounded-2xl relative overflow-hidden"
        style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.12)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${(COIN_COLORS[wallet.symbol] ?? '#00D4FF')}0D 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }}
        />
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <CryptoIcon symbol={wallet.symbol} color={COIN_COLORS[wallet.symbol] ?? '#00D4FF'} size={48} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#E8F0FE' }}>{wallet.chain}</div>
                <div className="inline-flex px-2 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.08)', fontSize: 11, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>
                  Mainnet
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#5A7A9C', marginBottom: 4 }}>{d.totalBalance}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700, color: '#E8F0FE' }}>
              {wallet.balance.toLocaleString('en', { maximumFractionDigits: 6 })} <span style={{ fontSize: 18, color: '#5A7A9C' }}>{wallet.symbol}</span>
            </div>
            <div style={{ fontSize: 16, color: '#00C896', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              ${wallet.usdValue.toLocaleString('en', { minimumFractionDigits: 2 })}
            </div>

            {/* Address */}
            <div className="mt-5">
              <div style={{ fontSize: 12, color: '#5A7A9C', marginBottom: 6 }}>{d.address}</div>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.08)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#8AA8C4', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {wallet.address}
                </span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all" style={{ background: 'rgba(0,212,255,0.1)', fontSize: 11, color: '#00D4FF' }}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : d.copy}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-32 h-32 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)' }}
            >
              <QrCode size={60} style={{ color: '#00D4FF', opacity: 0.6 }} />
            </div>
            <span style={{ fontSize: 11, color: '#5A7A9C' }}>QR Code</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 14, boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}
          >
            <ArrowDownLeft size={16} />
            {d.receive}
          </button>
          <button
            onClick={() => { setSendOpen(!sendOpen); setSendError(''); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200"
            style={{ border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF', fontSize: 14, fontWeight: 600 }}
          >
            <Send size={16} />
            {d.send}
          </button>
        </div>

        {/* Send form */}
        {sendOpen && (
          <div className="mt-4 p-4 rounded-xl space-y-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div>
              <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>Recipient address</label>
              <input
                value={sendAddress}
                onChange={e => setSendAddress(e.target.value)}
                placeholder={`${wallet.symbol} address...`}
                className="w-full px-3 py-2.5 rounded-lg outline-none"
                style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13, fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>Amount ({wallet.symbol})</label>
              <input
                type="number"
                value={sendAmount}
                onChange={e => setSendAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-lg outline-none"
                style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13, fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div className="flex items-center justify-between" style={{ fontSize: 12, color: '#5A7A9C' }}>
              <span>Network fee: ~${(parseFloat(sendAmount || '0') * (wallet.usdValue / (wallet.balance || 1)) * 0.005).toFixed(2)} (0.5%)</span>
              <span>Available: {wallet.balance.toLocaleString('en', { maximumFractionDigits: 6 })} {wallet.symbol}</span>
            </div>
            {sendError && <p style={{ fontSize: 12, color: '#FF3B5C' }}>{sendError}</p>}
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full py-2.5 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13, opacity: sending ? 0.7 : 1 }}
            >
              {sending ? 'Sending…' : 'Confirm Send'}
            </button>
          </div>
        )}
      </div>

      {/* All wallets summary */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>All Wallets</span>
        </div>
        {wallets.map((w, i) => {
          const color = COIN_COLORS[w.symbol] ?? '#00D4FF';
          return (
            <div
              key={w.id}
              onClick={() => setSelected(i)}
              className="flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors duration-150"
              style={{ borderBottom: i < wallets.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <CryptoIcon symbol={w.symbol} color={color} size={32} />
              <div className="flex-1">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{w.chain}</div>
                <div style={{ fontSize: 11, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>{w.balance.toLocaleString('en', { maximumFractionDigits: 6 })} {w.symbol}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', fontFamily: 'var(--font-mono)' }}>
                ${w.usdValue.toLocaleString('en', { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
