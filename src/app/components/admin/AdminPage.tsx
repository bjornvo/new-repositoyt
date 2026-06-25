import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, ArrowLeftRight, Settings, Shield,
  Megaphone, TrendingUp, TrendingDown, Activity, AlertTriangle,
  Search, Filter, Ban, CheckCircle, XCircle, Eye, Download,
  DollarSign, Globe, Sliders, LogOut, Bell, Lock, Pencil, X,
  UserPlus, Trash2, Receipt,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminStats, getAdminUsers, getAdminTransactions, toggleUserSuspension,
  updateKycStatus, adjustUserBalance, createUser, deleteUser, logManualTransaction,
  getAnnouncements, createAnnouncement, toggleAnnouncement, deleteAnnouncement,
  getPlatformSettings, updatePlatformSettings,
  getUserDetail, updateUserProfile, updateWallet, updateCard, deleteCard, updateTransaction, deleteTransaction,
  createWallet, createCard, createTransaction,
  type AdminStats, type AdminUser, type AdminTransaction, type Announcement, type PlatformSettings,
  type AdminUserDetail, type AdminWallet, type AdminCard, type AdminUserTransaction,
} from '../../../services/admin';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';

// ─── Illustrative-only data (no backing table; not safe/worth modeling for a demo) ──
const revenueData = [
  { d: 'Jan', rev: 184000 }, { d: 'Feb', rev: 210000 }, { d: 'Mar', rev: 198000 },
  { d: 'Apr', rev: 265000 }, { d: 'May', rev: 312000 }, { d: 'Jun', rev: 289000 },
  { d: 'Jul', rev: 348000 }, { d: 'Aug', rev: 391000 }, { d: 'Sep', rev: 412000 },
  { d: 'Oct', rev: 445000 }, { d: 'Nov', rev: 489000 }, { d: 'Dec', rev: 521000 },
];

const volumeData = [
  { h: '00', v: 2.1 }, { h: '02', v: 1.4 }, { h: '04', v: 0.9 },
  { h: '06', v: 1.8 }, { h: '08', v: 4.2 }, { h: '10', v: 6.8 },
  { h: '12', v: 8.4 }, { h: '14', v: 7.2 }, { h: '16', v: 9.1 },
  { h: '18', v: 7.8 }, { h: '20', v: 5.4 }, { h: '22', v: 3.2 },
];

const ALERTS = [
  { id: 1, level: 'critical', msg: 'Large withdrawal flagged — review the Transactions tab', time: 'recent' },
  { id: 2, level: 'info', msg: 'KYC queue: check the Users tab for pending verifications', time: '' },
];

const SYSTEM_SERVICES = [
  { name: 'API Gateway', status: 'operational', latency: '12ms', uptime: '99.98%' },
  { name: 'Trading Engine', status: 'operational', latency: '4ms', uptime: '99.99%' },
  { name: 'Custody Vault', status: 'operational', latency: '82ms', uptime: '100%' },
  { name: 'KYC Service', status: 'degraded', latency: '1240ms', uptime: '98.2%' },
  { name: 'Card Processor', status: 'operational', latency: '210ms', uptime: '99.95%' },
  { name: 'Email / Notify', status: 'operational', latency: '340ms', uptime: '99.91%' },
];

function formatBalance(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

type AdminTab = 'overview' | 'users' | 'transactions' | 'system' | 'announcements' | 'settings';

const STATUS_COLOR: Record<string, string> = { operational: '#00C896', degraded: '#F0B429', outage: '#FF3B5C' };
const KYC_COLOR: Record<string, string> = { verified: '#00C896', pending: '#F0B429', rejected: '#FF3B5C' };
const ALERT_COLOR: Record<string, string> = { critical: '#FF3B5C', warning: '#F0B429', info: '#00D4FF' };

// ─── Access gate ──────────────────────────────────────────────────────────────
function AccessMessage({ icon: Icon, title, body, action }: { icon: React.ElementType; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#030810' }}>
      <div className="p-8 rounded-2xl w-full max-w-sm text-center" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.15)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
          <Icon size={24} style={{ color: '#F0B429' }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#E8F0FE' }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#5A7A9C', marginTop: 8 }}>{body}</p>
        {action}
      </div>
    </div>
  );
}

// ─── Main Admin ────────────────────────────────────────────────────────────────
export function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [userSearch, setUserSearch] = useState('');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnBody, setNewAnnBody] = useState('');
  const [newAnnType, setNewAnnType] = useState<'info' | 'warning' | 'maintenance'>('info');

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ firstName: '', lastName: '', email: '', password: '', plan: 'starter' as 'starter' | 'pro' | 'institutional' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [txUser, setTxUser] = useState<AdminUser | null>(null);
  const [txForm, setTxForm] = useState({ type: 'receive' as 'send' | 'receive' | 'stake' | 'unstake' | 'earn', symbol: 'USDC', amount: '', status: 'completed' as 'completed' | 'pending' | 'failed' });
  const [loggingTx, setLoggingTx] = useState(false);
  const [txError, setTxError] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [detailUser, setDetailUser] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'profile' | 'wallets' | 'cards' | 'transactions'>('profile');
  const [detailSavingKey, setDetailSavingKey] = useState<string | null>(null);
  const [detailError, setDetailError] = useState('');

  const [newWalletForm, setNewWalletForm] = useState({ chain: '', symbol: '', balance: '0', usdValue: '0' });
  const [newCardForm, setNewCardForm] = useState({ type: 'virtual' as 'virtual' | 'physical', holderName: '', number: '', expiry: '', cvv: '', balance: '0', spent: '0', cardLimit: '5000' });
  const [newTxForm2, setNewTxForm2] = useState({ type: 'receive', asset: '', amount: '', usdValue: '', status: 'completed' });

  const isAdmin = Boolean(user?.isAdmin);

  useEffect(() => {
    if (!isAdmin) return;
    getAdminStats().then(setStats);
    getAdminUsers().then(r => { setUsers(r.users); setUsersTotal(r.total); });
    getAdminTransactions().then(setTransactions);
    getAnnouncements().then(setAnnouncements);
    getPlatformSettings().then(setSettings);
  }, [isAdmin]);

  // KYC: optimistic UI update, then persist.
  async function handleKyc(u: AdminUser, status: AdminUser['kycStatus']) {
    setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, kycStatus: status } : x)));
    setSavingId(u.id);
    try {
      await updateKycStatus(u.id, status);
    } catch {
      setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, kycStatus: u.kycStatus } : x)));
    } finally {
      setSavingId(null);
    }
  }

  function openBalanceEditor(u: AdminUser) {
    setEditUser(u);
    setEditValue(String(Math.round(u.balanceUsd)));
  }

  async function handleBalanceSave() {
    if (!editUser) return;
    const value = Number(editValue);
    if (!Number.isFinite(value) || value < 0) return;
    const target = editUser;
    setUsers(prev => prev.map(u => (u.id === target.id ? { ...u, balanceUsd: value } : u)));
    setEditUser(null);
    setSavingId(target.id);
    try {
      await adjustUserBalance(target.id, value);
    } catch {
      setUsers(prev => prev.map(u => (u.id === target.id ? { ...u, balanceUsd: target.balanceUsd } : u)));
    } finally {
      setSavingId(null);
    }
  }

  async function toggleSuspend(u: AdminUser) {
    const next = !u.isSuspended;
    setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, isSuspended: next } : x)));
    try {
      await toggleUserSuspension(u.id, next);
    } catch {
      setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, isSuspended: u.isSuspended } : x)));
    }
  }

  function refreshUsers() {
    getAdminUsers().then(r => { setUsers(r.users); setUsersTotal(r.total); });
  }

  async function handleCreateUser() {
    const { firstName, lastName, email, password, plan } = newUserForm;
    if (!firstName || !email || password.length < 8) {
      setCreateError('First name, email, and an 8+ character password are required.');
      return;
    }
    setCreateError('');
    setCreating(true);
    try {
      await createUser({ firstName, lastName, email, password, plan });
      setCreateOpen(false);
      setNewUserForm({ firstName: '', lastName: '', email: '', password: '', plan: 'starter' });
      refreshUsers();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteUser(u: AdminUser) {
    if (!window.confirm(`Permanently delete ${u.firstName} ${u.lastName} (${u.email})? This deletes their wallets, transactions, stakes and cards too. This cannot be undone.`)) return;
    setDeletingId(u.id);
    try {
      await deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setUsersTotal(t => t - 1);
    } catch (err: unknown) {
      window.alert(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogTransaction() {
    if (!txUser) return;
    const amount = parseFloat(txForm.amount);
    if (!amount || amount <= 0) { setTxError('Enter a valid amount.'); return; }
    setTxError('');
    setLoggingTx(true);
    try {
      await logManualTransaction(txUser.id, { type: txForm.type, symbol: txForm.symbol.toUpperCase(), amount, status: txForm.status });
      setTxUser(null);
      setTxForm({ type: 'receive', symbol: 'USDC', amount: '', status: 'completed' });
      refreshUsers();
      getAdminTransactions().then(setTransactions);
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : 'Failed to log transaction.');
    } finally {
      setLoggingTx(false);
    }
  }

  async function openUserDetail(u: AdminUser) {
    setDetailTab('profile');
    setDetailError('');
    setDetailLoading(true);
    setDetailUser(null);
    setNewWalletForm({ chain: '', symbol: '', balance: '0', usdValue: '0' });
    setNewCardForm({ type: 'virtual', holderName: '', number: '', expiry: '', cvv: '', balance: '0', spent: '0', cardLimit: '5000' });
    setNewTxForm2({ type: 'receive', asset: '', amount: '', usdValue: '', status: 'completed' });
    try {
      const detail = await getUserDetail(u.id);
      setDetailUser(detail);
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load user.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAddWallet() {
    if (!detailUser) return;
    if (!newWalletForm.chain.trim() || !newWalletForm.symbol.trim()) { setDetailError('Chain and symbol are required.'); return; }
    setDetailSavingKey('new-wallet');
    setDetailError('');
    try {
      const wallet = await createWallet(detailUser.id, newWalletForm.chain.toUpperCase(), newWalletForm.symbol.toUpperCase(), Number(newWalletForm.balance) || 0, Number(newWalletForm.usdValue) || 0);
      setDetailUser(prev => prev && { ...prev, wallets: [...prev.wallets, wallet] });
      setNewWalletForm({ chain: '', symbol: '', balance: '0', usdValue: '0' });
      refreshUsers();
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to add wallet.');
    } finally {
      setDetailSavingKey(null);
    }
  }

  async function handleAddCard() {
    if (!detailUser) return;
    if (!newCardForm.holderName.trim() || !newCardForm.number.trim() || !newCardForm.expiry.trim() || !newCardForm.cvv.trim()) {
      setDetailError('Holder name, number, expiry and CVV are required.');
      return;
    }
    setDetailSavingKey('new-card');
    setDetailError('');
    try {
      const card = await createCard(detailUser.id, {
        type: newCardForm.type, holderName: newCardForm.holderName, number: newCardForm.number, expiry: newCardForm.expiry, cvv: newCardForm.cvv,
        balance: Number(newCardForm.balance) || 0, spent: Number(newCardForm.spent) || 0, cardLimit: Number(newCardForm.cardLimit) || 5000,
      });
      setDetailUser(prev => prev && { ...prev, cards: [...prev.cards, card] });
      setNewCardForm({ type: 'virtual', holderName: '', number: '', expiry: '', cvv: '', balance: '0', spent: '0', cardLimit: '5000' });
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to add card.');
    } finally {
      setDetailSavingKey(null);
    }
  }

  async function handleAddTx() {
    if (!detailUser) return;
    const amount = Number(newTxForm2.amount);
    if (!newTxForm2.asset.trim() || !amount || amount <= 0) { setDetailError('Asset and a positive amount are required.'); return; }
    setDetailSavingKey('new-tx');
    setDetailError('');
    try {
      const tx = await createTransaction(detailUser.id, {
        type: newTxForm2.type, asset: newTxForm2.asset.toUpperCase(), amount, usdValue: Number(newTxForm2.usdValue) || 0, status: newTxForm2.status,
      });
      setDetailUser(prev => prev && { ...prev, transactions: [tx, ...prev.transactions] });
      setNewTxForm2({ type: 'receive', asset: '', amount: '', usdValue: '', status: 'completed' });
      getAdminTransactions().then(setTransactions);
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to add transaction.');
    } finally {
      setDetailSavingKey(null);
    }
  }

  async function handleSaveProfile() {
    if (!detailUser) return;
    setDetailSavingKey('profile');
    setDetailError('');
    try {
      await updateUserProfile(detailUser.id, {
        firstName: detailUser.firstName, lastName: detailUser.lastName, plan: detailUser.plan,
        kycStatus: detailUser.kycStatus, twoFaEnabled: detailUser.twoFaEnabled, isSuspended: detailUser.isSuspended,
      });
      refreshUsers();
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setDetailSavingKey(null);
    }
  }

  function patchWallet(id: string, patch: Partial<AdminWallet>) {
    setDetailUser(prev => prev && { ...prev, wallets: prev.wallets.map(w => (w.id === id ? { ...w, ...patch } : w)) });
  }

  async function handleSaveWallet(w: AdminWallet) {
    setDetailSavingKey(`wallet-${w.id}`);
    setDetailError('');
    try {
      await updateWallet(w.id, w.balance, w.usdValue);
      refreshUsers();
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to save wallet.');
    } finally {
      setDetailSavingKey(null);
    }
  }

  function patchCard(id: string, patch: Partial<AdminCard>) {
    setDetailUser(prev => prev && { ...prev, cards: prev.cards.map(c => (c.id === id ? { ...c, ...patch } : c)) });
  }

  async function handleSaveCard(c: AdminCard) {
    setDetailSavingKey(`card-${c.id}`);
    setDetailError('');
    try {
      await updateCard(c.id, c);
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to save card.');
    } finally {
      setDetailSavingKey(null);
    }
  }

  async function handleDeleteCard(c: AdminCard) {
    if (!detailUser || !window.confirm('Delete this card permanently?')) return;
    setDetailSavingKey(`card-${c.id}`);
    try {
      await deleteCard(c.id);
      setDetailUser(prev => prev && { ...prev, cards: prev.cards.filter(x => x.id !== c.id) });
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to delete card.');
    } finally {
      setDetailSavingKey(null);
    }
  }

  function patchTx(id: string, patch: Partial<AdminUserTransaction>) {
    setDetailUser(prev => prev && { ...prev, transactions: prev.transactions.map(t => (t.id === id ? { ...t, ...patch } : t)) });
  }

  async function handleSaveTx(t: AdminUserTransaction) {
    setDetailSavingKey(`tx-${t.id}`);
    setDetailError('');
    try {
      await updateTransaction(t.id, { type: t.type, asset: t.asset, amount: t.amount, usdValue: t.usdValue, status: t.status });
      getAdminTransactions().then(setTransactions);
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to save transaction.');
    } finally {
      setDetailSavingKey(null);
    }
  }

  async function handleDeleteTx(t: AdminUserTransaction) {
    if (!detailUser || !window.confirm('Delete this transaction permanently?')) return;
    setDetailSavingKey(`tx-${t.id}`);
    try {
      await deleteTransaction(t.id);
      setDetailUser(prev => prev && { ...prev, transactions: prev.transactions.filter(x => x.id !== t.id) });
      getAdminTransactions().then(setTransactions);
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : 'Failed to delete transaction.');
    } finally {
      setDetailSavingKey(null);
    }
  }

  async function handlePublishAnnouncement() {
    if (!newAnnTitle || !newAnnBody || !user) return;
    const created = await createAnnouncement(user.id, { title: newAnnTitle, body: newAnnBody, type: newAnnType });
    setAnnouncements(prev => [created, ...prev]);
    setNewAnnTitle(''); setNewAnnBody('');
  }

  async function handleSaveSettings() {
    if (!settings) return;
    setSavingSettings(true);
    try {
      await updatePlatformSettings(settings);
    } finally {
      setSavingSettings(false);
    }
  }

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (authLoading) {
    return <AccessMessage icon={Lock} title="Loading…" body="Checking your session." />;
  }

  if (!user) {
    return (
      <AccessMessage
        icon={Lock}
        title="Sign in required"
        body="The admin panel is only available to signed-in administrators."
        action={
          <button onClick={() => navigate('/login')} className="w-full mt-5 py-3 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #F0B429, #FF8C00)', color: '#050B14', fontWeight: 700, fontSize: 14 }}>
            Go to Login
          </button>
        }
      />
    );
  }

  if (!isAdmin) {
    return (
      <AccessMessage
        icon={Shield}
        title="Access denied"
        body={`Signed in as ${user.email}, but this account doesn't have admin privileges.`}
        action={
          <button onClick={() => navigate('/dashboard')} className="w-full mt-5 py-3 rounded-xl"
            style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontWeight: 700, fontSize: 14 }}>
            Back to Dashboard
          </button>
        }
      />
    );
  }

  const NAV: { id: AdminTab; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { id: 'system', icon: Activity, label: 'System Health' },
    { id: 'announcements', icon: Megaphone, label: 'Announcements' },
    { id: 'settings', icon: Sliders, label: 'Platform Settings' },
  ];

  const OVERVIEW_STATS = stats ? [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: '#00D4FF' },
    { label: 'Platform Revenue', value: `$${stats.revenue.toLocaleString('en', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: '#00C896' },
    { label: 'Total Volume', value: `$${stats.totalVolume.toLocaleString('en', { maximumFractionDigits: 0 })}`, icon: ArrowLeftRight, color: '#F0B429' },
    { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Globe, color: '#A855F7' },
    { label: 'Total Staked (units)', value: stats.totalStaked.toLocaleString('en', { maximumFractionDigits: 0 }), icon: Shield, color: '#F0B429' },
    { label: 'New Users Today', value: stats.newUsersToday.toLocaleString(), icon: TrendingUp, color: '#FF3B5C' },
  ] : [];

  return (
    <div className="flex min-h-screen" style={{ background: '#030810' }}>
      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col sticky top-0 h-screen" style={{ background: '#070F1C', borderRight: '1px solid rgba(240,180,41,0.1)' }}>
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(240,180,41,0.08)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F0B429, #FF8C00)' }}>
            <Shield size={14} style={{ color: '#050B14' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#E8F0FE' }}>
              Nova<span style={{ color: '#F0B429' }}>Crypt</span>
            </div>
            <div style={{ fontSize: 10, color: '#F0B429', fontWeight: 700, letterSpacing: 1 }}>ADMIN PANEL</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, icon: Icon, label }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150"
                style={{
                  background: active ? 'rgba(240,180,41,0.1)' : 'transparent',
                  color: active ? '#F0B429' : '#5A7A9C',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#E8F0FE'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5A7A9C'; } }}
              >
                {active && <div className="absolute left-0 w-0.5 h-5 rounded-r-full" style={{ background: '#F0B429' }} />}
                <Icon size={16} />
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(240,180,41,0.06)' }}>
          <div className="px-3 py-2.5 mb-1" style={{ fontSize: 11, color: '#3A5A7C' }}>
            Logged in as <span style={{ color: '#F0B429' }}>{user.firstName || user.email}</span>
          </div>
          <button onClick={async () => { await logout(); navigate('/'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
            style={{ color: '#5A7A9C', fontSize: 13 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FF3B5C'; e.currentTarget.style.background = 'rgba(255,59,92,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5A7A9C'; e.currentTarget.style.background = 'transparent'; }}>
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center gap-4 px-6 py-4"
          style={{ background: 'rgba(3,8,16,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(240,180,41,0.08)' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#E8F0FE' }}>
              {NAV.find(n => n.id === tab)?.label}
            </div>
            <div style={{ fontSize: 12, color: '#5A7A9C' }}>NovaCrypt Admin · {new Date().toLocaleString()}</div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#0A1628', border: '1px solid rgba(240,180,41,0.1)' }}>
              <Bell size={15} style={{ color: '#5A7A9C' }} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#FF3B5C', border: '1.5px solid #030810' }} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.15)' }}>
              <Shield size={13} style={{ color: '#F0B429' }} />
              <span style={{ fontSize: 12, color: '#F0B429', fontWeight: 700 }}>ADMIN</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto space-y-5">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && stats && (
            <>
              {transactions.some(tx => tx.flagged) && (
                <div className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.25)' }}>
                  <AlertTriangle size={18} style={{ color: '#FF3B5C', flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#FF3B5C' }}>CRITICAL: </span>
                    <span style={{ fontSize: 13, color: '#E8F0FE' }}>
                      {transactions.filter(tx => tx.flagged).length} transaction(s) above ${(100_000).toLocaleString()} need review.
                    </span>
                  </div>
                  <button onClick={() => setTab('transactions')} className="ml-auto px-3 py-1 rounded-lg" style={{ background: 'rgba(255,59,92,0.15)', color: '#FF3B5C', fontSize: 11, fontWeight: 700 }}>
                    Review
                  </button>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {OVERVIEW_STATS.map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div style={{ fontSize: 12, color: '#5A7A9C' }}>{s.label}</div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + '14' }}>
                        <s.icon size={15} style={{ color: s.color }} />
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#E8F0FE' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 12 }}>Monthly Revenue ($) — illustrative</div>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F0B429" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#F0B429" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#5A7A9C' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#5A7A9C' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ background: '#0D1E35', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 8, fontSize: 11 }}
                          formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                        <Area type="monotone" dataKey="rev" name="revenue" stroke="#F0B429" strokeWidth={2} fill="url(#adminRev)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 12 }}>24h Trading Volume ($B) — illustrative</div>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeData}>
                        <XAxis dataKey="h" tick={{ fontSize: 10, fill: '#5A7A9C' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }}
                          formatter={(v: number) => [`$${v}B`, 'Volume']} />
                        <Bar dataKey="v" name="volume" fill="#00D4FF" radius={[3, 3, 0, 0]} opacity={0.75} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent alerts */}
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)', fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>
                  Security Alerts
                </div>
                {ALERTS.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3"
                    style={{ borderBottom: i < ALERTS.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ALERT_COLOR[a.level] }} />
                    <span style={{ fontSize: 13, color: '#E8F0FE', flex: 1 }}>{a.msg}</span>
                    <span style={{ fontSize: 11, color: '#5A7A9C', flexShrink: 0 }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-48"
                  style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                  <Search size={14} style={{ color: '#5A7A9C' }} />
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email or ID..."
                    className="bg-transparent outline-none flex-1"
                    style={{ fontSize: 13, color: '#E8F0FE' }} />
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl"
                  style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)', color: '#5A7A9C', fontSize: 12 }}>
                  <Filter size={13} /> Filter
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl"
                  style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)', color: '#5A7A9C', fontSize: 12 }}>
                  <Download size={13} /> Export CSV
                </button>
                <button onClick={() => { setCreateOpen(true); setCreateError(''); }} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF', fontSize: 12, fontWeight: 600 }}>
                  <UserPlus size={13} /> Add User
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div className="grid px-5 py-3"
                  style={{ gridTemplateColumns: '1fr 1fr 110px 90px 150px 130px',
                    borderBottom: '1px solid rgba(0,212,255,0.06)', fontSize: 11, fontWeight: 700, color: '#5A7A9C', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  <span>Name</span><span>Email</span>
                  <span>KYC</span><span>Plan</span><span>Balance</span><span>Actions</span>
                </div>
                {filteredUsers.map((u, i) => (
                  <div key={u.id} className="grid items-center px-5 py-3 transition-colors"
                    style={{ gridTemplateColumns: '1fr 1fr 110px 90px 150px 130px',
                      borderBottom: i < filteredUsers.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none',
                      opacity: savingId === u.id || deletingId === u.id ? 0.6 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: 11, color: '#5A7A9C' }}>Joined {new Date(u.createdAt).toLocaleDateString()}{u.isSuspended ? ' · Suspended' : ''}</div>
                    </div>
                    <span style={{ fontSize: 12, color: '#5A7A9C' }}>{u.email}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-center"
                        style={{ fontSize: 11, color: KYC_COLOR[u.kycStatus], background: KYC_COLOR[u.kycStatus] + '18', width: 'fit-content' }}>
                        {u.kycStatus}
                      </span>
                      {u.kycStatus !== 'verified' && (
                        <button onClick={() => handleKyc(u, 'verified')} disabled={savingId === u.id}
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(0,200,150,0.1)' }} title="Approve KYC">
                          <CheckCircle size={12} style={{ color: '#00C896' }} />
                        </button>
                      )}
                      {u.kycStatus !== 'rejected' && (
                        <button onClick={() => handleKyc(u, 'rejected')} disabled={savingId === u.id}
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255,59,92,0.1)' }} title="Reject KYC">
                          <XCircle size={12} style={{ color: '#FF3B5C' }} />
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: '#E8F0FE' }}>{u.plan}</span>
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', fontFamily: 'var(--font-mono)' }}>{formatBalance(u.balanceUsd)}</span>
                      <button onClick={() => openBalanceEditor(u)} disabled={savingId === u.id}
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(240,180,41,0.1)' }} title="Edit balance">
                        <Pencil size={11} style={{ color: '#F0B429' }} />
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openUserDetail(u)} className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(0,212,255,0.08)' }}
                        title="View / edit all details">
                        <Eye size={11} style={{ color: '#00D4FF' }} />
                      </button>
                      <button onClick={() => { setTxUser(u); setTxError(''); }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(168,85,247,0.1)' }} title="Log a manual transaction">
                        <Receipt size={11} style={{ color: '#A855F7' }} />
                      </button>
                      <button onClick={() => toggleSuspend(u)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: u.isSuspended ? 'rgba(0,200,150,0.08)' : 'rgba(255,59,92,0.08)' }}
                        title={u.isSuspended ? 'Activate' : 'Suspend'}>
                        {u.isSuspended
                          ? <CheckCircle size={11} style={{ color: '#00C896' }} />
                          : <Ban size={11} style={{ color: '#FF3B5C' }} />
                        }
                      </button>
                      <button onClick={() => handleDeleteUser(u)} disabled={deletingId === u.id}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(255,59,92,0.08)' }} title="Delete user">
                        <Trash2 size={11} style={{ color: '#FF3B5C' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#5A7A9C', textAlign: 'center' }}>
                Showing {filteredUsers.length} of {usersTotal} users
              </div>
              <p style={{ fontSize: 11, color: '#3A5A7C', textAlign: 'center' }}>
                Suspending a user here flags their profile; it doesn't yet revoke their login session (that requires a server-side admin key).
              </p>
            </>
          )}

          {/* ── TRANSACTIONS ── */}
          {tab === 'transactions' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-1">
                {[
                  { label: 'Transactions Loaded', value: String(transactions.length), color: '#00D4FF' },
                  { label: 'Total Volume (loaded)', value: `$${transactions.reduce((s, tx) => s + tx.amountUsd, 0).toLocaleString('en', { maximumFractionDigits: 0 })}`, color: '#00C896' },
                  { label: 'Flagged', value: String(transactions.filter(tx => tx.flagged).length), color: '#FF3B5C' },
                  { label: 'Pending', value: String(transactions.filter(tx => tx.status === 'pending').length), color: '#F0B429' },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                    <div style={{ fontSize: 11, color: '#5A7A9C', marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>Recent Transactions (all users)</span>
                  <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF', fontSize: 12 }}>
                    <Download size={12} /> Export
                  </button>
                </div>
                {transactions.length === 0 && (
                  <div className="px-5 py-6 text-center" style={{ color: '#5A7A9C', fontSize: 13 }}>No transactions yet.</div>
                )}
                {transactions.map((tx, i) => (
                  <div key={tx.id} className="grid items-center px-5 py-3 transition-colors"
                    style={{ gridTemplateColumns: '1fr 120px 130px 90px 100px 40px',
                      borderBottom: i < transactions.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#E8F0FE' }}>{tx.userLabel}</div>
                      <div style={{ fontSize: 11, color: '#5A7A9C' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg capitalize"
                      style={{ fontSize: 11, fontWeight: 700, background: 'rgba(0,212,255,0.08)', color: '#00D4FF', width: 'fit-content' }}>
                      {tx.type}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', fontFamily: 'var(--font-mono)' }}>${tx.amountUsd.toLocaleString('en', { maximumFractionDigits: 2 })}</span>
                    <span style={{ fontSize: 12, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>${tx.fee.toFixed(2)}</span>
                    <span className="px-2 py-0.5 rounded-full"
                      style={{ fontSize: 11, color: tx.status === 'completed' ? '#00C896' : tx.status === 'pending' ? '#F0B429' : '#FF3B5C',
                        background: (tx.status === 'completed' ? '#00C896' : tx.status === 'pending' ? '#F0B429' : '#FF3B5C') + '15', width: 'fit-content' }}>
                      {tx.status}
                    </span>
                    {tx.flagged && (
                      <div className="flex items-center justify-center">
                        <AlertTriangle size={14} style={{ color: '#FF3B5C' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── SYSTEM HEALTH ── */}
          {tab === 'system' && (
            <>
              <p style={{ fontSize: 11, color: '#3A5A7C' }}>
                Service status below is illustrative — there's no real infra behind this demo to monitor.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {SYSTEM_SERVICES.map((svc, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: '#0A1628', border: `1px solid ${STATUS_COLOR[svc.status]}20` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{svc.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[svc.status], boxShadow: `0 0 6px ${STATUS_COLOR[svc.status]}` }} />
                        <span style={{ fontSize: 11, color: STATUS_COLOR[svc.status], fontWeight: 600, textTransform: 'capitalize' }}>{svc.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <div style={{ fontSize: 10, color: '#5A7A9C' }}>Latency</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{svc.latency}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#5A7A9C' }}>Uptime</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: STATUS_COLOR[svc.status] }}>{svc.uptime}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 12 }}>API Response Time (ms) — illustrative</div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeData.map(dd => ({ ...dd, ms: Math.round(dd.v * 8 + 8) }))}>
                      <XAxis dataKey="h" tick={{ fontSize: 10, fill: '#5A7A9C' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#5A7A9C' }} axisLine={false} tickLine={false} />
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
                      <Tooltip contentStyle={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }}
                        formatter={(v: number) => [`${v}ms`, 'Latency']} />
                      <Line type="monotone" dataKey="ms" name="latency" stroke="#00D4FF" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* ── ANNOUNCEMENTS ── */}
          {tab === 'announcements' && (
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Create new */}
              <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE', marginBottom: 14 }}>Create Announcement</div>
                <div className="space-y-3">
                  <div>
                    <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>Type</label>
                    <div className="flex gap-2">
                      {(['info', 'warning', 'maintenance'] as const).map(t => (
                        <button key={t} onClick={() => setNewAnnType(t)}
                          className="px-3 py-1.5 rounded-lg capitalize transition-all text-xs font-semibold"
                          style={{ background: newAnnType === t ? 'rgba(0,212,255,0.12)' : '#0D1E35', border: `1px solid ${newAnnType === t ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.06)'}`, color: newAnnType === t ? '#00D4FF' : '#5A7A9C' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>Title</label>
                    <input value={newAnnTitle} onChange={e => setNewAnnTitle(e.target.value)} placeholder="Announcement title..."
                      className="w-full px-3 py-2.5 rounded-xl outline-none"
                      style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 13 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.3)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>Message</label>
                    <textarea value={newAnnBody} onChange={e => setNewAnnBody(e.target.value)} rows={3}
                      placeholder="Announcement body..."
                      className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
                      style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 13 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.3)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'} />
                  </div>
                  <button
                    onClick={handlePublishAnnouncement}
                    className="w-full py-2.5 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13 }}>
                    Publish Announcement
                  </button>
                </div>
              </div>

              {/* Existing */}
              <div className="space-y-3">
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>Announcements</div>
                {announcements.length === 0 && <p style={{ fontSize: 13, color: '#5A7A9C' }}>No announcements yet.</p>}
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 rounded-xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded capitalize"
                          style={{ fontSize: 10, fontWeight: 700, background: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>
                          {ann.type}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{ann.title}</span>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={async () => {
                            const next = !ann.active;
                            setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, active: next } : a));
                            await toggleAnnouncement(ann.id, next);
                          }}
                          className="relative w-9 h-5 rounded-full transition-all duration-300"
                          style={{ background: ann.active ? '#00D4FF' : 'rgba(255,255,255,0.1)' }}>
                          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                            style={{ left: ann.active ? 'calc(100% - 18px)' : 2 }} />
                        </button>
                        <button onClick={async () => {
                          setAnnouncements(prev => prev.filter(a => a.id !== ann.id));
                          await deleteAnnouncement(ann.id);
                        }} style={{ fontSize: 11, color: '#FF3B5C' }}>✕</button>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#5A7A9C', lineHeight: 1.6 }}>{ann.body}</p>
                    {!ann.active && <span style={{ fontSize: 11, color: '#5A7A9C' }}>● Hidden from users</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && settings && (
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Fee settings */}
              <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8F0FE', marginBottom: 14 }}>Fee Configuration (%)</div>
                <div className="space-y-3">
                  {[
                    { label: 'Spot Trading Fee', key: 'spotFeePct' as const },
                    { label: 'Withdrawal Fee', key: 'withdrawalFeePct' as const },
                    { label: 'Staking Platform Fee', key: 'stakingFeePct' as const },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>{f.label}</label>
                      <div className="flex items-center gap-2">
                        <input type="number" step="0.01" value={settings[f.key]}
                          onChange={e => setSettings({ ...settings, [f.key]: Number(e.target.value) })}
                          className="flex-1 px-3 py-2.5 rounded-xl outline-none"
                          style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14, fontFamily: 'var(--font-mono)' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.3)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'} />
                        <span style={{ color: '#5A7A9C', fontSize: 14 }}>%</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSaveSettings} disabled={savingSettings} className="w-full py-2.5 rounded-xl mt-2"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13, opacity: savingSettings ? 0.7 : 1 }}>
                    {savingSettings ? 'Saving…' : 'Save Fee Settings'}
                  </button>
                </div>
              </div>

              {/* Withdrawal limits */}
              <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8F0FE', marginBottom: 14 }}>Withdrawal Limits (USD)</div>
                <div className="space-y-3">
                  {[
                    { label: 'Daily Withdrawal Limit', key: 'dailyWithdrawLimit' as const },
                    { label: 'KYC Level 1 Limit', key: 'kycLevel1Limit' as const },
                    { label: 'KYC Level 2 Limit', key: 'kycLevel2Limit' as const },
                  ].map(l => (
                    <div key={l.key}>
                      <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>{l.label}</label>
                      <input type="number" value={settings[l.key]}
                        onChange={e => setSettings({ ...settings, [l.key]: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-xl outline-none"
                        style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14, fontFamily: 'var(--font-mono)' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.3)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'} />
                    </div>
                  ))}
                  <button onClick={handleSaveSettings} disabled={savingSettings} className="w-full py-2.5 rounded-xl mt-2"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13, opacity: savingSettings ? 0.7 : 1 }}>
                    {savingSettings ? 'Saving…' : 'Save Limit Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Balance edit modal ── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,8,16,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setEditUser(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}>
            <button onClick={() => setEditUser(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.06)' }}>
              <X size={14} style={{ color: '#5A7A9C' }} />
            </button>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
                <DollarSign size={16} style={{ color: '#F0B429' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#E8F0FE' }}>Edit balance</div>
                <div style={{ fontSize: 12, color: '#5A7A9C' }}>{editUser.firstName} {editUser.lastName}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#5A7A9C', margin: '14px 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              New total balance (USD)
            </div>
            <div className="flex items-center gap-2 px-3 py-3 rounded-xl mb-5"
              style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)' }}>
              <span style={{ color: '#5A7A9C', fontSize: 15 }}>$</span>
              <input autoFocus type="number" min="0" step="0.01" value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleBalanceSave(); }}
                className="bg-transparent outline-none flex-1"
                style={{ fontSize: 16, color: '#E8F0FE', fontFamily: 'var(--font-mono)' }} />
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setEditUser(null)}
                className="flex-1 py-2.5 rounded-xl"
                style={{ background: 'rgba(0,212,255,0.06)', color: '#5A7A9C', fontSize: 13, fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleBalanceSave}
                className="flex-1 py-2.5 rounded-xl"
                style={{ background: '#F0B429', color: '#0A1628', fontSize: 13, fontWeight: 700 }}>
                Save balance
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Create user modal ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,8,16,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setCreateOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}>
            <button onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.06)' }}>
              <X size={14} style={{ color: '#5A7A9C' }} />
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <UserPlus size={16} style={{ color: '#00D4FF' }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#E8F0FE' }}>Add user</div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input value={newUserForm.firstName} onChange={e => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                  placeholder="First name" className="px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }} />
                <input value={newUserForm.lastName} onChange={e => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                  placeholder="Last name" className="px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }} />
              </div>
              <input value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                type="email" placeholder="Email" className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }} />
              <input value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                type="text" placeholder="Temporary password (8+ chars)" className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13, fontFamily: 'var(--font-mono)' }} />
              <select value={newUserForm.plan} onChange={e => setNewUserForm({ ...newUserForm, plan: e.target.value as typeof newUserForm.plan })}
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }}>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="institutional">Institutional</option>
              </select>
              {createError && <p style={{ fontSize: 12, color: '#FF3B5C' }}>{createError}</p>}
              <p style={{ fontSize: 11, color: '#3A5A7C' }}>The user will be created and signed in immediately on their end if they use this password; share it with them out of band.</p>
              <div className="flex gap-2.5 pt-1">
                <button onClick={() => setCreateOpen(false)} className="flex-1 py-2.5 rounded-xl" style={{ background: 'rgba(0,212,255,0.06)', color: '#5A7A9C', fontSize: 13, fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={handleCreateUser} disabled={creating} className="flex-1 py-2.5 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontSize: 13, fontWeight: 700, opacity: creating ? 0.7 : 1 }}>
                  {creating ? 'Creating…' : 'Create user'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Log transaction modal ── */}
      {txUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,8,16,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setTxUser(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}>
            <button onClick={() => setTxUser(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.06)' }}>
              <X size={14} style={{ color: '#5A7A9C' }} />
            </button>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <Receipt size={16} style={{ color: '#A855F7' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#E8F0FE' }}>Log transaction</div>
                <div style={{ fontSize: 12, color: '#5A7A9C' }}>{txUser.firstName} {txUser.lastName}</div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <select value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value as typeof txForm.type })}
                  className="px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }}>
                  <option value="receive">Receive (credit)</option>
                  <option value="earn">Earn (credit)</option>
                  <option value="unstake">Unstake (credit)</option>
                  <option value="send">Send (debit)</option>
                  <option value="stake">Stake (debit)</option>
                </select>
                <input value={txForm.symbol} onChange={e => setTxForm({ ...txForm, symbol: e.target.value })}
                  placeholder="Asset (e.g. BTC)" className="px-3 py-2.5 rounded-xl outline-none uppercase"
                  style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13, fontFamily: 'var(--font-mono)' }} />
              </div>
              <input value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                type="number" placeholder="Amount (in asset units)" className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13, fontFamily: 'var(--font-mono)' }} />
              <select value={txForm.status} onChange={e => setTxForm({ ...txForm, status: e.target.value as typeof txForm.status })}
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }}>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <p style={{ fontSize: 11, color: '#3A5A7C' }}>Credits/debits the user's {txForm.symbol || 'asset'} wallet by this amount and records the entry on their Transactions page. Debits fail if the wallet balance is too low.</p>
              {txError && <p style={{ fontSize: 12, color: '#FF3B5C' }}>{txError}</p>}
              <div className="flex gap-2.5 pt-1">
                <button onClick={() => setTxUser(null)} className="flex-1 py-2.5 rounded-xl" style={{ background: 'rgba(0,212,255,0.06)', color: '#5A7A9C', fontSize: 13, fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={handleLogTransaction} disabled={loggingTx} className="flex-1 py-2.5 rounded-xl"
                  style={{ background: '#A855F7', color: '#fff', fontSize: 13, fontWeight: 700, opacity: loggingTx ? 0.7 : 1 }}>
                  {loggingTx ? 'Logging…' : 'Log transaction'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── User detail / full edit modal ── */}
      {(detailUser || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,8,16,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => { setDetailUser(null); setDetailLoading(false); }}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl p-6 relative max-h-[85vh] overflow-y-auto"
            style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}>
            <button onClick={() => { setDetailUser(null); setDetailLoading(false); }}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.06)' }}>
              <X size={14} style={{ color: '#5A7A9C' }} />
            </button>

            {detailLoading && <div style={{ color: '#5A7A9C', fontSize: 13 }}>Loading user…</div>}

            {detailUser && (
              <>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <Eye size={16} style={{ color: '#00D4FF' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#E8F0FE' }}>{detailUser.firstName} {detailUser.lastName}</div>
                    <div style={{ fontSize: 12, color: '#5A7A9C' }}>{detailUser.email}</div>
                  </div>
                </div>

                <div className="flex gap-1.5 mb-4">
                  {(['profile', 'wallets', 'cards', 'transactions'] as const).map(t => (
                    <button key={t} onClick={() => setDetailTab(t)}
                      className="px-3 py-1.5 rounded-lg capitalize text-xs font-semibold"
                      style={{ background: detailTab === t ? 'rgba(0,212,255,0.12)' : '#0D1E35', border: `1px solid ${detailTab === t ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.06)'}`, color: detailTab === t ? '#00D4FF' : '#5A7A9C' }}>
                      {t}
                    </button>
                  ))}
                </div>

                {detailError && <p style={{ fontSize: 12, color: '#FF3B5C', marginBottom: 10 }}>{detailError}</p>}

                {/* Profile */}
                {detailTab === 'profile' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label style={{ fontSize: 11, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>First name</label>
                        <input value={detailUser.firstName} onChange={e => setDetailUser({ ...detailUser, firstName: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl outline-none"
                          style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>Last name</label>
                        <input value={detailUser.lastName} onChange={e => setDetailUser({ ...detailUser, lastName: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl outline-none"
                          style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label style={{ fontSize: 11, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>Plan</label>
                        <select value={detailUser.plan} onChange={e => setDetailUser({ ...detailUser, plan: e.target.value as AdminUserDetail['plan'] })}
                          className="w-full px-3 py-2.5 rounded-xl outline-none"
                          style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }}>
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="institutional">Institutional</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>KYC status</label>
                        <select value={detailUser.kycStatus} onChange={e => setDetailUser({ ...detailUser, kycStatus: e.target.value as AdminUserDetail['kycStatus'] })}
                          className="w-full px-3 py-2.5 rounded-xl outline-none"
                          style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.12)', color: '#E8F0FE', fontSize: 13 }}>
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 pt-1">
                      <label className="flex items-center gap-2" style={{ fontSize: 12, color: '#5A7A9C' }}>
                        <input type="checkbox" checked={detailUser.twoFaEnabled} onChange={e => setDetailUser({ ...detailUser, twoFaEnabled: e.target.checked })} />
                        2FA enabled
                      </label>
                      <label className="flex items-center gap-2" style={{ fontSize: 12, color: '#5A7A9C' }}>
                        <input type="checkbox" checked={detailUser.isSuspended} onChange={e => setDetailUser({ ...detailUser, isSuspended: e.target.checked })} />
                        Suspended
                      </label>
                    </div>
                    <button onClick={handleSaveProfile} disabled={detailSavingKey === 'profile'}
                      className="w-full py-2.5 rounded-xl mt-2"
                      style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13, opacity: detailSavingKey === 'profile' ? 0.7 : 1 }}>
                      {detailSavingKey === 'profile' ? 'Saving…' : 'Save profile'}
                    </button>
                  </div>
                )}

                {/* Wallets */}
                {detailTab === 'wallets' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl" style={{ background: '#0D1E35', border: '1px dashed rgba(0,212,255,0.2)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#E8F0FE', marginBottom: 8 }}>Add wallet</div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input value={newWalletForm.chain} onChange={e => setNewWalletForm({ ...newWalletForm, chain: e.target.value })} placeholder="Chain (e.g. BTC)"
                          className="px-2.5 py-2 rounded-lg outline-none uppercase" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        <input value={newWalletForm.symbol} onChange={e => setNewWalletForm({ ...newWalletForm, symbol: e.target.value })} placeholder="Symbol (e.g. BTC)"
                          className="px-2.5 py-2 rounded-lg outline-none uppercase" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="number" step="0.00000001" value={newWalletForm.balance} onChange={e => setNewWalletForm({ ...newWalletForm, balance: e.target.value })} placeholder="Balance"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        <input type="number" step="0.01" value={newWalletForm.usdValue} onChange={e => setNewWalletForm({ ...newWalletForm, usdValue: e.target.value })} placeholder="USD value"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                      </div>
                      <button onClick={handleAddWallet} disabled={detailSavingKey === 'new-wallet'}
                        className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,200,150,0.12)', color: '#00C896', fontSize: 11, fontWeight: 700 }}>
                        {detailSavingKey === 'new-wallet' ? 'Adding…' : '+ Add wallet'}
                      </button>
                    </div>
                    {detailUser.wallets.length === 0 && <p style={{ fontSize: 13, color: '#5A7A9C' }}>No wallets yet.</p>}
                    {detailUser.wallets.map(w => (
                      <div key={w.id} className="p-3 rounded-xl" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.08)' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#E8F0FE', marginBottom: 8 }}>{w.symbol} <span style={{ color: '#5A7A9C' }}>· {w.chain}</span></div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label style={{ fontSize: 10, color: '#5A7A9C', display: 'block', marginBottom: 3 }}>Balance ({w.symbol})</label>
                            <input type="number" step="0.00000001" value={w.balance}
                              onChange={e => patchWallet(w.id, { balance: Number(e.target.value) })}
                              className="w-full px-2.5 py-2 rounded-lg outline-none"
                              style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: '#5A7A9C', display: 'block', marginBottom: 3 }}>USD value</label>
                            <input type="number" step="0.01" value={w.usdValue}
                              onChange={e => patchWallet(w.id, { usdValue: Number(e.target.value) })}
                              className="w-full px-2.5 py-2 rounded-lg outline-none"
                              style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                          </div>
                        </div>
                        <button onClick={() => handleSaveWallet(w)} disabled={detailSavingKey === `wallet-${w.id}`}
                          className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: 11, fontWeight: 700 }}>
                          {detailSavingKey === `wallet-${w.id}` ? 'Saving…' : 'Save wallet'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cards */}
                {detailTab === 'cards' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl" style={{ background: '#0D1E35', border: '1px dashed rgba(0,212,255,0.2)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#E8F0FE' }}>Add card</div>
                        <select value={newCardForm.type} onChange={e => setNewCardForm({ ...newCardForm, type: e.target.value as 'virtual' | 'physical' })}
                          className="px-2 py-1 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 11 }}>
                          <option value="virtual">Virtual</option>
                          <option value="physical">Physical</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input value={newCardForm.holderName} onChange={e => setNewCardForm({ ...newCardForm, holderName: e.target.value })} placeholder="Holder name"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12 }} />
                        <input value={newCardForm.number} onChange={e => setNewCardForm({ ...newCardForm, number: e.target.value })} placeholder="Card number"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        <input value={newCardForm.expiry} onChange={e => setNewCardForm({ ...newCardForm, expiry: e.target.value })} placeholder="MM/YY"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        <input value={newCardForm.cvv} onChange={e => setNewCardForm({ ...newCardForm, cvv: e.target.value })} placeholder="CVV"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <input type="number" step="0.01" value={newCardForm.balance} onChange={e => setNewCardForm({ ...newCardForm, balance: e.target.value })} placeholder="Balance"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        <input type="number" step="0.01" value={newCardForm.spent} onChange={e => setNewCardForm({ ...newCardForm, spent: e.target.value })} placeholder="Spent"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        <input type="number" step="0.01" value={newCardForm.cardLimit} onChange={e => setNewCardForm({ ...newCardForm, cardLimit: e.target.value })} placeholder="Limit"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                      </div>
                      <button onClick={handleAddCard} disabled={detailSavingKey === 'new-card'}
                        className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,200,150,0.12)', color: '#00C896', fontSize: 11, fontWeight: 700 }}>
                        {detailSavingKey === 'new-card' ? 'Adding…' : '+ Add card'}
                      </button>
                    </div>
                    {detailUser.cards.length === 0 && <p style={{ fontSize: 13, color: '#5A7A9C' }}>No cards yet.</p>}
                    {detailUser.cards.map(c => (
                      <div key={c.id} className="p-3 rounded-xl" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.08)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#E8F0FE', textTransform: 'capitalize' }}>{c.type} card</span>
                          <label className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#5A7A9C' }}>
                            <input type="checkbox" checked={c.frozen} onChange={e => patchCard(c.id, { frozen: e.target.checked })} />
                            Frozen
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input value={c.holderName} onChange={e => patchCard(c.id, { holderName: e.target.value })} placeholder="Holder name"
                            className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12 }} />
                          <input value={c.number} onChange={e => patchCard(c.id, { number: e.target.value })} placeholder="Card number"
                            className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                          <input value={c.expiry} onChange={e => patchCard(c.id, { expiry: e.target.value })} placeholder="MM/YY"
                            className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                          <input value={c.cvv} onChange={e => patchCard(c.id, { cvv: e.target.value })} placeholder="CVV"
                            className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <label style={{ fontSize: 10, color: '#5A7A9C', display: 'block', marginBottom: 3 }}>Balance</label>
                            <input type="number" step="0.01" value={c.balance} onChange={e => patchCard(c.id, { balance: Number(e.target.value) })}
                              className="w-full px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: '#5A7A9C', display: 'block', marginBottom: 3 }}>Spent</label>
                            <input type="number" step="0.01" value={c.spent} onChange={e => patchCard(c.id, { spent: Number(e.target.value) })}
                              className="w-full px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: '#5A7A9C', display: 'block', marginBottom: 3 }}>Limit</label>
                            <input type="number" step="0.01" value={c.cardLimit} onChange={e => patchCard(c.id, { cardLimit: Number(e.target.value) })}
                              className="w-full px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveCard(c)} disabled={detailSavingKey === `card-${c.id}`}
                            className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: 11, fontWeight: 700 }}>
                            {detailSavingKey === `card-${c.id}` ? 'Saving…' : 'Save card'}
                          </button>
                          <button onClick={() => handleDeleteCard(c)} disabled={detailSavingKey === `card-${c.id}`}
                            className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,59,92,0.1)', color: '#FF3B5C', fontSize: 11, fontWeight: 700 }}>
                            Delete card
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Transactions */}
                {detailTab === 'transactions' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl" style={{ background: '#0D1E35', border: '1px dashed rgba(0,212,255,0.2)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#E8F0FE', marginBottom: 8 }}>Add transaction</div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <select value={newTxForm2.type} onChange={e => setNewTxForm2({ ...newTxForm2, type: e.target.value })}
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12 }}>
                          <option value="send">Send</option>
                          <option value="receive">Receive</option>
                          <option value="swap">Swap</option>
                          <option value="stake">Stake</option>
                          <option value="unstake">Unstake</option>
                          <option value="earn">Earn</option>
                        </select>
                        <input value={newTxForm2.asset} onChange={e => setNewTxForm2({ ...newTxForm2, asset: e.target.value })} placeholder="Asset (e.g. BTC)"
                          className="px-2.5 py-2 rounded-lg outline-none uppercase" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <input type="number" step="0.00000001" value={newTxForm2.amount} onChange={e => setNewTxForm2({ ...newTxForm2, amount: e.target.value })} placeholder="Amount"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        <input type="number" step="0.01" value={newTxForm2.usdValue} onChange={e => setNewTxForm2({ ...newTxForm2, usdValue: e.target.value })} placeholder="USD value"
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        <select value={newTxForm2.status} onChange={e => setNewTxForm2({ ...newTxForm2, status: e.target.value })}
                          className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12 }}>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      <p style={{ fontSize: 10, color: '#3A5A7C', marginBottom: 8 }}>Adds a raw record without touching wallet balances. Use the purple "Log transaction" action from the Users list if it should also credit/debit a wallet.</p>
                      <button onClick={handleAddTx} disabled={detailSavingKey === 'new-tx'}
                        className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,200,150,0.12)', color: '#00C896', fontSize: 11, fontWeight: 700 }}>
                        {detailSavingKey === 'new-tx' ? 'Adding…' : '+ Add transaction'}
                      </button>
                    </div>
                    {detailUser.transactions.length === 0 && <p style={{ fontSize: 13, color: '#5A7A9C' }}>No transactions yet.</p>}
                    {detailUser.transactions.map(t => (
                      <div key={t.id} className="p-3 rounded-xl" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.08)' }}>
                        <div style={{ fontSize: 11, color: '#5A7A9C', marginBottom: 8 }}>{new Date(t.createdAt).toLocaleString()}</div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <select value={t.type} onChange={e => patchTx(t.id, { type: e.target.value })}
                            className="px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12 }}>
                            <option value="send">Send</option>
                            <option value="receive">Receive</option>
                            <option value="swap">Swap</option>
                            <option value="stake">Stake</option>
                            <option value="unstake">Unstake</option>
                            <option value="earn">Earn</option>
                          </select>
                          <input value={t.asset} onChange={e => patchTx(t.id, { asset: e.target.value })} placeholder="Asset"
                            className="px-2.5 py-2 rounded-lg outline-none uppercase" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <label style={{ fontSize: 10, color: '#5A7A9C', display: 'block', marginBottom: 3 }}>Amount</label>
                            <input type="number" step="0.00000001" value={t.amount} onChange={e => patchTx(t.id, { amount: Number(e.target.value) })}
                              className="w-full px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: '#5A7A9C', display: 'block', marginBottom: 3 }}>USD value</label>
                            <input type="number" step="0.01" value={t.usdValue} onChange={e => patchTx(t.id, { usdValue: Number(e.target.value) })}
                              className="w-full px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: '#5A7A9C', display: 'block', marginBottom: 3 }}>Status</label>
                            <select value={t.status} onChange={e => patchTx(t.id, { status: e.target.value })}
                              className="w-full px-2.5 py-2 rounded-lg outline-none" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 12 }}>
                              <option value="completed">Completed</option>
                              <option value="pending">Pending</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveTx(t)} disabled={detailSavingKey === `tx-${t.id}`}
                            className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: 11, fontWeight: 700 }}>
                            {detailSavingKey === `tx-${t.id}` ? 'Saving…' : 'Save'}
                          </button>
                          <button onClick={() => handleDeleteTx(t)} disabled={detailSavingKey === `tx-${t.id}`}
                            className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,59,92,0.1)', color: '#FF3B5C', fontSize: 11, fontWeight: 700 }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
