import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Check, Eye, EyeOff, ArrowRight, Upload, Smartphone } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { signUp } from '../../../services/auth';

type Step = 'account' | 'security' | 'kyc' | 'plan' | 'done';

const STEPS: { id: Step; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'kyc', label: 'Identity' },
  { id: 'plan', label: 'Plan' },
  { id: 'done', label: 'Done' },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$0/mo', features: ['1 wallet per chain', '2% trading fee', 'Standard yield'], color: '#5A7A9C' },
  { id: 'pro', name: 'Pro', price: '$29/mo', features: ['Unlimited wallets', '0.3% trading fee', 'Staking + yield', 'Crypto card'], color: '#00D4FF', popular: true },
  { id: 'institutional', name: 'Institutional', price: 'Custom', features: ['Dedicated custody', 'OTC desk', 'Dedicated manager'], color: '#F0B429' },
];

export function GetStartedPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const onLogin = () => navigate('/login');
  const onBack = () => navigate('/');
  const { t } = useLang();
  const [step, setStep] = useState<Step>('account');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro');

  // form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(true);
  const [kycDoc, setKycDoc] = useState<'passport' | 'id' | 'license'>('passport');
  const [kycUploaded, setKycUploaded] = useState(false);

  const stepIdx = STEPS.findIndex(s => s.id === step);

  const advance = (nextStep: Step) => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(nextStep); }, 800);
  };

  const progressPct = (stepIdx / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative" style={{ background: '#050B14' }}>
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,212,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.07) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,66,255,0.08) 0%, transparent 70%)' }} />

      {/* Back */}
      <button onClick={onBack} className="absolute top-6 left-6 transition-colors duration-200"
        style={{ color: '#5A7A9C', fontSize: 14 }}
        onMouseEnter={e => e.currentTarget.style.color = '#E8F0FE'}
        onMouseLeave={e => e.currentTarget.style.color = '#5A7A9C'}
      >
        ← Back
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <img src="/logo.png" alt="NovaCrypt" className="w-7 h-7 rounded-lg" />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#E8F0FE' }}>
          Nova<span style={{ color: '#00D4FF' }}>Crypt</span>
        </span>
      </div>

      {/* Step indicator */}
      {step !== 'done' && (
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.filter(s => s.id !== 'done').map((s, i) => {
              const done = i < stepIdx;
              const active = s.id === step;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: done ? '#00C896' : active ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${done ? '#00C896' : active ? '#00D4FF' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {done
                      ? <Check size={14} style={{ color: '#050B14' }} />
                      : <span style={{ fontSize: 12, fontWeight: 700, color: active ? '#00D4FF' : '#5A7A9C' }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ fontSize: 10, color: active ? '#00D4FF' : done ? '#00C896' : '#5A7A9C', fontWeight: 600 }}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #00D4FF, #0066FF)' }} />
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-2xl"
            style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.12)', boxShadow: '0 0 80px rgba(0,212,255,0.05)' }}
          >
            {/* Step 1: Account */}
            {step === 'account' && (
              <div className="space-y-4">
                <div className="mb-6">
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.3 }}>Create your account</h2>
                  <p style={{ fontSize: 13, color: '#5A7A9C', marginTop: 4 }}>Start with your basic information.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'First Name', val: firstName, set: setFirstName, placeholder: 'Alex' },
                    { label: 'Last Name', val: lastName, set: setLastName, placeholder: 'Volkov' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 5 }}>{f.label}</label>
                      <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                        style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 5 }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 5 }}>Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 12 characters"
                      className="w-full px-4 py-3 pr-11 rounded-xl outline-none transition-all"
                      style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#5A7A9C' }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {password && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: password.length >= n * 3 ? (password.length >= 12 ? '#00C896' : '#F0B429') : 'rgba(255,255,255,0.06)' }} />
                      ))}
                    </div>
                  )}
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                  <div
                    onClick={() => setAgreed(!agreed)}
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    style={{ background: agreed ? '#00D4FF' : 'transparent', border: `2px solid ${agreed ? '#00D4FF' : 'rgba(0,212,255,0.2)'}` }}
                  >
                    {agreed && <Check size={11} style={{ color: '#050B14' }} />}
                  </div>
                  <span style={{ fontSize: 12, color: '#5A7A9C', lineHeight: 1.6 }}>
                    I agree to the <span style={{ color: '#00D4FF' }}>Terms of Service</span> and <span style={{ color: '#00D4FF' }}>Privacy Policy</span>
                  </span>
                </label>
                <button
                  onClick={() => advance('security')}
                  disabled={!email || !password || !firstName || !agreed || loading}
                  className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2"
                  style={{
                    background: (!email || !password || !firstName || !agreed) ? 'rgba(0,212,255,0.15)' : 'linear-gradient(135deg, #00D4FF, #0066FF)',
                    color: (!email || !password || !firstName || !agreed) ? '#5A7A9C' : '#050B14',
                    fontWeight: 700, fontSize: 15,
                  }}
                >
                  {loading ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#05', borderTopColor: 'transparent' }} /> : <>Continue <ArrowRight size={16} /></>}
                </button>
                <p className="text-center" style={{ fontSize: 13, color: '#5A7A9C' }}>
                  Already have an account?{' '}
                  <button onClick={onLogin} style={{ color: '#00D4FF', fontWeight: 600 }}>Log In</button>
                </p>
              </div>
            )}

            {/* Step 2: Security */}
            {step === 'security' && (
              <div className="space-y-5">
                <div className="mb-4">
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.3 }}>Secure your account</h2>
                  <p style={{ fontSize: 13, color: '#5A7A9C', marginTop: 4 }}>We recommend enabling 2FA for maximum security.</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)' }}>
                        <Smartphone size={18} style={{ color: '#00D4FF' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>Authenticator App (TOTP)</div>
                        <div style={{ fontSize: 12, color: '#5A7A9C' }}>Google Authenticator, Authy, etc.</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                      className="relative w-12 h-6 rounded-full transition-all duration-300"
                      style={{ background: twoFaEnabled ? '#00D4FF' : 'rgba(255,255,255,0.1)' }}
                    >
                      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300" style={{ left: twoFaEnabled ? 'calc(100% - 22px)' : 2 }} />
                    </button>
                  </div>
                  {twoFaEnabled && (
                    <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <div className="grid grid-cols-4 gap-0.5">
                            {[...Array(16)].map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-sm" style={{ background: Math.random() > 0.5 ? '#00D4FF' : 'transparent', opacity: 0.8 }} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#5A7A9C', marginBottom: 2 }}>Scan QR code or enter manually:</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00D4FF', letterSpacing: 1 }}>NCRY PTBA NK2F ASEC RETK EY12</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.12)' }}>
                  <div style={{ fontSize: 12, color: '#00C896', lineHeight: 1.6 }}>
                    🔒 Your account will also be protected with email verification and device fingerprinting.
                  </div>
                </div>
                <button onClick={() => advance('kyc')} className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 15 }}>
                  {loading ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#050B1466', borderTopColor: 'transparent' }} /> : <>Continue <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* Step 3: KYC */}
            {step === 'kyc' && (
              <div className="space-y-5">
                <div className="mb-4">
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.3 }}>Verify your identity</h2>
                  <p style={{ fontSize: 13, color: '#5A7A9C', marginTop: 4 }}>Required for compliance. Takes under 2 minutes.</p>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 6 }}>Document type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'passport' as const, label: 'Passport' },
                      { id: 'id' as const, label: 'National ID' },
                      { id: 'license' as const, label: 'Driver\'s License' },
                    ].map(doc => (
                      <button key={doc.id} onClick={() => setKycDoc(doc.id)}
                        className="py-2.5 rounded-xl text-center transition-all duration-150"
                        style={{
                          fontSize: 12, fontWeight: 600,
                          background: kycDoc === doc.id ? 'rgba(0,212,255,0.1)' : '#0D1E35',
                          border: `1px solid ${kycDoc === doc.id ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.06)'}`,
                          color: kycDoc === doc.id ? '#00D4FF' : '#5A7A9C',
                        }}>
                        {doc.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  onClick={() => setKycUploaded(true)}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    border: `2px dashed ${kycUploaded ? 'rgba(0,200,150,0.4)' : 'rgba(0,212,255,0.2)'}`,
                    background: kycUploaded ? 'rgba(0,200,150,0.05)' : 'rgba(0,212,255,0.03)',
                  }}
                >
                  {kycUploaded ? (
                    <>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,200,150,0.15)' }}>
                        <Check size={20} style={{ color: '#00C896' }} />
                      </div>
                      <span style={{ fontSize: 14, color: '#00C896', fontWeight: 600 }}>Document uploaded</span>
                    </>
                  ) : (
                    <>
                      <Upload size={28} style={{ color: '#5A7A9C' }} />
                      <div className="text-center">
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>Upload your {kycDoc}</div>
                        <div style={{ fontSize: 12, color: '#5A7A9C', marginTop: 2 }}>JPG, PNG or PDF · Max 10MB</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(240,180,41,0.05)', border: '1px solid rgba(240,180,41,0.1)' }}>
                  <span style={{ fontSize: 11, color: '#F0B429', lineHeight: 1.6 }}>
                    ⚡ AI-powered verification typically completes in under 2 minutes. You can use the platform while we review your documents.
                  </span>
                </div>
                <button onClick={() => advance('plan')} className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 15 }}>
                  {loading ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#050B1466', borderTopColor: 'transparent' }} /> : <>Continue <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* Step 4: Plan */}
            {step === 'plan' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.3 }}>Choose your plan</h2>
                  <p style={{ fontSize: 13, color: '#5A7A9C', marginTop: 4 }}>You can upgrade or downgrade anytime.</p>
                </div>
                {PLANS.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className="relative p-4 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      border: `1px solid ${selectedPlan === plan.id ? plan.color + '60' : 'rgba(0,212,255,0.08)'}`,
                      background: selectedPlan === plan.id ? plan.color + '08' : '#0D1E35',
                    }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full"
                        style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', fontSize: 10, fontWeight: 700, color: '#050B14' }}>
                        Popular
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ border: `2px solid ${selectedPlan === plan.id ? plan.color : 'rgba(255,255,255,0.15)'}`, background: selectedPlan === plan.id ? plan.color : 'transparent' }}>
                        {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span style={{ fontSize: 14, fontWeight: 700, color: selectedPlan === plan.id ? plan.color : '#E8F0FE' }}>{plan.name}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#E8F0FE' }}>{plan.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                          {plan.features.map(f => (
                            <span key={f} style={{ fontSize: 11, color: '#5A7A9C' }}>· {f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {signUpError && <p style={{ fontSize: 13, color: '#FF3B5C', textAlign: 'center' }}>{signUpError}</p>}
                <button
                  onClick={async () => {
                    setSignUpError('');
                    setLoading(true);
                    try {
                      const user = await signUp({
                        email, password, firstName, lastName,
                        plan: selectedPlan as 'starter' | 'pro' | 'institutional',
                      });
                      setUser(user);
                      setLoading(false);
                      setStep('done');
                    } catch (err: unknown) {
                      setLoading(false);
                      setSignUpError(err instanceof Error ? err.message : 'Registration failed.');
                    }
                  }}
                  className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 15, marginTop: 8 }}
                >
                  {loading ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#050B1466', borderTopColor: 'transparent' }} /> : <>Create Account <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* Done */}
            {step === 'done' && (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(0,200,150,0.12)', border: '2px solid rgba(0,200,150,0.3)' }}
                >
                  <Check size={36} style={{ color: '#00C896' }} />
                </motion.div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.5 }}>
                  Account Created!
                </h2>
                <p style={{ fontSize: 14, color: '#5A7A9C', marginTop: 8, lineHeight: 1.7 }}>
                  Welcome to NovaCrypt Bank. Your identity verification is being processed. This usually takes under 2 minutes.
                </p>
                <div className="flex flex-col gap-3 mt-7">
                  {[
                    { label: 'Account created', done: true },
                    { label: 'Email verification sent', done: true },
                    { label: 'KYC under review', done: false, pending: true },
                    { label: '2FA configured', done: twoFaEnabled },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: '#0D1E35' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: item.done ? 'rgba(0,200,150,0.15)' : item.pending ? 'rgba(240,180,41,0.15)' : 'rgba(255,255,255,0.05)' }}>
                        {item.done
                          ? <Check size={11} style={{ color: '#00C896' }} />
                          : item.pending
                          ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#F0B429' }} />
                          : <div className="w-2 h-2 rounded-full" style={{ background: '#5A7A9C' }} />
                        }
                      </div>
                      <span style={{ fontSize: 13, color: item.done ? '#E8F0FE' : '#5A7A9C' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3.5 rounded-xl mt-6 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 15, boxShadow: '0 0 30px rgba(0,212,255,0.25)' }}
                >
                  Go to Dashboard <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
