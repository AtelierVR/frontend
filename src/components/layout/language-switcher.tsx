'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { countriesService } from '@/lib/countries';

const LANG_TO_COUNTRY: Record<string, string> = {
  en: 'GB', fr: 'FR', de: 'DE', es: 'ES', it: 'IT', pt: 'PT',
  ja: 'JP', zh: 'CN', ko: 'KR', ru: 'RU', ar: 'SA', nl: 'NL',
  pl: 'PL', sv: 'SE', no: 'NO', da: 'DK', fi: 'FI', tr: 'TR',
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    Promise.all(
      SUPPORTED_LANGUAGES.map(async (lang) => {
        const countryCode = LANG_TO_COUNTRY[lang.code];
        const country = countryCode ? await countriesService.getByISO(countryCode) : null;
        return [lang.code, country?.flags.svg ?? ''] as const;
      })
    ).then((entries) => setFlags(Object.fromEntries(entries)));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.top - 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((o) => !o);
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-full border p-1 gap-0.5 min-w-[3.5rem]',
          className,
        )}
      />
    );
  }

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];
  const currentFlagSvg = flags[currentLang.code];

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        aria-label={t('language.choose')}
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[7px] text-sm text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors"
      >
        {currentFlagSvg
          ? <span className="inline-flex w-5 items-center justify-center flex-shrink-0"><img src={currentFlagSvg} alt={currentLang.name} className="h-4 w-full object-cover rounded-sm" /></span>
          : <span className="inline-flex w-5 items-center justify-center flex-shrink-0 text-base leading-none">🏳️</span>
        }
        <span className="font-medium">{currentLang.code.toUpperCase()}</span>
      </button>

      {open && (
        <div
          style={{ bottom: `calc(100vh - ${dropdownPos.top}px)`, right: dropdownPos.right }}
          className="fixed z-50 min-w-[10rem] overflow-hidden rounded-xl border border-fd-border bg-fd-popover shadow-lg py-1"
        >
          <p className="px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">
            {t('language.choose')}
          </p>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                lang.code === i18n.language
                  ? 'bg-fd-primary/10 font-medium text-fd-primary'
                  : 'hover:bg-fd-accent hover:text-fd-accent-foreground',
              )}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
            >
              {flags[lang.code]
                ? <span className="inline-flex w-5 items-center justify-center flex-shrink-0"><img src={flags[lang.code]} alt={lang.name} className="h-4 w-full object-cover rounded-sm" /></span>
                : <span className="inline-flex w-5 items-center justify-center flex-shrink-0 text-base">🏳️</span>
              }
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
