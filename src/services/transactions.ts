import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'earn';
  asset: string;
  amount: number;
  usdValue: number;
  status: 'completed' | 'pending' | 'failed';
  fromAddress: string | null;
  toAddress: string | null;
  txHash: string | null;
  fee: number;
  createdAt: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'receive', asset: 'BTC', amount: 0.15, usdValue: 10176, status: 'completed', fromAddress: 'bc1qxyz...', toAddress: null, txHash: '0xabc123', fee: 0.0002, createdAt: '2026-06-09T14:22:00Z' },
  { id: 't2', type: 'send', asset: 'ETH', amount: 1.2, usdValue: 4226, status: 'completed', fromAddress: null, toAddress: '0x742d...', txHash: '0xdef456', fee: 0.003, createdAt: '2026-06-08T09:15:00Z' },
  { id: 't3', type: 'swap', asset: 'SOL→USDC', amount: 10, usdValue: 1824, status: 'completed', fromAddress: null, toAddress: null, txHash: '0xghi789', fee: 0.01, createdAt: '2026-06-07T18:40:00Z' },
  { id: 't4', type: 'stake', asset: 'ETH', amount: 2.0, usdValue: 7041, status: 'completed', fromAddress: null, toAddress: null, txHash: '0xjkl012', fee: 0.004, createdAt: '2026-06-05T11:00:00Z' },
  { id: 't5', type: 'earn', asset: 'ETH', amount: 0.021, usdValue: 73.9, status: 'completed', fromAddress: null, toAddress: null, txHash: '0xmno345', fee: 0, createdAt: '2026-06-04T00:00:00Z' },
  { id: 't6', type: 'receive', asset: 'USDC', amount: 5000, usdValue: 5000, status: 'completed', fromAddress: '0xabc...', toAddress: null, txHash: '0xpqr678', fee: 0, createdAt: '2026-06-03T16:32:00Z' },
  { id: 't7', type: 'send', asset: 'BTC', amount: 0.05, usdValue: 3392, status: 'pending', fromAddress: null, toAddress: 'bc1qabc...', txHash: null, fee: 0.0003, createdAt: '2026-06-10T08:05:00Z' },
  { id: 't8', type: 'swap', asset: 'MATIC→ETH', amount: 1000, usdValue: 880, status: 'completed', fromAddress: null, toAddress: null, txHash: '0xstu901', fee: 0.005, createdAt: '2026-06-01T12:15:00Z' },
];

export async function getTransactions(userId: string, limit = 50): Promise<Transaction[]> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_TRANSACTIONS;
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter(r => !r.card_id)
    .map(r => ({
      id: r.id, type: r.type as Transaction['type'], asset: r.asset, amount: r.amount, usdValue: r.usd_value,
      status: r.status, fromAddress: r.from_address, toAddress: r.to_address,
      txHash: r.tx_hash, fee: r.fee, createdAt: r.created_at,
    }));
}

export async function createTransaction(userId: string, tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
  if (!isSupabaseConfigured || !supabase) {
    const mock: Transaction = { ...tx, id: `t${Date.now()}`, createdAt: new Date().toISOString() };
    MOCK_TRANSACTIONS.unshift(mock);
    return mock;
  }

  const { data, error } = await supabase.from('transactions').insert({
    user_id: userId,
    type: tx.type,
    asset: tx.asset,
    amount: tx.amount,
    usd_value: tx.usdValue,
    status: tx.status,
    from_address: tx.fromAddress,
    to_address: tx.toAddress,
    tx_hash: tx.txHash,
    fee: tx.fee,
  }).select().single();
  if (error) throw new Error(error.message);

  return { id: data.id, type: data.type as Transaction['type'], asset: data.asset, amount: data.amount, usdValue: data.usd_value,
    status: data.status, fromAddress: data.from_address, toAddress: data.to_address,
    txHash: data.tx_hash, fee: data.fee, createdAt: data.created_at };
}
