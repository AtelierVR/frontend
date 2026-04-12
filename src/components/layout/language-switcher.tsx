'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { countriesService } from '@/lib/countries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANG_TO_COUNTRY: Record<string, string> = {
  en: 'GB', fr: 'FR', de: 'DE', es: 'ES', it: 'IT', pt: 'PT',
  ja: 'JP', zh: 'CN', ko: 'KR', ru: 'RU', ar: 'SA', nl: 'NL',
  pl: 'PL', sv: 'SE', no: 'NO', da: 'DK', fi: 'FI', tr: 'TR',
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [flags, setFlags] = useState<Record<string, string>>({});

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
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('language.choose')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[7px] text-sm text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors',
          className,
        )}
      >
        {currentFlagSvg
          ? <span className="inline-flex w-5 items-center justify-center flex-shrink-0"><img src={currentFlagSvg} alt={currentLang.name} className="h-4 w-full object-cover rounded-sm" /></span>
          : <span className="inline-flex w-5 items-center justify-center flex-shrink-0 text-base leading-none">🏳️</span>
        }
        <span className="font-medium">{currentLang.code.toUpperCase()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuLabel className="text-xs font-medium text-fd-muted-foreground">
          {t('language.choose')}
        </DropdownMenuLabel>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={cn(
              'gap-2.5',
              lang.code === i18n.language && 'bg-fd-primary/10 font-medium text-fd-primary',
            )}
            onClick={() => i18n.changeLanguage(lang.code)}
          >
            {flags[lang.code]
              ? <span className="inline-flex w-5 items-center justify-center flex-shrink-0"><img src={flags[lang.code]} alt={lang.name} className="h-4 w-full object-cover rounded-sm" /></span>
              : <span className="inline-flex w-5 items-center justify-center flex-shrink-0 text-base">🏳️</span>
            }
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
