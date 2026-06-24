import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Executes a swap server-side (atomic balance update + transaction record).
 * Callers should re-fetch wallet/portfolio data afterwards to see the result —
 * the RPC only returns the transaction row, not the resulting wallet balances.
 */
export async function swapAssets(fromSymbol: string, toSymbol: string, fromAmount: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(700);
    return;
  }

  const { error } = await supabase.rpc('swap_assets', {
    p_from_symbol: fromSymbol,
    p_to_symbol: toSymbol,
    p_from_amount: fromAmount,
  });
  if (error) throw new Error(error.message);
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
