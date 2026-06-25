import { useLang } from '../../i18n/LangContext';
import { Twitter, Github, MessageCircle } from 'lucide-react';

export function Footer() {
  const { t } = useLang();
  const cols = [
    { title: t.footer.products, links: t.footer.productLinks },
    { title: t.footer.company, links: t.footer.companyLinks },
    { title: t.footer.legal, links: t.footer.legalLinks },
  ];

  return (
    <footer style={{ background: '#030810', borderTop: '1px solid rgba(0,212,255,0.08)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="NovaCrypt" className="w-7 h-7 rounded-lg" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#E8F0FE' }}>
                Nova<span style={{ color: '#00D4FF' }}>Crypt</span>
              </span>
            </div>
            <p style={{ color: '#5A7A9C', fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>
              {t.footer.tagline}
            </p>
            <div className="flex gap-3 mt-5">
              {[Twitter, Github, MessageCircle].map((Icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.1)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.1)'}
                >
                  <Icon size={14} style={{ color: '#5A7A9C' }} />
                </button>
              ))}
            </div>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#E8F0FE', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href="#"
                      style={{ color: '#5A7A9C', fontSize: 13, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#E8F0FE'}
                      onMouseLeave={e => e.currentTarget.style.color = '#5A7A9C'}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}
        >
          <span style={{ color: '#3A5A7C', fontSize: 12 }}>{t.footer.copy}</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
            <span style={{ color: '#3A5A7C', fontSize: 12 }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
