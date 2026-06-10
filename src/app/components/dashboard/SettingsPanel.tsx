import { useState } from 'react';
import { User, Shield, Bell, CheckCircle, ChevronRight, Camera } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

export function SettingsPanel() {
  const { t } = useLang();
  const d = t.dashboard.settings;
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [twoFa, setTwoFa] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [name, setName] = useState('Alex Volkov');
  const [email, setEmail] = useState('alex.volkov@gmail.com');
  const [phone, setPhone] = useState('+7 999 123-45-67');

  const tabs = [
    { id: 'profile' as const, label: d.profile, icon: User },
    { id: 'security' as const, label: d.security, icon: Shield },
    { id: 'notifications' as const, label: d.notifications, icon: Bell },
  ];

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
                  <img src="https://i.pravatar.cc/80?img=12" alt="Avatar" className="w-16 h-16 rounded-full" style={{ border: '2px solid rgba(0,212,255,0.25)' }} />
                  <button
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#00D4FF' }}
                  >
                    <Camera size={12} style={{ color: '#050B14' }} />
                  </button>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FE' }}>{name}</div>
                  <div className="inline-flex px-2 py-0.5 rounded mt-1" style={{ background: 'rgba(0,212,255,0.08)', fontSize: 12, color: '#00D4FF' }}>
                    Pro Account
                  </div>
                </div>
              </div>

              {/* KYC */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.15)' }}>
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} style={{ color: '#00C896' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE' }}>{d.kyc}</div>
                    <div style={{ fontSize: 12, color: '#5A7A9C' }}>Level 2 verified · Submitted Jun 1, 2026</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#00C896', fontWeight: 600 }}>Verified</span>
              </div>

              {[
                { label: 'Full Name', value: name, setter: setName },
                { label: 'Email Address', value: email, setter: setEmail },
                { label: 'Phone Number', value: phone, setter: setPhone },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ fontSize: 12, color: '#5A7A9C', display: 'block', marginBottom: 5 }}>{field.label}</label>
                  <input
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      background: '#0D1E35',
                      border: '1px solid rgba(0,212,255,0.1)',
                      color: '#E8F0FE',
                      fontSize: 14,
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'}
                  />
                </div>
              ))}

              <button
                className="px-6 py-2.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 14 }}
              >
                {d.save}
              </button>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FE', marginBottom: 8 }}>{d.security}</div>

              {[
                {
                  title: d.twoFactor,
                  desc: 'Authenticator app (TOTP)',
                  value: twoFa,
                  setter: setTwoFa,
                  recommended: true,
                },
              ].map(item => (
                <div key={item.title} className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.08)' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#E8F0FE' }}>{item.title}</span>
                      {item.recommended && <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, background: 'rgba(0,200,150,0.1)', color: '#00C896' }}>Recommended</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#5A7A9C', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <button
                    onClick={() => item.setter(!item.value)}
                    className="relative w-12 h-6 rounded-full transition-all duration-300"
                    style={{ background: item.value ? '#00D4FF' : 'rgba(255,255,255,0.1)' }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
                      style={{ background: '#fff', left: item.value ? 'calc(100% - 22px)' : 2 }}
                    />
                  </button>
                </div>
              ))}

              <div className="space-y-3">
                <label style={{ fontSize: 12, color: '#5A7A9C' }}>Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl outline-none" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }} />
                <label style={{ fontSize: 12, color: '#5A7A9C' }}>New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl outline-none" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }} />
                <label style={{ fontSize: 12, color: '#5A7A9C' }}>Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl outline-none" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.1)', color: '#E8F0FE', fontSize: 14 }} />
                <button className="px-6 py-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', color: '#050B14', fontWeight: 700, fontSize: 14 }}>
                  Update Password
                </button>
              </div>

              {/* Active sessions */}
              <div className="mt-4">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 8 }}>Active Sessions</div>
                {[
                  { device: 'Chrome on macOS', ip: '185.42.12.***', location: 'Moscow, RU', current: true },
                  { device: 'Safari on iPhone', ip: '91.108.56.***', location: 'Saint-P, RU', current: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl mb-2" style={{ background: '#0D1E35', border: '1px solid rgba(0,212,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#E8F0FE', fontWeight: 500 }}>{s.device}</div>
                      <div style={{ fontSize: 11, color: '#5A7A9C' }}>{s.ip} · {s.location}</div>
                    </div>
                    {s.current
                      ? <span style={{ fontSize: 11, color: '#00C896' }}>Current</span>
                      : <button style={{ fontSize: 11, color: '#FF3B5C' }}>Revoke</button>
                    }
                  </div>
                ))}
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
