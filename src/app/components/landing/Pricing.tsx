import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

export function Pricing() {
  const { t } = useLang();
  const navigate = useNavigate();
  const onEnterDashboard = () => navigate('/get-started');

  return (
    <section id="pricing" className="py-28" style={{ background: '#050B14' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            <span style={{ color: '#00D4FF', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
              {t.pricing.badge}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#E8F0FE', letterSpacing: -1, lineHeight: 1.15, whiteSpace: 'pre-line' }}
          >
            {t.pricing.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-3 max-w-md mx-auto"
            style={{ color: '#5A7A9C', fontSize: 17, lineHeight: 1.7 }}
          >
            {t.pricing.sub}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {t.pricing.plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-7 rounded-2xl flex flex-col"
              style={{
                background: plan.highlight ? 'linear-gradient(160deg, #0A1628, #0D2040)' : '#0A1628',
                border: plan.highlight ? '1px solid rgba(0,212,255,0.35)' : '1px solid rgba(0,212,255,0.08)',
                boxShadow: plan.highlight ? '0 0 60px rgba(0,212,255,0.1)' : 'none',
              }}
            >
              {plan.highlight && (plan as any).badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', fontSize: 11, fontWeight: 700, color: '#050B14', whiteSpace: 'nowrap' }}
                >
                  {(plan as any).badge}
                </div>
              )}

              <div className="mb-5">
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5A7A9C', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                  {plan.name}
                </div>
                <div className="flex items-end gap-1">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 700, color: '#E8F0FE', lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ color: '#5A7A9C', fontSize: 14, marginBottom: 4 }}>{plan.period}</span>
                  )}
                </div>
                <p className="mt-2" style={{ fontSize: 13, color: '#5A7A9C', lineHeight: 1.6 }}>{plan.desc}</p>
              </div>

              <ul className="flex-1 space-y-2.5 mb-7">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Check size={15} style={{ color: plan.highlight ? '#00D4FF' : '#00C896', marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#8AA8C4' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onEnterDashboard}
                className="w-full py-3 rounded-xl transition-all duration-200"
                style={plan.highlight ? {
                  background: 'linear-gradient(135deg, #00D4FF, #0066FF)',
                  color: '#050B14',
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: '0 0 30px rgba(0,212,255,0.25)',
                } : {
                  background: 'transparent',
                  border: '1px solid rgba(0,212,255,0.2)',
                  color: '#00D4FF',
                  fontWeight: 600,
                  fontSize: 14,
                }}
                onMouseEnter={e => {
                  if (!plan.highlight) e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)';
                }}
                onMouseLeave={e => {
                  if (!plan.highlight) e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)';
                }}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
