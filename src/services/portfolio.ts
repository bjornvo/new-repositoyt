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

export async function getPortfolio(userId: string): Promise<PortfolioSnapshot> {
  if (!isSupabaseConfigured || !supabase) {
    const wallets = MOCK_WALLETS;
    const total = wallets.reduce((s, w) => s + w.usdValue, 0);
    const colors: Record<string, string> = { BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', MATIC: '#8247E5', USDC: '#2775CA' };
    return {
      totalUsd: total,
      change24hPct: 3.42,
      wallets,
      allocation: wallets.map(w => ({ coin: w.symbol, value: w.usdValue, color: colors[w.symbol] ?? '#00D4FF' })),
      history: MOCK_HISTORY,
    };
  }

  const { data: walletRows, error } = await supabase.from('wallets').select('*').eq('user_id', userId);
  if (error) throw new Error(error.message);

  const wallets: WalletBalance[] = (walletRows ?? []).map(r => ({
    id: r.id, chain: r.chain, symbol: r.symbol, address: r.address, balance: r.balance, usdValue: r.usd_value,
  }));

  const total = wallets.reduce((s, w) => s + w.usdValue, 0);
  const colors: Record<string, string> = { BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', MATIC: '#8247E5', USDC: '#2775CA' };

  return {
    totalUsd: total,
    change24hPct: 3.42,
    wallets,
    allocation: wallets.map(w => ({ coin: w.symbol, value: w.usdValue, color: colors[w.symbol] ?? '#00D4FF' })),
    history: MOCK_HISTORY,
  };
}
