import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

export function Security() {
  const { t } = useLang();

  return (
    <section id="security" className="py-28 relative" style={{ background: '#070F1C' }}>
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 70% 50%, rgba(0,102,255,0.1) 0%, transparent 60%)`,
        }}
      />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)' }}
            >
              <Lock size={12} style={{ color: '#F0B429' }} />
              <span style={{ color: '#F0B429', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
                {t.security.badge}
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
              {t.security.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-4 mb-10"
              style={{ color: '#5A7A9C', fontSize: 17, lineHeight: 1.7, maxWidth: 460 }}
            >
              {t.security.sub}
            </motion.p>

            {/* Security badges */}
            <div className="flex flex-wrap gap-3">
              {['SOC 2', 'ISO 27001', 'PCI DSS', 'GDPR'].map(badge => (
                <span
                  key={badge}
                  className="px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(240,180,41,0.06)',
                    border: '1px solid rgba(240,180,41,0.15)',
                    color: '#F0B429',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.security.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(10,22,40,0.8)',
                  border: '1px solid rgba(0,212,255,0.08)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#00D4FF', marginBottom: 4, letterSpacing: 0.3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, color: '#5A7A9C', lineHeight: 1.6 }}>
                  {item.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
