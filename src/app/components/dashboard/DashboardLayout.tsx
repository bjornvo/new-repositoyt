import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Menu, Bell, Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';

type DashTab = 'portfolio' | 'wallet' | 'exchange' | 'transactions' | 'staking' | 'cards' | 'settings';

export function DashboardLayout() {
  const { t } = useLang();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTab = (location.pathname.split('/')[2] || 'portfolio') as DashTab;

  const TITLES: Record<DashTab, string> = {
    portfolio: t.dashboard.portfolio.title,
    wallet: t.dashboard.wallet.title,
    exchange: t.dashboard.exchange.title,
    transactions: t.dashboard.transactions.title,
    staking: t.dashboard.staking.title,
    cards: t.dashboard.cards.title,
    settings: t.dashboard.settings.title,
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#050B14' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4"
          style={{
            background: 'rgba(5,11,20,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,212,255,0.08)',
          }}
        >
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            style={{ color: '#5A7A9C' }}
          >
            <Menu size={20} />
          </button>

          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#E8F0FE' }}>{TITLES[activeTab]}</div>
            <div style={{ fontSize: 12, color: '#5A7A9C' }}>
              {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Search */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)', width: 200 }}
            >
              <Search size={14} style={{ color: '#5A7A9C' }} />
              <input
                placeholder="Search..."
                className="bg-transparent outline-none flex-1"
                style={{ fontSize: 13, color: '#E8F0FE' }}
              />
            </div>

            {/* Notifications */}
            <button
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}
            >
              <Bell size={16} style={{ color: '#5A7A9C' }} />
              <div
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: '#FF3B5C', border: '1.5px solid #050B14' }}
              />
            </button>

            {/* Avatar */}
            <img
              src={user?.avatarUrl ?? 'https://i.pravatar.cc/36?img=12'}
              alt="User"
              className="w-9 h-9 rounded-full cursor-pointer"
              style={{ border: '2px solid rgba(0,212,255,0.25)' }}
              onClick={() => navigate('/dashboard/settings')}
            />
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
