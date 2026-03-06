import { countriesService } from './countries';

export interface Language {
    code: string;
    name: string;
    flag: string;
    flags: {
        png: string;
        svg: string;
        alt: string;
    };
}

// Mapping of language codes to their primary country codes (ISO 3166-1 alpha-2)
const LANGUAGE_TO_PRIMARY_COUNTRY: Record<string, string> = {
    // ISO 639-1 (2 letters)
    'en': 'GB', 'es': 'ES', 'fr': 'FR', 'de': 'DE', 'it': 'IT',
    'pt': 'PT', 'ja': 'JP', 'zh': 'CN', 'ko': 'KR', 'ar': 'SA',
    'ru': 'RU', 'hi': 'IN', 'bn': 'BD', 'pa': 'IN', 'te': 'IN',
    'mr': 'IN', 'ta': 'IN', 'ur': 'PK', 'gu': 'IN', 'kn': 'IN',
    'ml': 'IN', 'th': 'TH', 'vi': 'VN', 'tr': 'TR', 'pl': 'PL',
    'uk': 'UA', 'ro': 'RO', 'nl': 'NL', 'el': 'GR', 'cs': 'CZ',
    'sv': 'SE', 'hu': 'HU', 'fi': 'FI', 'no': 'NO', 'da': 'DK',
    'he': 'IL', 'id': 'ID', 'ms': 'MY', 'fa': 'IR', 'sw': 'KE',
    'jv': 'ID', 'ca': 'ES', 'sk': 'SK', 'bg': 'BG', 'hr': 'HR',
    'lt': 'LT', 'sl': 'SI', 'et': 'EE', 'lv': 'LV', 'is': 'IS',
    'ga': 'IE', 'mt': 'MT', 'sq': 'AL', 'mk': 'MK', 'sr': 'RS',
    'bs': 'BA', 'my': 'MM', 'km': 'KH', 'lo': 'LA', 'ne': 'NP',
    'si': 'LK', 'am': 'ET', 'az': 'AZ', 'kk': 'KZ', 'uz': 'UZ',
    'tg': 'TJ', 'mn': 'MN',
    // ISO 639-2/3 (3 letters)
    'eng': 'GB', 'spa': 'ES', 'fra': 'FR', 'deu': 'DE', 'ita': 'IT',
    'por': 'PT', 'jpn': 'JP', 'zho': 'CN', 'kor': 'KR', 'ara': 'SA',
    'rus': 'RU', 'hin': 'IN', 'ben': 'BD', 'pan': 'IN', 'tel': 'IN',
    'mar': 'IN', 'tam': 'IN', 'urd': 'PK', 'guj': 'IN', 'kan': 'IN',
    'mal': 'IN', 'tha': 'TH', 'vie': 'VN', 'tur': 'TR', 'pol': 'PL',
    'ukr': 'UA', 'ron': 'RO', 'nld': 'NL', 'ell': 'GR', 'ces': 'CZ',
    'swe': 'SE', 'hun': 'HU', 'fin': 'FI', 'nor': 'NO', 'dan': 'DK',
    'heb': 'IL', 'ind': 'ID', 'msa': 'MY', 'fas': 'IR', 'swa': 'KE',
    'cat': 'ES', 'glg': 'ES', 'eus': 'ES', 'bul': 'BG', 'hrv': 'HR',
    'slk': 'SK', 'slv': 'SI', 'lit': 'LT', 'lav': 'LV', 'est': 'EE',
    'isl': 'IS', 'gle': 'IE', 'mlt': 'MT', 'mkd': 'MK', 'alb': 'AL',
    'sqi': 'AL', 'srp': 'RS', 'bos': 'BA', 'aze': 'AZ', 'kaz': 'KZ',
    'uzb': 'UZ', 'tgk': 'TJ', 'mon': 'MN', 'nep': 'NP', 'sin': 'LK',
    'mya': 'MM', 'khm': 'KH', 'lao': 'LA', 'amh': 'ET', 'som': 'SO',
};

class LanguagesService {
    private data: Language[] | null = null;
    private promise: Promise<Language[]> | null = null;

    async get(): Promise<Language[]> {
        if (this.data) return this.data;
        if (this.promise) return this.promise;

        this.promise = countriesService
            .get()
            .then((countries) => {
                const languageMap = new Map<string, Language>();
                const countryByCode = new Map(countries.map(c => [c.cca2, c]));

                for (const country of countries)
                    if (country.languages)
                        for (const [code, name] of Object.entries(country.languages))
                            if (!languageMap.has(code)) {
                                // Find the primary country for this language
                                const primaryCountryCode = LANGUAGE_TO_PRIMARY_COUNTRY[code];
                                const primaryCountry = primaryCountryCode 
                                    ? countryByCode.get(primaryCountryCode) 
                                    : country; // Fallback to first country found

                                languageMap.set(code, {
                                    code,
                                    name,
                                    flag: primaryCountry?.flag || '🏳️',
                                    flags: primaryCountry?.flags || {
                                        png: '',
                                        svg: '',
                                        alt: `${name} flag`
                                    }
                                });
                            }

                this.data = Array.from(languageMap.values())
                    .sort((a, b) => a.name.localeCompare(b.name));

                return this.data;
            });

        return this.promise;
    }

    async getByCode(code: string): Promise<Language | null> {
        const languages = await this.get();
        return languages.find((l) => l.code.toLowerCase() === code.toLowerCase()) || null;
    }

    clearCache(): void {
        this.data = null;
        this.promise = null;
    }
}

export const languagesService = new LanguagesService();
