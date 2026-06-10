import { motion } from 'motion/react';
import { MapPin, Linkedin, Twitter, ArrowRight, Award, Users, Globe2, Zap } from 'lucide-react';

const TEAM = [
  {
    name: 'Dmitri Kovalev',
    role: 'Chief Executive Officer',
    bio: 'Former VP Engineering at Binance. 14 years in fintech infrastructure.',
    avatar: 'https://i.pravatar.cc/96?img=33',
    location: 'Dubai, UAE',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Sophie Marchetti',
    role: 'Chief Financial Officer',
    bio: 'Ex-Goldman Sachs MD. Structured $4B in digital asset products.',
    avatar: 'https://i.pravatar.cc/96?img=49',
    location: 'Zurich, CH',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Chen Wei',
    role: 'Chief Technology Officer',
    bio: 'Built custody systems for OKX and Coinbase. MIT Computer Science.',
    avatar: 'https://i.pravatar.cc/96?img=60',
    location: 'Singapore, SG',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Anastasia Volova',
    role: 'Chief Compliance Officer',
    bio: 'Former FCA regulator. Specialises in MiCA and crypto licensing in 30+ jurisdictions.',
    avatar: 'https://i.pravatar.cc/96?img=47',
    location: 'London, UK',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Marcus Osei',
    role: 'Head of Security',
    bio: 'Led red-team operations at NSA. Architected MPC custody at BitGo.',
    avatar: 'https://i.pravatar.cc/96?img=53',
    location: 'Washington, US',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Product',
    bio: 'Previously designed trading UX at Revolut and Robinhood. 9M+ users served.',
    avatar: 'https://i.pravatar.cc/96?img=44',
    location: 'London, UK',
    linkedin: '#',
    twitter: '#',
  },
];

const TIMELINE = [
  { year: '2021', event: 'Founded in Dubai by a team of ex-Binance, Goldman Sachs, and NSA engineers.' },
  { year: '2022', event: 'Secured $28M Series A. Launched beta with 50,000 waitlist users.' },
  { year: '2023', event: 'Obtained FSA Malta license. Launched in EU, UK, and 40+ countries.' },
  { year: '2024', event: 'Crossed $1B AUM. Launched institutional custody and OTC desk.' },
  { year: '2025', event: 'Series B at $180M valuation. Introduced crypto cards and staking products.' },
  { year: '2026', event: '2.4M active users. $8.4B AUM. Expansion into APAC and LATAM.' },
];

const VALUES = [
  {
    icon: Award,
    title: 'Uncompromising Security',
    body: 'We treat every dollar of user assets as if it were our own. MPC custody, cold storage, and $250M insurance are non-negotiable.',
    color: '#F0B429',
  },
  {
    icon: Users,
    title: 'User Sovereignty',
    body: 'You own your assets. We are custodians, not controllers. Withdraw your funds at any time — no lock-ins, no excuses.',
    color: '#00D4FF',
  },
  {
    icon: Globe2,
    title: 'Radical Transparency',
    body: 'Monthly proof-of-reserves. Public security audits. Fees displayed upfront. We believe trust is earned through disclosure.',
    color: '#00C896',
  },
  {
    icon: Zap,
    title: 'Relentless Execution',
    body: 'We ship fast, fix faster. Our engineering culture is driven by the belief that DeFi infrastructure should be as reliable as electricity.',
    color: '#A855F7',
  },
];

const PRESS = [
  { outlet: 'Forbes', headline: '"The Most Secure Crypto Bank You\'ve Never Heard Of"', date: 'May 2026' },
  { outlet: 'Bloomberg', headline: 'NovaCrypt\'s MPC Architecture Sets New Institutional Standard', date: 'Mar 2026' },
  { outlet: 'CoinDesk', headline: 'NovaCrypt Raises $180M, Eyes Global Expansion', date: 'Nov 2025' },
  { outlet: 'Financial Times', headline: 'How NovaCrypt is Bridging DeFi and Traditional Banking', date: 'Aug 2025' },
];

const OFFICES = [
  { city: 'Dubai', country: 'UAE', type: 'HQ', address: 'DIFC Gate Building, Level 12' },
  { city: 'Valletta', country: 'Malta', type: 'Regulatory', address: 'Strait Street 142' },
  { city: 'London', country: 'UK', type: 'Engineering', address: 'Canary Wharf, Level 22' },
  { city: 'Singapore', country: 'SG', type: 'APAC', address: 'Marina Bay Financial Centre' },
];

export function Company() {
  return (
    <section id="about" style={{ background: '#050B14' }}>

      {/* ── Hero ── */}
      <div className="relative py-28 overflow-hidden" style={{ background: '#070F1C' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,102,255,0.1) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            <span style={{ color: '#00D4FF', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>OUR STORY</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, color: '#E8F0FE', letterSpacing: -1.5, lineHeight: 1.1 }}
          >
            Built by people who got tired of <span style={{ color: '#00D4FF' }}>bad crypto banks.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 max-w-2xl mx-auto"
            style={{ color: '#5A7A9C', fontSize: 18, lineHeight: 1.8 }}
          >
            NovaCrypt was founded in 2021 by engineers and operators from Binance, Goldman Sachs, and the NSA who shared one conviction: crypto banking should be as safe, fast, and transparent as it is profitable.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14"
          >
            {[
              { value: '2021', label: 'Founded' },
              { value: '$8.4B', label: 'Assets Under Management' },
              { value: '2.4M', label: 'Users Worldwide' },
              { value: '147', label: 'Countries Served' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#00D4FF' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#5A7A9C', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Mission & Values ── */}
      <div className="py-24" style={{ background: '#050B14' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.8 }}
            >
              What we stand for
            </motion.h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl"
                style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = v.color + '40'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.transition = 'all 0.3s'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: v.color + '15', border: `1px solid ${v.color}30` }}>
                  <v.icon size={18} style={{ color: v.color }} />
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FE', marginBottom: 8 }}>{v.title}</h4>
                <p style={{ fontSize: 13, color: '#5A7A9C', lineHeight: 1.75 }}>{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="py-24" style={{ background: '#070F1C' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.8 }}
            >
              Our journey
            </motion.h3>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[72px] top-0 bottom-0 w-px" style={{ background: 'rgba(0,212,255,0.12)' }} />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-6"
                >
                  <div className="flex-shrink-0 w-20 text-right">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#00D4FF' }}>{item.year}</span>
                  </div>
                  {/* Dot */}
                  <div className="relative flex-shrink-0 mt-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#00D4FF', boxShadow: '0 0 8px rgba(0,212,255,0.6)' }} />
                  </div>
                  <div className="flex-1 pb-2">
                    <p style={{ fontSize: 15, color: '#8AA8C4', lineHeight: 1.7 }}>{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Team ── */}
      <div className="py-24" style={{ background: '#050B14' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <span style={{ color: '#00D4FF', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>LEADERSHIP</span>
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.8 }}
            >
              The team behind the bank
            </motion.h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group p-5 rounded-2xl"
                style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.22)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                    style={{ border: '2px solid rgba(0,212,255,0.2)' }}
                  />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FE' }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: '#00D4FF', fontWeight: 600, marginTop: 2 }}>{member.role}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={10} style={{ color: '#5A7A9C' }} />
                      <span style={{ fontSize: 11, color: '#5A7A9C' }}>{member.location}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#5A7A9C', lineHeight: 1.7, marginBottom: 12 }}>{member.bio}</p>
                <div className="flex gap-2">
                  {[
                    { icon: Linkedin, href: member.linkedin },
                    { icon: Twitter, href: member.twitter },
                  ].map(({ icon: Icon, href }, j) => (
                    <a
                      key={j}
                      href={href}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                      style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.1)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.1)'}
                    >
                      <Icon size={12} style={{ color: '#5A7A9C' }} />
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Careers CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#E8F0FE' }}>We're hiring globally</div>
              <div style={{ fontSize: 13, color: '#5A7A9C', marginTop: 3 }}>
                Remote-first · Competitive equity · 18 open roles in engineering, compliance, and product
              </div>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl flex-shrink-0 transition-all duration-200"
              style={{ border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF', fontSize: 14, fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'}
            >
              View Open Roles <ArrowRight size={15} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Press ── */}
      <div className="py-24" style={{ background: '#070F1C' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.8 }}
            >
              In the press
            </motion.h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {PRESS.map((p, i) => (
              <motion.a
                key={i}
                href="#"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group flex flex-col p-5 rounded-2xl"
                style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)', transition: 'all 0.25s', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.22)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: '#00D4FF', letterSpacing: 1 }}>
                    {p.outlet}
                  </span>
                  <span style={{ fontSize: 11, color: '#5A7A9C' }}>{p.date}</span>
                </div>
                <p style={{ fontSize: 14, color: '#E8F0FE', lineHeight: 1.6, fontStyle: 'italic' }}>"{p.headline}"</p>
                <div className="flex items-center gap-1 mt-3" style={{ color: '#00D4FF', fontSize: 12 }}>
                  Read article <ArrowRight size={12} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Offices ── */}
      <div className="py-24" style={{ background: '#050B14' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 800, color: '#E8F0FE', letterSpacing: -0.8 }}
            >
              Our offices
            </motion.h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OFFICES.map((o, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-5 rounded-2xl"
                style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: 22 }}>
                    {o.country === 'UAE' ? '🇦🇪' : o.country === 'Malta' ? '🇲🇹' : o.country === 'UK' ? '🇬🇧' : '🇸🇬'}
                  </span>
                  <span className="px-2 py-0.5 rounded"
                    style={{ fontSize: 10, fontWeight: 700, background: 'rgba(0,212,255,0.08)', color: '#00D4FF', letterSpacing: 0.5 }}>
                    {o.type}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#E8F0FE' }}>{o.city}</div>
                <div style={{ fontSize: 12, color: '#5A7A9C', marginTop: 2 }}>{o.country}</div>
                <div className="flex items-start gap-1.5 mt-3">
                  <MapPin size={11} style={{ color: '#5A7A9C', marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#5A7A9C', lineHeight: 1.5 }}>{o.address}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
