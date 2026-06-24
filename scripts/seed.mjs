/**
 * Synthetic demo seed for NovaCrypt.
 *
 * Fills the database with FAKE users + wallets/transactions/stakes so the
 * dashboard and admin views are populated and clickable for a demo / design
 * review. This is throwaway demo data — every user is synthetic (emails end in
 * @novacrypt.test) and no real person is involved.
 *
 * Run locally only:
 *   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node scripts/seed.mjs
 *
 * The service_role key is admin-level — it lives only in your shell for this
 * one-off run. NEVER commit it or ship it to the client bundle.
 *
 * Re-running: deletes previously seeded demo users (by @novacrypt.test email)
 * and recreates them, so it's safe to run repeatedly.
 */

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COUNT = Number(process.env.SEED_COUNT || 24);

if (!URL || !SERVICE_KEY) {
  console.error('Missing env. Run:\n  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs');
  process.exit(1);
}

const db = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });

// ── synthetic data pools ──────────────────────────────────────────────────────
const FIRST = ['Alex','Sarah','Marcus','Priya','Ivan','Li','Emma','Omar','Nina','Tom',
  'Yuki','Diego','Lena','Kwame','Sofia','Hugo','Mia','Noah','Aisha','Pavel','Clara','Sven','Ravi','Zoe'];
const LAST = ['Volkov','Chen','Weber','Nair','Petrov','Wei','Johnson','Hassan','Roth','Klein',
  'Tanaka','Garcia','Novak','Mensah','Rossi','Dubois','Park','Schmidt','Khan','Ivanov','Bauer','Berg','Patel','Adams'];
const COUNTRIES = ['US','SG','CH','AE','RU','CN','EG','DE','FR','JP','BR','GB','IN','NL','SE'];
const PLANS = ['Starter','Pro','Pro','Pro','Institutional'];
const KYC = ['verified','verified','verified','pending','rejected'];
const CHAINS = [['Bitcoin','BTC'],['Ethereum','ETH'],['Solana','SOL'],['BNB Chain','BNB'],['Polygon','MATIC']];
const TX_TYPES = ['deposit','withdrawal','swap','stake_reward','transfer'];
const TX_STATUS = ['completed','completed','completed','pending','failed'];

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const money = (min, max) => Math.round((min + Math.random() * (max - min)) * 100) / 100;
const hex = (n) => Array.from({ length: n }, () => '0123456789abcdef'[rnd(16)]).join('');
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

function fakeAddress(symbol) {
  if (symbol === 'BTC') return 'bc1q' + hex(38);
  if (symbol === 'SOL') return hex(44);
  return '0x' + hex(40);
}

// ── cleanup previous demo users ───────────────────────────────────────────────
async function purgeDemo() {
  let removed = 0;
  // paginate through auth users, delete the synthetic ones
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    if (!data.users.length) break;
    for (const u of data.users) {
      if (u.email && u.email.endsWith('@novacrypt.test')) {
        await db.auth.admin.deleteUser(u.id); // cascades to profile/wallets/etc via FK
        removed++;
      }
    }
    if (data.users.length < 200) break;
  }
  if (removed) console.log(`Removed ${removed} previous demo users.`);
}

// ── create one synthetic user with full data ──────────────────────────────────
async function seedUser(i) {
  const first = pick(FIRST);
  const last = pick(LAST);
  const email = `demo.user+${i}@novacrypt.test`;
  const joinedDays = 5 + rnd(640);

  // 1) create the auth user → DB trigger auto-creates the profile row
  const { data: created, error: cErr } = await db.auth.admin.createUser({
    email,
    password: 'DemoPass!' + (1000 + i),
    email_confirm: true,
    user_metadata: { first_name: first, last_name: last },
  });
  if (cErr) { console.warn(`skip ${email}: ${cErr.message}`); return; }
  const uid = created.user.id;

  // 2) enrich the profile (update, not insert — trigger already made the row)
  await db.from('profiles').update({
    first_name: first,
    last_name: last,
    plan: pick(PLANS),
    kyc_status: pick(KYC),
    two_fa_enabled: Math.random() < 0.4,
    avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${first}${last}${i}`,
  }).eq('id', uid);

  // 3) wallets (1–4 random chains)
  const nWallets = 1 + rnd(4);
  const chosen = [...CHAINS].sort(() => Math.random() - 0.5).slice(0, nWallets);
  const wallets = chosen.map(([chain, symbol]) => {
    const usd = money(0, 90000);
    return {
      user_id: uid, chain, symbol, address: fakeAddress(symbol),
      balance: Math.round((usd / (symbol === 'BTC' ? 64000 : symbol === 'ETH' ? 3400 : 120)) * 1e6) / 1e6,
      usd_value: usd, created_at: daysAgo(joinedDays),
    };
  });
  await db.from('wallets').insert(wallets);

  // 4) transactions (3–10)
  const nTx = 3 + rnd(8);
  const txs = Array.from({ length: nTx }, () => {
    const [, symbol] = pick(CHAINS);
    const usd = money(20, 15000);
    return {
      user_id: uid, type: pick(TX_TYPES), asset: symbol,
      amount: Math.round((usd / 1000) * 1e4) / 1e4, usd_value: usd,
      status: pick(TX_STATUS),
      from_address: fakeAddress(symbol), to_address: fakeAddress(symbol),
      tx_hash: '0x' + hex(64), fee: money(0.1, 12),
      created_at: daysAgo(rnd(joinedDays)),
    };
  });
  await db.from('transactions').insert(txs);

  // 5) stakes (0–2)
  const nStake = rnd(3);
  if (nStake) {
    const stakes = Array.from({ length: nStake }, () => {
      const [, symbol] = pick(CHAINS);
      const amount = money(50, 8000);
      const lock = pick([7, 30, 90, 180]);
      const start = rnd(joinedDays);
      return {
        user_id: uid, asset: symbol, amount,
        apy: money(3, 11), earned: money(0, amount * 0.08),
        status: pick(['active', 'active', 'unlocked']),
        lock_period_days: lock,
        started_at: daysAgo(start),
        unlock_at: daysAgo(start - lock),
        created_at: daysAgo(start),
      };
    });
    await db.from('stakes').insert(stakes);
  }

  return { email, name: `${first} ${last}` };
}

// ── run ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Seeding ${COUNT} synthetic demo users into ${URL} ...`);
  await purgeDemo();
  let ok = 0;
  for (let i = 1; i <= COUNT; i++) {
    const r = await seedUser(i);
    if (r) { ok++; process.stdout.write(`  + ${r.email} (${r.name})\n`); }
  }
  console.log(`\nDone. ${ok}/${COUNT} demo users created.`);
  console.log('Login to any with the password printed in the script (DemoPass!10XX), or just browse the admin/dashboard.');
})().catch((e) => { console.error(e); process.exit(1); });
