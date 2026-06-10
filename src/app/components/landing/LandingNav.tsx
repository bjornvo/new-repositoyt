import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

export function LandingNav() {
  const navigate = useNavigate();
  const onLogin = () => navigate('/login');
  const onGetStarted = () => navigate('/get-started');
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: t.nav.products, href: '#features' },
    { label: t.nav.security, href: '#security' },
    { label: t.nav.pricing, href: '#pricing' },
    { label: t.nav.company, href: '#about' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(5, 11, 20, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0, 212, 255, 0.1)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-lg" style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontFamily: 'var(--font-mono)', color: '#050B14', fontSize: 13, fontWeight: 700 }}>N</span>
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#E8F0FE', letterSpacing: -0.3 }}>
            Nova<span style={{ color: '#00D4FF' }}>Crypt</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-200"
              style={{ color: '#5A7A9C', fontSize: 14, fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E8F0FE')}
              onMouseLeave={e => (e.currentTarget.style.color = '#5A7A9C')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 rounded-lg transition-all duration-200"
            style={{ color: '#E8F0FE', fontSize: 14, fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = '#00D4FF'}
            onMouseLeave={e => e.currentTarget.style.color = '#E8F0FE'}
          >
            {t.nav.login}
          </button>

          <button
            onClick={onGetStarted}
            className="px-5 py-2 rounded-lg transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #0066FF)',
              color: '#050B14',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 0 20px rgba(0,212,255,0.25)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,255,0.45)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.25)'}
          >
            {t.nav.getStarted}
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" style={{ color: '#E8F0FE' }} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(5,11,20,0.98)', borderTop: '1px solid rgba(0,212,255,0.1)' }}
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map(link => (
                <a key={link.href} href={link.href} style={{ color: '#E8F0FE', fontSize: 16, fontWeight: 500 }} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 mt-2">
                <button onClick={onLogin} className="flex-1 py-3 rounded-xl" style={{ border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF', fontWeight: 600 }}>
                  {t.nav.login}
                </button>
                <button onClick={onGetStarted} className="flex-1 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700 }}>
                  {t.nav.getStarted}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
