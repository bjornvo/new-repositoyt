import { useState } from 'react';
import { User, Shield, Bell, CheckCircle, ChevronRight, Camera } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../../services/auth';

const KYC_LABEL: Record<string, string> = { verified: 'Verified', pending: 'Pending review', rejected: 'Rejected' };
const KYC_COLOR: Record<string, string> = { verified: '#00C896', pending: '#F0B429', rejected: '#FF3B5C' };

export function SettingsPanel() {
  const { t } = useLang();
  const { user, setUser } = useAuth();
  const d = t.dashboard.settings;
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [twoFaSaving, setTwoFaSaving] = useState(false);

  const tabs = [
    { id: 'profile' as const, label: d.profile, icon: User },
    { id: 'security' as const, label: d.security, icon: Shield },
    { id: 'notifications' as const, label: d.notifications, icon: Bell },
  ];

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await updateProfile(user.id, { firstName, lastName });
      setUser({ ...user, firstName, lastName });
      setSaveMsg('Saved.');
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2fa = async () => {
    setTwoFaSaving(true);
    try {
      const next = !user.twoFaEnabled;
      await updateProfile(user.id, { twoFaEnabled: next });
      setUser({ ...user, twoFaEnabled: next });
    } finally {
      setTwoFaSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
    setPwError('');
    setPwSaving(true);
    setPwSaved(false);
    try {
      await changePassword(newPassword);
      setPwSaved(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-5">
      {/* Tab navigation */}
      <div className="lg:col-span-1">
        <div className="p-2 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 mb-0.5"
              style={{
                background: activeTab === tab.id ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: activeTab === tab.id ? '#00D4FF' : '#5A7A9C',
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#E8F0FE'; } }}
              onMouseLeave={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5A7A9C'; } }}
            >
              <tab.icon size={16} />
              <span style={{ fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 500 }}>{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        <div className="p-6 rounded-2xl" style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.1)' }}>
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FE', marginBottom: 8 }}>{d.profile}</div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img src={user.avatarUrl ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.firstName + user.lastName)}`} alt="Avatar" className="w-16 h-16 rounded-full" style={{ border: '2px solid rgba(0,212,255,0.25)' }} />
                  <button
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#00D4FF' }}
                  >
                    <Camera size={12} style={{ color: '#050B14' }} />
                  </button>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FE' }}>{firstName} {lastName}</div>
                  <div className="inline-flex px-2 py-0.5 rounded mt-1" style={{ background: 'rgba(0,212,255,0.08)', fontSize: 12, color: '#00D4FF' }}>
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Account
                  </div>
                </div>
              </div>

              {/* KYC */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: KYC_COLOR[user.kycStatus] + '0F', border: `1px solid ${KYC_COLOR[user.kycStatus]}26` }}>
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} style={{ color: KYC_COLOR[user.kycStatus] }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{d.kyc}</div>
                    <div style={{ fontSize: 12, color: '#5A7A9C' }}>Identity verification status</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: KYC_COLOR[user.kycStatus], fontWeight: 600 }}>{KYC_LABEL[user.kycStatus]}</span>
              </div>

              {[
                { label: 'Full Name', kind: 'name' as const },
                { label: 'Email Address', kind: 'email' as const },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 5 }}>{field.label}</label>
                  {field.kind === 'email' ? (
                    <input
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                      style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#5A7A9C', fontSize: 14, opacity: 0.7 }}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                        style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'}
                      />
                      <input
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                        style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }}
                        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'}
                      />
                    </div>
                  )}
                </div>
              ))}

              {saveMsg && <p style={{ fontSize: 12, color: saveMsg === 'Saved.' ? '#00C896' : '#FF3B5C' }}>{saveMsg}</p>}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving…' : d.save}
              </button>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FE', marginBottom: 8 }}>{d.security}</div>

              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.08)' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{d.twoFactor}</span>
                    <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, background: 'rgba(0,200,150,0.1)', color: '#00C896' }}>Recommended</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#5A7A9C', marginTop: 2 }}>Authenticator app (TOTP)</div>
                </div>
                <button
                  onClick={handleToggle2fa}
                  disabled={twoFaSaving}
                  className="relative w-12 h-6 rounded-full transition-all duration-300"
                  style={{ background: user.twoFaEnabled ? '#00D4FF' : 'rgba(255,255,255,0.1)', opacity: twoFaSaving ? 0.6 : 1 }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
                    style={{ background: '#fff', left: user.twoFaEnabled ? 'calc(100% - 22px)' : 2 }}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <label style={{ fontSize: 12, color: '#5A7A9C' }}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl outline-none" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }} />
                <label style={{ fontSize: 12, color: '#5A7A9C' }}>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl outline-none" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }} />
                {pwError && <p style={{ fontSize: 12, color: '#FF3B5C' }}>{pwError}</p>}
                {pwSaved && <p style={{ fontSize: 12, color: '#00C896' }}>Password updated.</p>}
                <button onClick={handleChangePassword} disabled={pwSaving} className="px-6 py-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 14, opacity: pwSaving ? 0.7 : 1 }}>
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>

              {/* Active sessions */}
              <div className="mt-4">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 8 }}>Active Sessions</div>
                <div className="flex items-center justify-between p-3 rounded-xl mb-2" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#E8F0FE', fontWeight: 500 }}>This device</div>
                    <div style={{ fontSize: 11, color: '#5A7A9C' }}>{navigator.userAgent.split(') ')[0].split(' (')[1] ?? navigator.platform}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#00C896' }}>Current</span>
                </div>
                <p style={{ fontSize: 11, color: '#3A5A7C' }}>Other-device session tracking requires a server-side admin key and isn't available from the browser.</p>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <div style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FE', marginBottom: 8 }}>{d.notifications}</div>
              {[
                { label: 'Email Notifications', desc: 'Transaction confirmations, security alerts', value: emailNotif, setter: setEmailNotif },
                { label: 'Push Notifications', desc: 'Real-time alerts on your device', value: pushNotif, setter: setPushNotif },
                { label: 'Price Alerts', desc: 'Get notified when prices hit your targets', value: priceAlerts, setter: setPriceAlerts },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.08)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#5A7A9C', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <button
                    onClick={() => item.setter(!item.value)}
                    className="relative w-12 h-6 rounded-full transition-all duration-300"
                    style={{ background: item.value ? '#00D4FF' : 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300" style={{ left: item.value ? 'calc(100% - 22px)' : 2 }} />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
