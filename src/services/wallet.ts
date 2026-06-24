import { supabase, isSupabaseConfigured } from '../lib/supabase';

export async function sendFunds(walletId: string, amount: number, toAddress: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(600);
    return;
  }
  const { error } = await supabase.rpc('send_funds', {
    p_wallet_id: walletId,
    p_amount: amount,
    p_to_address: toAddress,
  });
  if (error) throw new Error(error.message);
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
