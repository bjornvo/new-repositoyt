import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Card {
  id: string;
  type: 'virtual' | 'physical';
  number: string;
  expiry: string;
  cvv: string;
  holderName: string;
  balance: number;
  spent: number;
  cardLimit: number;
  frozen: boolean;
}

const MOCK_CARDS: Card[] = [
  { id: 'c1', type: 'virtual', number: '4242 4242 4242 4242', expiry: '12/28', cvv: '342', holderName: 'ALEX VOLKOV', balance: 2847.50, spent: 1834.20, cardLimit: 5000, frozen: false },
  { id: 'c2', type: 'physical', number: '5189 3847 2910 4857', expiry: '09/29', cvv: '891', holderName: 'ALEX VOLKOV', balance: 1200.00, spent: 643.70, cardLimit: 3000, frozen: false },
];

function randomCardNumber(): string {
  const groups = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000));
  return groups.join(' ');
}

export async function getCards(userId: string): Promise<Card[]> {
  if (!isSupabaseConfigured || !supabase) return MOCK_CARDS;

  const { data, error } = await supabase.from('cards').select('*').eq('user_id', userId).order('created_at');
  if (error) throw new Error(error.message);

  return (data ?? []).map(r => ({
    id: r.id, type: r.type, number: r.number, expiry: r.expiry, cvv: r.cvv, holderName: r.holder_name,
    balance: r.balance, spent: r.spent, cardLimit: r.card_limit, frozen: r.frozen,
  }));
}

export async function issueCard(userId: string, type: 'virtual' | 'physical', holderName: string): Promise<Card> {
  const expiry = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String((new Date().getFullYear() + 4) % 100).padStart(2, '0')}`;
  const number = randomCardNumber();
  const cvv = String(Math.floor(100 + Math.random() * 900));

  if (!isSupabaseConfigured || !supabase) {
    const card: Card = { id: `c${Date.now()}`, type, number, expiry, cvv, holderName, balance: 0, spent: 0, cardLimit: 5000, frozen: false };
    MOCK_CARDS.push(card);
    return card;
  }

  const { data, error } = await supabase.from('cards').insert({
    user_id: userId, type, number, expiry, cvv, holder_name: holderName, balance: 0, spent: 0, card_limit: 5000, frozen: false,
  }).select().single();
  if (error) throw new Error(error.message);

  return { id: data.id, type: data.type, number: data.number, expiry: data.expiry, cvv: data.cvv, holderName: data.holder_name,
    balance: data.balance, spent: data.spent, cardLimit: data.card_limit, frozen: data.frozen };
}

export async function toggleCardFreeze(cardId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const card = MOCK_CARDS.find(c => c.id === cardId);
    if (card) card.frozen = !card.frozen;
    return;
  }
  const { error } = await supabase.rpc('toggle_card_freeze', { p_card_id: cardId });
  if (error) throw new Error(error.message);
}

export async function topUpCard(cardId: string, walletId: string, usdAmount: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const card = MOCK_CARDS.find(c => c.id === cardId);
    if (card) card.balance += usdAmount;
    return;
  }
  const { error } = await supabase.rpc('topup_card', { p_card_id: cardId, p_wallet_id: walletId, p_usd_amount: usdAmount });
  if (error) throw new Error(error.message);
}
