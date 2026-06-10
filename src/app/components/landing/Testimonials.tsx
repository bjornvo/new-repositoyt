import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

const AVATARS = ['https://i.pravatar.cc/48?img=11', 'https://i.pravatar.cc/48?img=47', 'https://i.pravatar.cc/48?img=32', 'https://i.pravatar.cc/48?img=58'];

export function Testimonials() {
  const { t } = useLang();

  return (
    <section className="py-28" style={{ background: '#070F1C' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            <span style={{ color: '#00D4FF', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
              {t.testimonials.badge}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#E8F0FE', letterSpacing: -1, lineHeight: 1.15, whiteSpace: 'pre-line' }}
          >
            {t.testimonials.title}
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {t.testimonials.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl"
              style={{ background: '#0A1628', border: '1px solid rgba(0,212,255,0.08)' }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} fill="#F0B429" style={{ color: '#F0B429' }} />
                ))}
              </div>
              <p className="mb-5" style={{ color: '#8AA8C4', fontSize: 15, lineHeight: 1.75 }}>
                "{item.text}"
              </p>
              <div className="flex items-center gap-3">
                <img src={AVATARS[i]} alt={item.name} className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid rgba(0,212,255,0.2)' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#E8F0FE' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#5A7A9C' }}>{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
