import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import {
  PieChart, Wallet, ArrowLeftRight, List, Layers,
  CreditCard, Settings, LogOut, X, ChevronRight, Bell
} from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';

export type DashTab = 'portfolio' | 'wallet' | 'exchange' | 'transactions' | 'staking' | 'cards' | 'settings';

const NAV_ITEMS: { id: DashTab; icon: React.ElementType }[] = [
  { id: 'portfolio', icon: PieChart },
  { id: 'wallet', icon: Wallet },
  { id: 'exchange', icon: ArrowLeftRight },
  { id: 'transactions', icon: List },
  { id: 'staking', icon: Layers },
  { id: 'cards', icon: CreditCard },
  { id: 'settings', icon: Settings },
];

interface Props {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: Props) {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const labels = t.dashboard.sidebar;
  const navigate = useNavigate();
  const location = useLocation();
  const active = (location.pathname.split('/')[2] || 'portfolio') as DashTab;

  const content = (
    <div className="flex flex-col h-full" style={{ background: '#070F1C' }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="NovaCrypt" className="w-8 h-8 rounded-lg" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#E8F0FE' }}>
            Nova<span style={{ color: '#00D4FF' }}>Crypt</span>
          </span>
        </div>
        <button className="md:hidden" onClick={() => setMobileOpen(false)} style={{ color: '#5A7A9C' }}>
          <X size={18} />
        </button>
      </div>

      {/* User */}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.08)' }}>
        {user ? (
          <img
            src={user.avatarUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.firstName + user.lastName)}`}
            alt="User" className="w-9 h-9 rounded-full" style={{ border: '2px solid rgba(0,212,255,0.25)' }}
          />
        ) : (
          <div className="w-9 h-9 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(0,212,255,0.15)' }} />
        )}
        <div className="flex-1 min-w-0">
          {user ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {`${user.firstName} ${user.lastName}`}
              </div>
              <div style={{ fontSize: 11, color: '#00C896', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
                {`${user.plan.charAt(0).toUpperCase()}${user.plan.slice(1)} Account`}
              </div>
            </>
          ) : (
            <>
              <div style={{ height: 12, width: 96, borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 6 }} />
              <div style={{ height: 9, width: 62, borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} />
            </>
          )}
        </div>
        <button style={{ color: '#5A7A9C' }}>
          <Bell size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => { navigate(`/dashboard/${id}`); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group"
              style={{
                background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: isActive ? '#00D4FF' : '#5A7A9C',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#E8F0FE'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5A7A9C'; } }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: '#00D4FF' }} />
              )}
              <Icon size={17} />
              <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>
                {labels[id]}
              </span>
              {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 pt-2" style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
        <button
          onClick={async () => { await logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
          style={{ color: '#5A7A9C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FF3B5C'; e.currentTarget.style.background = 'rgba(255,59,92,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#5A7A9C'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={17} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{labels.logout}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-60 shrink-0 h-screen sticky top-0 overflow-y-auto"
        style={{ borderRight: '1px solid rgba(0,212,255,0.08)' }}>
        {content}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
