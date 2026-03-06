// Tag conversion helpers
export const countryCodeToTag = (code: string) => `usr:country_${code.toLowerCase()}`;
export const tagToCountryCode = (tag: string) => tag.replace('usr:country_', '').toUpperCase();
export const isCountryTag = (tag: string) => tag.startsWith('usr:country_');

export const languageCodeToTag = (code: string) => `usr:lang_${code.toLowerCase()}`;
export const tagToLanguageCode = (tag: string) => tag.replace('usr:lang_', '');
export const isLanguageTag = (tag: string) => tag.startsWith('usr:lang_');

export const extractCountryTags = (tags: string[]) =>
    tags.filter(isCountryTag).map(tagToCountryCode);

export const extractLanguageTags = (tags: string[]) =>
    tags.filter(isLanguageTag).map(tagToLanguageCode);

