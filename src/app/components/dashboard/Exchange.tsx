import { useState, useEffect } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { getMarketPrices, type MarketPrice } from '../../../services/market';
import { swapAssets } from '../../../services/exchange';
import { getPortfolio, type WalletBalance } from '../../../services/portfolio';

const chartData = [
  { t: '00:00', p: 67100 }, { t: '04:00', p: 67450 }, { t: '08:00', p: 66900 },
  { t: '12:00', p: 67600 }, { t: '16:00', p: 67200 }, { t: '20:00', p: 67842 },
];

export function Exchange() {
  const { t } = useLang();
  const { user } = useAuth();
  const d = t.dashboard.exchange;
  const [coins, setCoins] = useState<MarketPrice[]>([]);
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [fromCoin, setFromCoin] = useState<MarketPrice | null>(null);
  const [toCoin, setToCoin] = useState<MarketPrice | null>(null);
  const [fromAmount, setFromAmount] = useState('1000');
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [swapDone, setSwapDone] = useState(false);

  const refresh = () => {
    Promise.all([getMarketPrices(), getPortfolio(user?.id ?? 'guest')]).then(([prices, portfolio]) => {
      setCoins(prices);
      setWallets(portfolio.wallets);
      setFromCoin(prev => prev ?? prices.find(c => c.symbol === 'USDT') ?? prices[0]);
      setToCoin(prev => prev ?? prices.find(c => c.symbol === 'BTC') ?? prices[1]);
    });
  };

  useEffect(refresh, [user?.id]);

  if (!fromCoin || !toCoin) {
    return <div style={{ color: '#5A7A9C', fontSize: 13 }}>Loading markets…</div>;
  }

  const fromBalance = wallets.find(w => w.symbol === fromCoin.symbol)?.balance ?? 0;
  const toAmount = (fromCoin.price / toCoin.price) * parseFloat(fromAmount || '0');
  const fee = parseFloat(fromAmount || '0') * 0.003;

  const handleFlip = () => {
    const tmp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(tmp);
  };

  const handleSwap = async () => {
    const amount = parseFloat(fromAmount);
    if (!amount || amount <= 0) { setSwapError('Enter a valid amount.'); return; }
    if (amount > fromBalance) { setSwapError('Insufficient balance.'); return; }
    setSwapError('');
    setSwapDone(false);
    setSwapping(true);
    try {
      await swapAssets(fromCoin.symbol, toCoin.symbol, amount);
      setSwapDone(true);
      refresh();
    } catch (err: unknown) {
      setSwapError(err instanceof Error ? err.message : 'Swap failed.');
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-5">
      {/* Swap card */}
      <div className="lg:col-span-2">
        <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#E8F0FE', marginBottom: 16 }}>{d.title}</div>

          {/* From */}
          <div className="mb-2">
            <div style={{ fontSize: 12, color: '#5A7A9C', marginBottom: 6 }}>{d.from}</div>
            <div className="p-3 rounded-xl" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <button
                    onClick={() => { setShowFromList(!showFromList); setShowToList(false); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)' }}
                  >
                    <div className="w-5 h-5 rounded-full" style={{ background: fromCoin.color + '33' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#E8F0FE' }}>{fromCoin.symbol}</span>
                    <ChevronDown size={12} style={{ color: '#5A7A9C' }} />
                  </button>
                  {showFromList && (
                    <div className="absolute top-full left-0 mt-1 z-20 rounded-xl overflow-hidden" style={{ background: '#112240', border: '1px solid rgba(0,212,255,0.15)', minWidth: 160, maxHeight: 260, overflowY: 'auto' }}>
                      {coins.map(c => (
                        <button key={c.symbol} onClick={() => { setFromCoin(c); setShowFromList(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 transition-colors"
                          style={{ color: '#E8F0FE', fontSize: 13 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div className="w-5 h-5 rounded-full" style={{ background: c.color + '33' }} />
                          <span style={{ fontWeight: 600 }}>{c.symbol}</span>
                          <span style={{ color: '#5A7A9C', fontSize: 11 }}>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={e => setFromAmount(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-right"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: '#E8F0FE' }}
                />
              </div>
              <div className="flex justify-between" style={{ fontSize: 11, color: '#5A7A9C' }}>
                <span>Balance: {fromBalance.toLocaleString('en', { maximumFractionDigits: 6 })} {fromCoin.symbol}</span>
                <span>${(parseFloat(fromAmount || '0') * fromCoin.price).toLocaleString('en', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Flip */}
          <div className="flex justify-center my-2">
            <button
              onClick={handleFlip}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'rotate(180deg)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <ArrowUpDown size={15} style={{ color: '#00D4FF' }} />
            </button>
          </div>

          {/* To */}
          <div className="mb-4">
            <div style={{ fontSize: 12, color: '#5A7A9C', marginBottom: 6 }}>{d.to}</div>
            <div className="p-3 rounded-xl" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <button
                    onClick={() => { setShowToList(!showToList); setShowFromList(false); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)' }}
                  >
                    <div className="w-5 h-5 rounded-full" style={{ background: toCoin.color + '33' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#E8F0FE' }}>{toCoin.symbol}</span>
                    <ChevronDown size={12} style={{ color: '#5A7A9C' }} />
                  </button>
                  {showToList && (
                    <div className="absolute top-full left-0 mt-1 z-20 rounded-xl overflow-hidden" style={{ background: '#112240', border: '1px solid rgba(0,212,255,0.15)', minWidth: 160, maxHeight: 260, overflowY: 'auto' }}>
                      {coins.map(c => (
                        <button key={c.symbol} onClick={() => { setToCoin(c); setShowToList(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 transition-colors"
                          style={{ color: '#E8F0FE', fontSize: 13 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div className="w-5 h-5 rounded-full" style={{ background: c.color + '33' }} />
                          <span style={{ fontWeight: 600 }}>{c.symbol}</span>
                          <span style={{ color: '#5A7A9C', fontSize: 11 }}>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className="flex-1 text-right"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: '#00D4FF' }}
                >
                  {isNaN(toAmount) ? '0.000000' : toAmount.toFixed(6)}
                </div>
              </div>
              <div className="flex justify-between" style={{ fontSize: 11, color: '#5A7A9C' }}>
                <span>{d.rate}: 1 {fromCoin.symbol} = {(fromCoin.price / toCoin.price).toFixed(6)} {toCoin.symbol}</span>
              </div>
            </div>
          </div>

          {/* Fee info */}
          <div className="space-y-2 mb-4 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
            {[
              { label: d.fee, val: `$${fee.toFixed(2)} (0.3%)` },
              { label: d.slippage, val: '0.5%' },
              { label: 'Settlement', val: '~1 second' },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span style={{ fontSize: 12, color: '#5A7A9C' }}>{row.label}</span>
                <span style={{ fontSize: 12, color: '#8AA8C4', fontFamily: 'var(--font-mono)' }}>{row.val}</span>
              </div>
            ))}
          </div>

          {swapError && <p style={{ fontSize: 12, color: '#FF3B5C', marginBottom: 8 }}>{swapError}</p>}
          {swapDone && <p style={{ fontSize: 12, color: '#00C896', marginBottom: 8 }}>Swap completed.</p>}

          <button
            onClick={handleSwap}
            disabled={swapping}
            className="w-full py-3.5 rounded-xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 14, boxShadow: '0 0 20px rgba(0,212,255,0.25)', opacity: swapping ? 0.7 : 1 }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.4)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.25)'}
          >
            {swapping ? 'Swapping…' : d.swap}
          </button>
        </div>
      </div>

      {/* Price chart + order book */}
      <div className="lg:col-span-3 space-y-4">
        {/* Chart */}
        <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{toCoin.symbol}/{fromCoin.symbol}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: '#E8F0FE' }}>
                ${toCoin.price.toLocaleString()}
              </div>
            </div>
            <span style={{ fontSize: 13, color: toCoin.change24h >= 0 ? '#00C896' : '#FF3B5C', fontFamily: 'var(--font-mono)' }}>
              {toCoin.change24h >= 0 ? '+' : ''}{toCoin.change24h.toFixed(2)}% 24h
            </span>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#5A7A9C' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }} />
                <Line type="monotone" dataKey="p" name="price" stroke="#00D4FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order book */}
        <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 10 }}>Order Book</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div style={{ fontSize: 11, color: '#5A7A9C', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>Price (USDT)</span><span>Size ({toCoin.symbol})</span>
              </div>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute inset-0 rounded" style={{ background: '#FF3B5C0A', width: `${30 + i * 12}%` }} />
                  <span style={{ fontSize: 12, color: '#FF3B5C', fontFamily: 'var(--font-mono)', position: 'relative' }}>
                    {(toCoin.price * (1 + (i + 1) * 0.0003)).toLocaleString('en', { maximumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: 12, color: '#8AA8C4', fontFamily: 'var(--font-mono)', position: 'relative' }}>{(0.3 + i * 0.4).toFixed(4)}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#5A7A9C', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>Price (USDT)</span><span>Size ({toCoin.symbol})</span>
              </div>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute inset-0 rounded" style={{ background: '#00C8960A', width: `${25 + i * 10}%` }} />
                  <span style={{ fontSize: 12, color: '#00C896', fontFamily: 'var(--font-mono)', position: 'relative' }}>
                    {(toCoin.price * (1 - (i + 1) * 0.0003)).toLocaleString('en', { maximumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: 12, color: '#8AA8C4', fontFamily: 'var(--font-mono)', position: 'relative' }}>{(0.4 + i * 0.5).toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
