import { createContext, useContext, useEffect, useState } from 'react';
import { translations, Lang, Translations } from './translations';

interface LangCtx {
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
  detected: boolean;
}

const Ctx = createContext<LangCtx>({
  lang: 'en',
  t: translations.en,
  setLang: () => {},
  detected: false,
});

const IP_LANG_MAP: Record<string, Lang> = {
  RU: 'ru', BY: 'ru', KZ: 'ru', UA: 'ru',
  CN: 'zh', TW: 'zh', HK: 'zh',
};

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ncb_lang') as Lang | null;
    if (saved && translations[saved]) {
      setLangState(saved);
      setDetected(true);
      return;
    }
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const code = data?.country_code as string;
        const mapped = IP_LANG_MAP[code] ?? 'en';
        setLangState(mapped);
        setDetected(true);
      })
      .catch(() => {
        setLangState('en');
        setDetected(true);
      });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('ncb_lang', l);
  };

  return (
    <Ctx.Provider value={{ lang, t: translations[lang], setLang, detected }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);
