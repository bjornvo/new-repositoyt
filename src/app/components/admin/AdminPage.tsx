import { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Users, ArrowLeftRight, Settings, Shield,
  Megaphone, TrendingUp, TrendingDown, Activity, AlertTriangle,
  Search, Filter, Ban, CheckCircle, XCircle, Eye, MoreVertical, Download,
  DollarSign, Globe, Sliders, LogOut, Bell, Lock, Pencil, X
} from 'lucide-react';
import { updateKycStatus, adjustUserBalance } from '../../../services/admin';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';

// ─── Mock data ────────────────────────────────────────────────────────────────
const revenueData = [
  { d: 'Jan', rev: 184000, users: 1820 }, { d: 'Feb', rev: 210000, users: 2100 },
  { d: 'Mar', rev: 198000, users: 2340 }, { d: 'Apr', rev: 265000, users: 2890 },
  { d: 'May', rev: 312000, users: 3210 }, { d: 'Jun', rev: 289000, users: 3560 },
  { d: 'Jul', rev: 348000, users: 3920 }, { d: 'Aug', rev: 391000, users: 4180 },
  { d: 'Sep', rev: 412000, users: 4620 }, { d: 'Oct', rev: 445000, users: 4980 },
  { d: 'Nov', rev: 489000, users: 5340 }, { d: 'Dec', rev: 521000, users: 5820 },
];

const volumeData = [
  { h: '00', v: 2.1 }, { h: '02', v: 1.4 }, { h: '04', v: 0.9 },
  { h: '06', v: 1.8 }, { h: '08', v: 4.2 }, { h: '10', v: 6.8 },
  { h: '12', v: 8.4 }, { h: '14', v: 7.2 }, { h: '16', v: 9.1 },
  { h: '18', v: 7.8 }, { h: '20', v: 5.4 }, { h: '22', v: 3.2 },
];

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  country: string;
  kyc: 'verified' | 'pending' | 'rejected';
  plan: string;
  balance: string;
  joined: string;
  status: 'active' | 'suspended';
}

const INITIAL_USERS: AdminUserRow[] = [
  { id: 'U001', name: 'Alex Volkov', email: 'alex.v@gmail.com', country: 'RU', kyc: 'verified', plan: 'Pro', balance: '$74,832', joined: '2025-03-12', status: 'active' },
  { id: 'U002', name: 'Sarah Chen', email: 'sarah.c@outlook.com', country: 'SG', kyc: 'verified', plan: 'Pro', balance: '$128,441', joined: '2025-01-08', status: 'active' },
  { id: 'U003', name: 'Marcus Weber', email: 'm.weber@firm.ch', country: 'CH', kyc: 'verified', plan: 'Institutional', balance: '$2,140,000', joined: '2024-11-21', status: 'active' },
  { id: 'U004', name: 'Priya Nair', email: 'priya.n@uae.ae', country: 'AE', kyc: 'verified', plan: 'Pro', balance: '$89,204', joined: '2025-02-17', status: 'active' },
  { id: 'U005', name: 'Ivan Petrov', email: 'ivan.p@mail.ru', country: 'RU', kyc: 'pending', plan: 'Starter', balance: '$1,240', joined: '2026-06-08', status: 'active' },
  { id: 'U006', name: 'Li Wei', email: 'li.wei@qq.com', country: 'CN', kyc: 'rejected', plan: 'Starter', balance: '$0', joined: '2026-06-09', status: 'suspended' },
  { id: 'U007', name: 'Emma Johnson', email: 'emma.j@gmail.com', country: 'US', kyc: 'verified', plan: 'Pro', balance: '$42,180', joined: '2025-07-03', status: 'active' },
  { id: 'U008', name: 'Omar Hassan', email: 'o.hassan@gmail.com', country: 'EG', kyc: 'pending', plan: 'Starter', balance: '$890', joined: '2026-06-05', status: 'active' },
];

// $74,832 → 74832 ; $2,140,000 → 2140000
function parseBalance(s: string): number {
  const n = Number(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function formatBalance(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

const TRANSACTIONS_ADMIN = [
  { id: 'TX001', user: 'Alex Volkov', type: 'swap', asset: 'ETH → BTC', amount: '$5,282', fee: '$15.85', status: 'completed', time: '14:23', flag: false },
  { id: 'TX002', user: 'Marcus Weber', type: 'withdraw', asset: 'USDT', amount: '$250,000', fee: '$0', status: 'pending', time: '13:41', flag: true },
  { id: 'TX003', user: 'Sarah Chen', type: 'deposit', asset: 'BTC', amount: '$48,200', fee: '$0', status: 'completed', time: '12:05', flag: false },
  { id: 'TX004', user: 'Unknown', type: 'login', asset: '—', amount: '—', fee: '—', status: 'blocked', time: '11:30', flag: true },
  { id: 'TX005', user: 'Priya Nair', type: 'stake', asset: 'ETH', amount: '$7,042', fee: '$0', status: 'completed', time: '09:12', flag: false },
];

const ALERTS = [
  { id: 1, level: 'critical', msg: 'Large withdrawal flagged: $250,000 USDT from user U003', time: '2 min ago' },
  { id: 2, level: 'warning', msg: 'Multiple failed login attempts on user U006 (5 attempts from CN)', time: '18 min ago' },
  { id: 3, level: 'info', msg: 'KYC queue: 24 pending verifications', time: '1h ago' },
  { id: 4, level: 'warning', msg: 'BTC/USDT spread widened to 0.12% on external liquidity', time: '2h ago' },
];

const SYSTEM_SERVICES = [
  { name: 'API Gateway', status: 'operational', latency: '12ms', uptime: '99.98%' },
  { name: 'Trading Engine', status: 'operational', latency: '4ms', uptime: '99.99%' },
  { name: 'Custody Vault', status: 'operational', latency: '82ms', uptime: '100%' },
  { name: 'KYC Service', status: 'degraded', latency: '1240ms', uptime: '98.2%' },
  { name: 'Card Processor', status: 'operational', latency: '210ms', uptime: '99.95%' },
  { name: 'Email / Notify', status: 'operational', latency: '340ms', uptime: '99.91%' },
];

type AdminTab = 'overview' | 'users' | 'transactions' | 'system' | 'announcements' | 'settings';

interface Announcement {
  id: number;
  title: string;
  body: string;
  active: boolean;
  type: 'info' | 'warning' | 'maintenance';
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: 'Scheduled Maintenance', body: 'Card processing will be unavailable Jun 15 02:00–04:00 UTC.', active: true, type: 'maintenance' },
  { id: 2, title: 'New Feature: SOL Staking', body: 'Solana liquid staking now available with 7.2% APY.', active: false, type: 'info' },
];

const STATUS_COLOR: Record<string, string> = { operational: '#00C896', degraded: '#F0B429', outage: '#FF3B5C' };
const KYC_COLOR: Record<string, string> = { verified: '#00C896', pending: '#F0B429', rejected: '#FF3B5C' };
const ALERT_COLOR: Record<string, string> = { critical: '#FF3B5C', warning: '#F0B429', info: '#00D4FF' };

// ─── Admin Gate ────────────────────────────────────────────────────────────────
function AdminGate({ onEnter }: { onEnter: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === 'admin2026') { setLoading(true); setTimeout(onEnter, 800); }
    else setErr('Incorrect password.');
  };
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#030810' }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,212,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.07) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl w-full max-w-sm relative"
        style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.15)', boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}>
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
            <Lock size={24} style={{ color: '#F0B429' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#E8F0FE' }}>Admin Access</h2>
          <p style={{ fontSize: 13, color: '#5A7A9C', marginTop: 4 }}>Restricted area. Enter admin credentials.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(''); }}
            placeholder="Admin password"
            className="w-full px-4 py-3 rounded-xl outline-none transition-all"
            style={{ background: '#0D1E35', border: `1px solid ${err ? 'rgba(255,59,92,0.4)' : 'rgba(0,212,255,0.1)'}`, color: '#E8F0FE', fontSize: 14 }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
            onBlur={e => e.target.style.borderColor = err ? 'rgba(255,59,92,0.4)' : 'rgba(0,212,255,0.1)'}
          />
          {err && <p style={{ fontSize: 12, color: '#FF3B5C' }}>{err}</p>}
          <button type="submit" className="w-full py-3 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #F0B429, #FF8C00)', color: '#050B14', fontWeight: 700, fontSize: 14 }}>
            {loading ? 'Verifying...' : 'Enter Admin Panel'}
          </button>
        </form>
        <p className="text-center mt-4" style={{ fontSize: 11, color: '#3A5A7C' }}>Hint: admin2026</p>
      </motion.div>
    </div>
  );
}

// ─── Main Admin ────────────────────────────────────────────────────────────────
export function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<AdminTab>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnBody, setNewAnnBody] = useState('');
  const [newAnnType, setNewAnnType] = useState<'info' | 'warning' | 'maintenance'>('info');
  const [fees, setFees] = useState({ spot: '0.30', withdrawal: '0.50', staking: '0.00' });
  const [limits, setLimits] = useState({ dailyWithdraw: '500000', kycLevel1: '10000', kycLevel2: '1000000' });

  const [users, setUsers] = useState<AdminUserRow[]>(INITIAL_USERS);
  const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // KYC: optimistic UI update, then persist (no-op in mock mode).
  async function handleKyc(user: AdminUserRow, status: AdminUserRow['kyc']) {
    setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, kyc: status } : u)));
    setSavingId(user.id);
    try {
      await updateKycStatus(user.id, status);
    } catch (e) {
      // revert on failure
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, kyc: user.kyc } : u)));
    } finally {
      setSavingId(null);
    }
  }

  function openBalanceEditor(user: AdminUserRow) {
    setEditUser(user);
    setEditValue(String(parseBalance(user.balance)));
  }

  async function handleBalanceSave() {
    if (!editUser) return;
    const value = Number(editValue);
    if (!Number.isFinite(value) || value < 0) return;
    const target = editUser;
    const formatted = formatBalance(value);
    setUsers(prev => prev.map(u => (u.id === target.id ? { ...u, balance: formatted } : u)));
    setEditUser(null);
    setSavingId(target.id);
    try {
      await adjustUserBalance(target.id, value);
    } catch (e) {
      setUsers(prev => prev.map(u => (u.id === target.id ? { ...u, balance: target.balance } : u)));
    } finally {
      setSavingId(null);
    }
  }

  function toggleSuspend(user: AdminUserRow) {
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u
    ));
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (!authed) return <AdminGate onEnter={() => setAuthed(true)} />;

  const NAV: { id: AdminTab; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { id: 'system', icon: Activity, label: 'System Health' },
    { id: 'announcements', icon: Megaphone, label: 'Announcements' },
    { id: 'settings', icon: Sliders, label: 'Platform Settings' },
  ];

  const OVERVIEW_STATS = [
    { label: 'Total Users', value: '2,419,847', change: '+3.2%', icon: Users, color: '#00D4FF', up: true },
    { label: 'Monthly Revenue', value: '$521,000', change: '+16.2%', icon: DollarSign, color: '#00C896', up: true },
    { label: '24h Volume', value: '$84.2M', change: '-2.1%', icon: ArrowLeftRight, color: '#F0B429', up: false },
    { label: 'Active Sessions', value: '14,829', change: '+8.4%', icon: Globe, color: '#A855F7', up: true },
    { label: 'KYC Pending', value: '24', change: '+12', icon: Shield, color: '#F0B429', up: false },
    { label: 'Open Alerts', value: '4', change: '1 critical', icon: AlertTriangle, color: '#FF3B5C', up: false },
  ];

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
            Logged in as <span style={{ color: '#F0B429' }}>superadmin</span>
          </div>
          <button onClick={() => setAuthed(false)}
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
            <div className="relative">
              <button className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#0A1628', border: '1px solid rgba(240,180,41,0.1)' }}>
                <Bell size={15} style={{ color: '#5A7A9C' }} />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#FF3B5C', border: '1.5px solid #030810' }} />
              </button>
            </div>
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
          {tab === 'overview' && (
            <>
              {/* Alerts banner */}
              {ALERTS.filter(a => a.level === 'critical').map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.25)' }}>
                  <AlertTriangle size={18} style={{ color: '#FF3B5C', flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#FF3B5C' }}>CRITICAL: </span>
                    <span style={{ fontSize: 13, color: '#E8F0FE' }}>{alert.msg}</span>
                    <span style={{ fontSize: 11, color: '#5A7A9C', marginLeft: 8 }}>{alert.time}</span>
                  </div>
                  <button className="ml-auto px-3 py-1 rounded-lg" style={{ background: 'rgba(255,59,92,0.15)', color: '#FF3B5C', fontSize: 11, fontWeight: 700 }}>
                    Review
                  </button>
                </div>
              ))}

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
                    <div className="flex items-center gap-1 mt-1">
                      {s.up ? <TrendingUp size={12} style={{ color: '#00C896' }} /> : <TrendingDown size={12} style={{ color: '#FF3B5C' }} />}
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: s.up ? '#00C896' : '#FF3B5C' }}>{s.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 12 }}>Monthly Revenue ($)</div>
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 12 }}>24h Trading Volume ($B)</div>
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
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div className="grid px-5 py-3"
                  style={{ gridTemplateColumns: '70px 1fr 1fr 60px 160px 90px 150px 70px',
                    borderBottom: '1px solid rgba(0,212,255,0.06)', fontSize: 11, fontWeight: 700, color: '#5A7A9C', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  <span>ID</span><span>Name</span><span>Email</span><span>Country</span>
                  <span>KYC</span><span>Plan</span><span>Balance</span><span>Actions</span>
                </div>
                {filteredUsers.map((u, i) => (
                  <div key={u.id} className="grid items-center px-5 py-3 transition-colors"
                    style={{ gridTemplateColumns: '70px 1fr 1fr 60px 160px 90px 150px 70px',
                      borderBottom: i < filteredUsers.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none',
                      opacity: savingId === u.id ? 0.6 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 12, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>{u.id}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: '#5A7A9C' }}>Joined {u.joined}</div>
                    </div>
                    <span style={{ fontSize: 12, color: '#5A7A9C' }}>{u.email}</span>
                    <span style={{ fontSize: 13, color: '#E8F0FE' }}>{u.country}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-center"
                        style={{ fontSize: 11, color: KYC_COLOR[u.kyc], background: KYC_COLOR[u.kyc] + '18', width: 'fit-content' }}>
                        {u.kyc}
                      </span>
                      {u.kyc !== 'verified' && (
                        <button onClick={() => handleKyc(u, 'verified')} disabled={savingId === u.id}
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(0,200,150,0.1)' }} title="Approve KYC">
                          <CheckCircle size={12} style={{ color: '#00C896' }} />
                        </button>
                      )}
                      {u.kyc !== 'rejected' && (
                        <button onClick={() => handleKyc(u, 'rejected')} disabled={savingId === u.id}
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255,59,92,0.1)' }} title="Reject KYC">
                          <XCircle size={12} style={{ color: '#FF3B5C' }} />
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: '#E8F0FE' }}>{u.plan}</span>
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', fontFamily: 'var(--font-mono)' }}>{u.balance}</span>
                      <button onClick={() => openBalanceEditor(u)} disabled={savingId === u.id}
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(240,180,41,0.1)' }} title="Edit balance">
                        <Pencil size={11} style={{ color: '#F0B429' }} />
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(0,212,255,0.08)' }}
                        title="View details">
                        <Eye size={11} style={{ color: '#00D4FF' }} />
                      </button>
                      <button onClick={() => toggleSuspend(u)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: u.status === 'suspended' ? 'rgba(0,200,150,0.08)' : 'rgba(255,59,92,0.08)' }}
                        title={u.status === 'suspended' ? 'Activate' : 'Suspend'}>
                        {u.status === 'suspended'
                          ? <CheckCircle size={11} style={{ color: '#00C896' }} />
                          : <Ban size={11} style={{ color: '#FF3B5C' }} />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#5A7A9C', textAlign: 'center' }}>
                Showing {filteredUsers.length} of {users.length} users · Total registered: 2,419,847
              </div>
            </>
          )}

          {/* ── TRANSACTIONS ── */}
          {tab === 'transactions' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-1">
                {[
                  { label: '24h Transactions', value: '48,291', color: '#00D4FF' },
                  { label: '24h Volume', value: '$84.2M', color: '#00C896' },
                  { label: 'Flagged', value: '7', color: '#FF3B5C' },
                  { label: 'Pending Review', value: '3', color: '#F0B429' },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                    <div style={{ fontSize: 11, color: '#5A7A9C', marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>Recent Transactions</span>
                  <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF', fontSize: 12 }}>
                    <Download size={12} /> Export
                  </button>
                </div>
                {TRANSACTIONS_ADMIN.map((tx, i) => (
                  <div key={tx.id} className="grid items-center px-5 py-3 transition-colors"
                    style={{ gridTemplateColumns: '80px 1fr 120px 110px 80px 100px 60px',
                      borderBottom: i < TRANSACTIONS_ADMIN.length - 1 ? '1px solid rgba(0,212,255,0.04)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 11, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>{tx.id}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#E8F0FE' }}>{tx.user}</div>
                      <div style={{ fontSize: 11, color: '#5A7A9C' }}>{tx.time}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg capitalize"
                      style={{ fontSize: 11, fontWeight: 700, background: 'rgba(0,212,255,0.08)', color: '#00D4FF', width: 'fit-content' }}>
                      {tx.type}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', fontFamily: 'var(--font-mono)' }}>{tx.amount}</span>
                    <span style={{ fontSize: 12, color: '#5A7A9C', fontFamily: 'var(--font-mono)' }}>{tx.fee}</span>
                    <span className="px-2 py-0.5 rounded-full"
                      style={{ fontSize: 11, color: tx.status === 'completed' ? '#00C896' : tx.status === 'pending' ? '#F0B429' : '#FF3B5C',
                        background: (tx.status === 'completed' ? '#00C896' : tx.status === 'pending' ? '#F0B429' : '#FF3B5C') + '15', width: 'fit-content' }}>
                      {tx.status}
                    </span>
                    {tx.flag && (
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
              {/* Uptime chart */}
              <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 12 }}>API Response Time (ms) — Last 24h</div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeData.map(d => ({ ...d, ms: Math.round(d.v * 8 + 8) }))}>
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
                    onClick={() => {
                      if (!newAnnTitle || !newAnnBody) return;
                      setAnnouncements(prev => [...prev, { id: Date.now(), title: newAnnTitle, body: newAnnBody, active: true, type: newAnnType }]);
                      setNewAnnTitle(''); setNewAnnBody('');
                    }}
                    className="w-full py-2.5 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13 }}>
                    Publish Announcement
                  </button>
                </div>
              </div>

              {/* Existing */}
              <div className="space-y-3">
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>Active Announcements</div>
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
                          onClick={() => setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, active: !a.active } : a))}
                          className="relative w-9 h-5 rounded-full transition-all duration-300"
                          style={{ background: ann.active ? '#00D4FF' : 'rgba(255,255,255,0.1)' }}>
                          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                            style={{ left: ann.active ? 'calc(100% - 18px)' : 2 }} />
                        </button>
                        <button onClick={() => setAnnouncements(prev => prev.filter(a => a.id !== ann.id))}
                          style={{ fontSize: 11, color: '#FF3B5C' }}>✕</button>
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
          {tab === 'settings' && (
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Fee settings */}
              <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8F0FE', marginBottom: 14 }}>Fee Configuration (%)</div>
                <div className="space-y-3">
                  {[
                    { label: 'Spot Trading Fee', key: 'spot' as keyof typeof fees },
                    { label: 'Withdrawal Fee', key: 'withdrawal' as keyof typeof fees },
                    { label: 'Staking Platform Fee', key: 'staking' as keyof typeof fees },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>{f.label}</label>
                      <div className="flex items-center gap-2">
                        <input type="number" step="0.01" value={fees[f.key]}
                          onChange={e => setFees(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="flex-1 px-3 py-2.5 rounded-xl outline-none"
                          style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14, fontFamily: 'var(--font-mono)' }}
                          onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.3)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'} />
                        <span style={{ color: '#5A7A9C', fontSize: 14 }}>%</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2.5 rounded-xl mt-2"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13 }}>
                    Save Fee Settings
                  </button>
                </div>
              </div>

              {/* Withdrawal limits */}
              <div className="p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8F0FE', marginBottom: 14 }}>Withdrawal Limits (USD)</div>
                <div className="space-y-3">
                  {[
                    { label: 'Daily Withdrawal Limit', key: 'dailyWithdraw' as keyof typeof limits },
                    { label: 'KYC Level 1 Limit', key: 'kycLevel1' as keyof typeof limits },
                    { label: 'KYC Level 2 Limit', key: 'kycLevel2' as keyof typeof limits },
                  ].map(l => (
                    <div key={l.key}>
                      <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 4 }}>{l.label}</label>
                      <input type="number" value={limits[l.key]}
                        onChange={e => setLimits(prev => ({ ...prev, [l.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl outline-none"
                        style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14, fontFamily: 'var(--font-mono)' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.3)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'} />
                    </div>
                  ))}
                  <button className="w-full py-2.5 rounded-xl mt-2"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 13 }}>
                    Save Limit Settings
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="lg:col-span-2 p-5 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(255,59,92,0.15)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#FF3B5C', marginBottom: 12 }}>⚠ Danger Zone</div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Enable Maintenance Mode', desc: 'Blocks all user logins temporarily' },
                    { label: 'Freeze All Withdrawals', desc: 'Emergency halt on all outflows' },
                    { label: 'Force KYC Re-verification', desc: 'Require all users to re-verify' },
                  ].map((action, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,59,92,0.04)', border: '1px solid rgba(255,59,92,0.1)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 3 }}>{action.label}</div>
                      <div style={{ fontSize: 11, color: '#5A7A9C', marginBottom: 8 }}>{action.desc}</div>
                      <button className="w-full py-1.5 rounded-lg"
                        style={{ background: 'rgba(255,59,92,0.12)', color: '#FF3B5C', fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,59,92,0.2)' }}>
                        Execute
                      </button>
                    </div>
                  ))}
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
                <div style={{ fontSize: 12, color: '#5A7A9C' }}>{editUser.name} · {editUser.id}</div>
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
    </div>
  );
}
