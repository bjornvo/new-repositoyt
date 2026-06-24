import { motion } from 'motion/react';
import { Wallet, Zap, TrendingUp, CreditCard, Shield, ArrowLeftRight } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

const ICONS = [Wallet, Zap, TrendingUp, CreditCard, Shield, ArrowLeftRight];

export function Features() {
  const { t } = useLang();

  return (
    <section id="features" className="py-28" style={{ background: '#050B14' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            <span style={{ color: '#00D4FF', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
              {t.features.badge}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800,
              color: '#E8F0FE',
              letterSpacing: -1,
              lineHeight: 1.15,
              whiteSpace: 'pre-line',
            }}
          >
            {t.features.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-4 max-w-xl mx-auto"
            style={{ color: '#5A7A9C', fontSize: 17, lineHeight: 1.7 }}
          >
            {t.features.sub}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group p-6 rounded-2xl cursor-default"
                style={{
                  background: '#0A1628',
                  border: '1px solid rgba(0,212,255,0.08)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.12)' }}
                >
                  <Icon size={22} style={{ color: '#00D4FF' }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E8F0FE', marginBottom: 8 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: '#5A7A9C', lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
