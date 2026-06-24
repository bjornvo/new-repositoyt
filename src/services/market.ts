import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface MarketPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  color: string;
}

const MOCK_PRICES: MarketPrice[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67842.50, change24h: 2.43, color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', price: 3521.18, change24h: 1.82, color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', price: 182.40, change24h: 5.21, color: '#9945FF' },
  { symbol: 'BNB', name: 'BNB Chain', price: 612.33, change24h: -0.87, color: '#F0B90B' },
  { symbol: 'MATIC', name: 'Polygon', price: 0.8921, change24h: 2.18, color: '#8247E5' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: 0.01, color: '#26A17B' },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.00, color: '#2775CA' },
  { symbol: 'XRP', name: 'XRP', price: 0.6241, change24h: 3.14, color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', price: 0.5831, change24h: -1.23, color: '#0033AD' },
  { symbol: 'AVAX', name: 'Avalanche', price: 42.87, change24h: 4.56, color: '#E84142' },
  { symbol: 'DOT', name: 'Polkadot', price: 8.92, change24h: -0.34, color: '#E6007A' },
  { symbol: 'LINK', name: 'Chainlink', price: 18.43, change24h: 3.72, color: '#2A5ADA' },
  { symbol: 'UNI', name: 'Uniswap', price: 12.64, change24h: -2.01, color: '#FF007A' },
  { symbol: 'ATOM', name: 'Cosmos', price: 9.78, change24h: 1.45, color: '#2E3148' },
];

export async function getMarketPrices(): Promise<MarketPrice[]> {
  if (!isSupabaseConfigured || !supabase) return MOCK_PRICES;

  const { data, error } = await supabase.from('market_prices').select('*').order('symbol');
  if (error) throw new Error(error.message);

  return (data ?? []).map(r => ({
    symbol: r.symbol, name: r.name, price: r.price, change24h: r.change_24h, color: r.color,
  }));
}

export async function updateMarketPrice(symbol: string, updates: { price?: number; change24h?: number }): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase.from('market_prices').update({
    price: updates.price,
    change_24h: updates.change24h,
  }).eq('symbol', symbol);
  if (error) throw new Error(error.message);
}
