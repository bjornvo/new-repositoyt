import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface WalletBalance {
  id: string;
  chain: string;
  symbol: string;
  address: string;
  balance: number;
  usdValue: number;
}

export interface PortfolioSnapshot {
  totalUsd: number;
  change24hPct: number;
  wallets: WalletBalance[];
  allocation: { coin: string; value: number; color: string }[];
  history: { date: string; value: number }[];
}

const MOCK_WALLETS: WalletBalance[] = [
  { id: 'w1', chain: 'Bitcoin', symbol: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', balance: 0.4821, usdValue: 32710 },
  { id: 'w2', chain: 'Ethereum', symbol: 'ETH', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', balance: 4.832, usdValue: 17018 },
  { id: 'w3', chain: 'Solana', symbol: 'SOL', address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', balance: 52.1, usdValue: 9503 },
  { id: 'w4', chain: 'Polygon', symbol: 'MATIC', address: '0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B', balance: 8420, usdValue: 7410 },
  { id: 'w5', chain: 'USD Coin', symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', balance: 5200, usdValue: 5200 },
];

const MOCK_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2026-05-11');
  d.setDate(d.getDate() + i);
  const base = 68000;
  const noise = Math.sin(i * 0.6) * 4000 + Math.random() * 2000 - 1000;
  return { date: d.toISOString().slice(0, 10), value: Math.round(base + noise + i * 300) };
});

const DEFAULT_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', MATIC: '#8247E5', USDC: '#2775CA',
  BNB: '#F0B90B', USDT: '#26A17B', XRP: '#23292F', ADA: '#0033AD', AVAX: '#E84142',
  DOT: '#E6007A', LINK: '#2A5ADA', UNI: '#FF007A', ATOM: '#2E3148',
};

// A transaction's effect on the wallet-level USD total it touched (swap nets
// to ~0 since the same USD value just moves from one asset to another).
function txDelta(type: string, usdValue: number): number {
  switch (type) {
    case 'receive':
    case 'unstake':
    case 'earn':
      return usdValue;
    case 'send':
    case 'stake':
    case 'card_topup':
      return -usdValue;
    default:
      return 0;
  }
}

// Reconstructs a day-by-day USD total by walking the ledger backwards from
// the current total — there's no separate "portfolio history" table, so this
// is derived straight from the same transactions the rest of the app shows.
function buildHistory(totalUsd: number, transactions: { type: string; usd_value: number; created_at: string }[]) {
  const sorted = [...transactions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const points: { date: string; value: number }[] = [];
  let running = totalUsd;
  for (const tx of sorted) {
    points.push({ date: tx.created_at.slice(0, 10), value: running });
    running -= txDelta(tx.type, tx.usd_value);
  }
  points.push({ date: sorted[sorted.length - 1]?.created_at.slice(0, 10) ?? new Date().toISOString().slice(0, 10), value: running });

  // Collapse to one point per day (latest value of that day), oldest first.
  const byDay = new Map<string, number>();
  for (const p of [...points].reverse()) byDay.set(p.date, p.value);
  return Array.from(byDay, ([date, value]) => ({ date, value }));
}

export async function getPortfolio(userId: string): Promise<PortfolioSnapshot> {
  if (!isSupabaseConfigured || !supabase) {
    const wallets = MOCK_WALLETS;
    const total = wallets.reduce((s, w) => s + w.usdValue, 0);
    return {
      totalUsd: total,
      change24hPct: 3.42,
      wallets,
      allocation: wallets.map(w => ({ coin: w.symbol, value: w.usdValue, color: DEFAULT_COLORS[w.symbol] ?? '#00D4FF' })),
      history: MOCK_HISTORY,
    };
  }

  const [{ data: walletRows, error: walletsError }, { data: priceRows, error: pricesError }, { data: txRows, error: txError }] = await Promise.all([
    supabase.from('wallets').select('*').eq('user_id', userId),
    supabase.from('market_prices').select('symbol, change_24h'),
    supabase.from('transactions').select('type, usd_value, created_at').eq('user_id', userId).is('card_id', null).order('created_at'),
  ]);
  if (walletsError) throw new Error(walletsError.message);
  if (pricesError) throw new Error(pricesError.message);
  if (txError) throw new Error(txError.message);

  const wallets: WalletBalance[] = (walletRows ?? []).map(r => ({
    id: r.id, chain: r.chain, symbol: r.symbol, address: r.address, balance: r.balance, usdValue: r.usd_value,
  }));

  const total = wallets.reduce((s, w) => s + w.usdValue, 0);
  const changeBySymbol = new Map((priceRows ?? []).map(r => [r.symbol, r.change_24h]));
  const change24hPct = total > 0
    ? wallets.reduce((s, w) => s + w.usdValue * (changeBySymbol.get(w.symbol) ?? 0), 0) / total
    : 0;

  const history = buildHistory(total, txRows ?? []);

  return {
    totalUsd: total,
    change24hPct,
    wallets,
    allocation: wallets.map(w => ({ coin: w.symbol, value: w.usdValue, color: DEFAULT_COLORS[w.symbol] ?? '#00D4FF' })),
    history: history.length > 0 ? history : [{ date: new Date().toISOString().slice(0, 10), value: total }],
  };
}
