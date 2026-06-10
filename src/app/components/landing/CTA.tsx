import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

export function CTA() {
  const { t } = useLang();
  const navigate = useNavigate();
  const onEnterDashboard = () => navigate('/get-started');
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: '#050B14' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,102,255,0.15) 0%, transparent 70%)' }}
        />
      </div>
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#E8F0FE', letterSpacing: -1.5, lineHeight: 1.1, whiteSpace: 'pre-line' }}
        >
          {t.cta.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-5 mb-10"
          style={{ color: '#5A7A9C', fontSize: 18, lineHeight: 1.7 }}
        >
          {t.cta.sub}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <button
            onClick={onEnterDashboard}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #0066FF)',
              color: '#050B14',
              fontSize: 16,
              fontWeight: 700,
              boxShadow: '0 0 60px rgba(0,212,255,0.35)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 80px rgba(0,212,255,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 60px rgba(0,212,255,0.35)'; e.currentTarget.style.transform = 'none'; }}
          >
            {t.cta.btn}
            <ArrowRight size={18} />
          </button>
          <p className="mt-4" style={{ color: '#5A7A9C', fontSize: 13 }}>{t.cta.sub2}</p>
        </motion.div>
      </div>
    </section>
  );
}
