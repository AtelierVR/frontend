'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

const locales = [
    { code: 'en', local: en },
    { code: 'fr', local: fr },
    { code: 'de', local: de },
] as const;

export const SUPPORTED_LANGUAGES = locales.map((e) => ({
    code: e.code,
    name: ((e.local as unknown) as Record<string, Record<string, string>>).language?.name ?? e.code,
    local: e.local,
}));

if (!i18n.isInitialized)
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources: Object.fromEntries(SUPPORTED_LANGUAGES.map(e => ([
                e.code, { translation: e.local }
            ]))),
            fallbackLng: SUPPORTED_LANGUAGES[0].code,
            supportedLngs: SUPPORTED_LANGUAGES.map(e => e.code),
            interpolation: {
                escapeValue: false,
            },
            detection: {
                order: ['localStorage', 'navigator'],
                caches: ['localStorage'],
                lookupLocalStorage: 'i18nextLng',
            },
        });

export default i18n;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code'];
