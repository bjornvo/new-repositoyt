# Demo seed

Fills the database with synthetic users + wallets, transactions and stakes so the
dashboard and admin views are populated and clickable for a demo / design review.

Everything it creates is fake: emails end in `@novacrypt.test`, balances and
statuses are randomized. No real users are touched.

## Run

You need your project URL and the **service_role** key (Supabase → Project
Settings → API → "service_role"). This key is admin-level — use it only in your
local shell for this one run, never commit it or put it in client code / Vercel
client env.

```bash
# from the project root
SUPABASE_URL="https://YOUR-REF.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
SEED_COUNT=24 \
node scripts/seed.mjs
```

`SEED_COUNT` is optional (default 24).

## Re-running

Safe to run again — it first deletes previously seeded `@novacrypt.test` users
(which cascades to their wallets/transactions/stakes) and recreates a fresh set.

## What it does NOT do

It only generates synthetic demo data. It is not an operator tool and performs
no balance/KYC operations against real user accounts.
