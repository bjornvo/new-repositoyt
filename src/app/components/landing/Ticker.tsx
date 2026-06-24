import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/LangContext';

const COINS = [
  { symbol: 'BTC', price: 67842.50, change: 2.43 },
  { symbol: 'ETH', price: 3521.18, change: 1.82 },
  { symbol: 'SOL', price: 182.40, change: 5.21 },
  { symbol: 'BNB', price: 612.33, change: -0.87 },
  { symbol: 'XRP', price: 0.6241, change: 3.14 },
  { symbol: 'ADA', price: 0.5831, change: -1.23 },
  { symbol: 'AVAX', price: 42.87, change: 4.56 },
  { symbol: 'DOT', price: 8.92, change: -0.34 },
  { symbol: 'MATIC', price: 0.8921, change: 2.18 },
  { symbol: 'LINK', price: 18.43, change: 3.72 },
  { symbol: 'UNI', price: 12.64, change: -2.01 },
  { symbol: 'ATOM', price: 9.78, change: 1.45 },
];

export function Ticker() {
  const { t } = useLang();
  const [prices, setPrices] = useState(COINS);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev =>
        prev.map(c => ({
          ...c,
          price: c.price * (1 + (Math.random() - 0.5) * 0.002),
          change: c.change + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const items = [...prices, ...prices];

  return (
    <div
      className="py-3 overflow-hidden relative"
      style={{
        background: 'rgba(10,22,40,0.8)',
        borderTop: '1px solid rgba(0,212,255,0.1)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(10,22,40,0.9), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgba(10,22,40,0.9), transparent)' }} />

      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
        <span style={{ fontSize: 11, color: '#5A7A9C', fontWeight: 600, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
          {t.ticker.label}
        </span>
      </div>

      <div
        ref={tickerRef}
        className="flex gap-8 pl-32"
        style={{
          animation: 'tickerScroll 60s linear infinite',
          width: 'max-content',
        }}
      >
        {items.map((coin, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>
              {coin.symbol}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#5A7A9C' }}>
              ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString('en', { maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: coin.change >= 0 ? '#00C896' : '#FF3B5C' }}>
              {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
