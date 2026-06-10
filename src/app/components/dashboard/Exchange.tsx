import { useState } from 'react';
import { ArrowUpDown, ChevronDown, Info } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67842.50, color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', price: 3521.18, color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', price: 182.40, color: '#9945FF' },
  { symbol: 'BNB', name: 'BNB', price: 612.33, color: '#F0B90B' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, color: '#26A17B' },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00, color: '#2775CA' },
];

const chartData = [
  { t: '00:00', p: 67100 }, { t: '04:00', p: 67450 }, { t: '08:00', p: 66900 },
  { t: '12:00', p: 67600 }, { t: '16:00', p: 67200 }, { t: '20:00', p: 67842 },
];

export function Exchange() {
  const { t } = useLang();
  const d = t.dashboard.exchange;
  const [fromCoin, setFromCoin] = useState(COINS[4]); // USDT
  const [toCoin, setToCoin] = useState(COINS[0]); // BTC
  const [fromAmount, setFromAmount] = useState('1000');
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);

  const toAmount = fromCoin.price / toCoin.price * parseFloat(fromAmount || '0');
  const fee = parseFloat(fromAmount || '0') * 0.003;

  const handleFlip = () => {
    const tmp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(tmp);
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
                    <div className="absolute top-full left-0 mt-1 z-20 rounded-xl overflow-hidden" style={{ background: '#112240', border: '1px solid rgba(0,212,255,0.15)', minWidth: 160 }}>
                      {COINS.map(c => (
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
                <span>Balance: 5,000.00 USDT</span>
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
                    <div className="absolute top-full left-0 mt-1 z-20 rounded-xl overflow-hidden" style={{ background: '#112240', border: '1px solid rgba(0,212,255,0.15)', minWidth: 160 }}>
                      {COINS.map(c => (
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

          <button
            className="w-full py-3.5 rounded-xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 14, boxShadow: '0 0 20px rgba(0,212,255,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.4)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.25)'}
          >
            {d.swap}
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
            <span style={{ fontSize: 13, color: '#00C896', fontFamily: 'var(--font-mono)' }}>+2.43% 24h</span>
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
                <span>Price (USDT)</span><span>Size (BTC)</span>
              </div>
              {[
                ['67,812.00', '0.4821'], ['67,808.50', '1.2340'], ['67,801.00', '0.8910'],
                ['67,795.20', '2.1500'], ['67,790.80', '0.3350'],
              ].map(([price, size], i) => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute inset-0 rounded" style={{ background: '#FF3B5C0A', width: `${30 + i * 12}%` }} />
                  <span style={{ fontSize: 12, color: '#FF3B5C', fontFamily: 'var(--font-mono)', position: 'relative' }}>{price}</span>
                  <span style={{ fontSize: 12, color: '#8AA8C4', fontFamily: 'var(--font-mono)', position: 'relative' }}>{size}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#5A7A9C', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>Price (USDT)</span><span>Size (BTC)</span>
              </div>
              {[
                ['67,842.50', '0.8200'], ['67,848.00', '0.5610'], ['67,852.30', '1.9820'],
                ['67,860.00', '0.4430'], ['67,864.50', '3.2100'],
              ].map(([price, size], i) => (
                <div key={i} className="flex justify-between py-0.5 relative">
                  <div className="absolute inset-0 rounded" style={{ background: '#00C8960A', width: `${25 + i * 10}%` }} />
                  <span style={{ fontSize: 12, color: '#00C896', fontFamily: 'var(--font-mono)', position: 'relative' }}>{price}</span>
                  <span style={{ fontSize: 12, color: '#8AA8C4', fontFamily: 'var(--font-mono)', position: 'relative' }}>{size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
