import { useState, useEffect } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { getTransactions, type Transaction } from '../../../services/transactions';

type TxType = 'receive' | 'send' | 'swap' | 'stake' | 'unstake' | 'buy';
type TxStatus = 'completed' | 'pending' | 'failed';

interface Tx {
  id: string;
  type: TxType;
  asset: string;
  amount: string;
  usd: string;
  status: TxStatus;
  date: string;
  hash: string;
  from?: string;
  to?: string;
}

const TYPE_COLORS: Record<TxType, { bg: string; color: string; label: string }> = {
  receive: { bg: 'rgba(0,200,150,0.1)', color: '#00C896', label: 'Receive' },
  send: { bg: 'rgba(255,59,92,0.1)', color: '#FF3B5C', label: 'Send' },
  swap: { bg: 'rgba(0,212,255,0.1)', color: '#00D4FF', label: 'Swap' },
  stake: { bg: 'rgba(168,85,247,0.1)', color: '#A855F7', label: 'Stake' },
  unstake: { bg: 'rgba(240,180,41,0.1)', color: '#F0B429', label: 'Unstake' },
  buy: { bg: 'rgba(0,200,150,0.1)', color: '#00C896', label: 'Buy' },
};

const STATUS_STYLES: Record<TxStatus, { color: string; label: string }> = {
  completed: { color: '#00C896', label: 'Completed' },
  pending: { color: '#F0B429', label: 'Pending' },
  failed: { color: '#FF3B5C', label: 'Failed' },
};

export function Transactions() {
  const { t } = useLang();
  const { user } = useAuth();
  const d = t.dashboard.transactions;
  const [filter, setFilter] = useState<TxType | 'all'>('all');
  const [txList, setTxList] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions(user?.id ?? 'guest').then(data => {
      const walletTypes: Transaction['type'][] = ['send', 'receive', 'swap', 'stake', 'unstake', 'earn'];
      const mapped: Tx[] = data
        .filter(tx => walletTypes.includes(tx.type))
        .map((tx) => ({
          id: tx.id,
          type: (tx.type === 'earn' ? 'receive' : tx.type) as TxType,
          asset: tx.asset,
          amount: `${tx.type === 'receive' || tx.type === 'earn' ? '+' : tx.type === 'send' ? '-' : ''}${tx.amount} ${tx.asset.split('→')[0]}`,
          usd: `${tx.type === 'receive' || tx.type === 'earn' ? '+' : tx.type === 'send' ? '-' : ''}$${tx.usdValue.toLocaleString('en', { maximumFractionDigits: 0 })}`,
          status: tx.status,
          date: new Date(tx.createdAt).toLocaleString('en', { dateStyle: 'short', timeStyle: 'short' }),
          hash: tx.txHash ?? `${tx.id.slice(0, 6)}...`,
          from: tx.fromAddress ?? undefined,
          to: tx.toAddress ?? undefined,
        }));
      setTxList(mapped);
      setLoading(false);
    });
  }, [user?.id]);

  const filtered = filter === 'all' ? txList : txList.filter(tx => tx.type === filter);

  if (loading) {
    return <div style={{ color: '#5A7A9C', fontSize: 13 }}>Loading transactions…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header + controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div style={{ fontSize: 18, fontWeight: 700, color: '#E8F0FE' }}>{d.title}</div>
        <div className="flex gap-2">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
            {(['all', 'receive', 'send', 'swap', 'stake', 'buy'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-lg capitalize transition-all duration-150"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  background: filter === f ? 'rgba(0,212,255,0.12)' : 'transparent',
                  color: filter === f ? '#00D4FF' : '#5A7A9C',
                }}
              >
                {f === 'all' ? d.filter : TYPE_COLORS[f as TxType]?.label ?? f}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)', color: '#5A7A9C', fontSize: 12 }}
          >
            <Download size={13} />
            {d.export}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
        {/* Desktop table header */}
        <div
          className="hidden md:grid px-5 py-3"
          style={{
            gridTemplateColumns: '140px 1fr 140px 100px 180px 140px',
            borderBottom: '1px solid rgba(0,212,255,0.08)',
            fontSize: 11,
            fontWeight: 700,
            color: '#5A7A9C',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          <span>{d.type}</span>
          <span>{d.asset}</span>
          <span className="text-right">{d.amount}</span>
          <span className="text-center">{d.status}</span>
          <span className="text-right">{d.date}</span>
          <span className="text-right">{d.hash}</span>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-6 text-center" style={{ color: '#5A7A9C', fontSize: 13 }}>No transactions yet.</div>
        )}

        {/* Rows */}
        {filtered.map((tx, i) => {
          const typeStyle = TYPE_COLORS[tx.type];
          const statusStyle = STATUS_STYLES[tx.status];
          return (
            <div
              key={tx.id}
              className="md:grid px-5 py-3.5 transition-colors duration-150"
              style={{
                gridTemplateColumns: '140px 1fr 140px 100px 180px 140px',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex items-center gap-2" style={{ flex: '1 0 120px' }}>
                <span
                  className="px-2.5 py-0.5 rounded-lg"
                  style={{ background: typeStyle.bg, color: typeStyle.color, fontSize: 11, fontWeight: 700 }}
                >
                  {typeStyle.label}
                </span>
              </div>
              <div className="flex items-center" style={{ flex: '1 0 100px', fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>
                {tx.asset}
              </div>
              <div className="flex flex-col items-end" style={{ flex: '0 0 130px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: tx.type === 'send' ? '#FF3B5C' : tx.type === 'receive' || tx.type === 'buy' ? '#00C896' : '#E8F0FE' }}>
                  {tx.amount}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A7A9C' }}>{tx.usd}</span>
              </div>
              <div className="flex items-center justify-center" style={{ flex: '0 0 90px' }}>
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{ fontSize: 11, color: statusStyle.color, background: statusStyle.color + '15' }}
                >
                  {statusStyle.label}
                </span>
              </div>
              <div className="flex items-center justify-end" style={{ flex: '0 0 160px', fontSize: 12, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>
                {tx.date}
              </div>
              <div className="flex items-center justify-end gap-1" style={{ flex: '0 0 120px' }}>
                <span style={{ fontSize: 12, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>{tx.hash}</span>
                <ExternalLink size={11} style={{ color: '#5A7A9C' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: '#5A7A9C', textAlign: 'center' }}>
        Showing {filtered.length} of {txList.length} transactions
      </div>
    </div>
  );
}
