import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { signIn } from '../../../services/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const onGetStarted = () => navigate('/get-started');
  const onBack = () => navigate('/');
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await signIn(email, password);
      if (user.twoFaEnabled) {
        setLoading(false);
        setStep('2fa');
      } else {
        setUser(user);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Login failed.');
    }
  };

  const handle2fa = async () => {
    const full = code.join('');
    if (full.length < 6) { setError('Enter the 6-digit code.'); return; }
    setLoading(true);
    try {
      const user = await signIn(email, password);
      setUser(user);
      navigate('/dashboard');
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Verification failed.');
    }
  };

  const handleCodeInput = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  };

  const handleCodeKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: '#050B14' }}
    >
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,212,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.07) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,102,255,0.1) 0%, transparent 70%)' }} />

      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 transition-colors duration-200"
        style={{ color: '#5A7A9C', fontSize: 14 }}
        onMouseEnter={e => e.currentTarget.style.color = '#E8F0FE'}
        onMouseLeave={e => e.currentTarget.style.color = '#5A7A9C'}
      >
        ← Back
      </button>

      {/* Logo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#050B14', fontSize: 11, fontWeight: 700 }}>N</span>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#E8F0FE' }}>
          Nova<span style={{ color: '#00D4FF' }}>Crypt</span>
        </span>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div
          className="p-8 rounded-2xl"
          style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.12)', boxShadow: '0 0 80px rgba(0,212,255,0.06)' }}
        >
          {step === 'credentials' ? (
            <>
              <div className="text-center mb-7">
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.5 }}>
                  {t.nav.login}
                </h1>
                <p style={{ fontSize: 14, color: '#5A7A9C', marginTop: 6 }}>
                  Welcome back. Enter your credentials to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 5 }}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label style={{ fontSize: 12, color: '#5A7A9C' }}>Password</label>
                    <button type="button" style={{ fontSize: 12, color: '#00D4FF' }}>Forgot password?</button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all pr-11"
                      style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#5A7A9C' }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && <p style={{ fontSize: 13, color: '#FF3B5C' }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: loading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg, #00D4FF, #0066FF)',
                    color: '#050B14',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: '0 0 24px rgba(0,212,255,0.25)',
                  }}
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#050B1466', borderTopColor: 'transparent' }} />
                  ) : (
                    <>{t.nav.login} <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs" style={{ background: '#0A1628', color: '#5A7A9C' }}>or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Google', 'Apple'].map(p => (
                  <button
                    key={p}
                    className="py-2.5 rounded-xl transition-all duration-150"
                    style={{ border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 13, fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.1)'}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <p className="text-center mt-5" style={{ fontSize: 13, color: '#5A7A9C' }}>
                Don't have an account?{' '}
                <button onClick={onGetStarted} style={{ color: '#00D4FF', fontWeight: 600 }}>
                  Get Started
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-7">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <Shield size={26} style={{ color: '#00D4FF' }} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.3 }}>
                  Two-Factor Auth
                </h2>
                <p style={{ fontSize: 13, color: '#5A7A9C', marginTop: 5 }}>
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>

              <div className="flex gap-2 justify-center mb-6">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleCodeInput(e.target.value, i)}
                    onKeyDown={e => handleCodeKey(e, i)}
                    className="w-11 h-14 text-center rounded-xl outline-none transition-all"
                    style={{
                      background: '#0D1E35',
                      border: `1px solid ${digit ? 'rgba(0,212,255,0.35)' : 'rgba(0,212,255,0.12)'}`,
                      color: '#E8F0FE',
                      fontSize: 20,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                    }}
                  />
                ))}
              </div>

              {error && <p className="text-center mb-3" style={{ fontSize: 13, color: '#FF3B5C' }}>{error}</p>}

              <button
                onClick={handle2fa}
                disabled={loading}
                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
                style={{
                  background: loading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg, #00D4FF, #0066FF)',
                  color: '#050B14',
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 0 24px rgba(0,212,255,0.2)',
                }}
              >
                {loading
                  ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#050B1466', borderTopColor: 'transparent' }} />
                  : 'Verify & Log In'
                }
              </button>

              <button onClick={() => setStep('credentials')} className="w-full mt-3 text-center" style={{ fontSize: 13, color: '#5A7A9C' }}>
                ← Back to login
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
