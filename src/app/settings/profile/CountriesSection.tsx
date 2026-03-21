import { useState } from 'react';
import { CurrentUser } from '@/lib/api/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { useCountries } from '@/lib/hooks/useCountries';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import {
  countryCodeToTag,
  tagToCountryCode,
  extractCountryTags,
} from './constants';

interface CountriesSectionProps {
  tags: string[] | undefined;
  currentUser: CurrentUser | null;
  tagsFlag: number;
  canSaveFlag: number;
  onTagsChange: (tags: string[]) => void;
  onFlagChange: (flag: number) => void;
}

export default function CountriesSection({
  tags,
  currentUser,
  tagsFlag,
  canSaveFlag,
  onTagsChange,
  onFlagChange,
}: CountriesSectionProps) {
  const { t } = useTranslation();
  const { countries, loading, error } = useCountries();
  const allTags = tags !== undefined ? tags : (currentUser?.tags || []);
  const selectedCountries = extractCountryTags(allTags);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries
    .filter(
      (country) =>
        !selectedCountries.includes(country.cca2) &&
        (country.name.common.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.cca2.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      // Mettre XX en premier
      if (a.cca2 === 'XX') return -1;
      if (b.cca2 === 'XX') return 1;
      return 0;
    });

  const handleAddCountry = (countryCode: string) => {
    const countryTag = countryCodeToTag(countryCode);
    const newTags = [...allTags, countryTag];
    onTagsChange(newTags);
    onFlagChange(tagsFlag | canSaveFlag);
  };

  const handleRemoveCountry = (countryCode: string) => {
    const countryTag = countryCodeToTag(countryCode);
    const newTags = allTags.filter((tag) => tag !== countryTag);
    onTagsChange(newTags);
    onFlagChange(tagsFlag | canSaveFlag);
  };

  if (error) {
    return (
      <section id="countries">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('settings.profile.countries.title')}</h2>
          <p className="text-sm text-fd-destructive">
            {t('settings.profile.countries.load_error')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="countries">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t('settings.profile.countries.title')}</h2>
          <p className="text-sm text-fd-muted-foreground">
            {t('settings.profile.countries.description')}
          </p>
        </div>

        {/* Selected Countries Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('settings.profile.countries.selected', { count: selectedCountries.length })}</h3>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-24 bg-fd-muted animate-pulse rounded-full"
                />
              ))
            ) : selectedCountries.length > 0 ? (
              selectedCountries.map((countryCode) => {
                const country = countries.find((c) => c.cca2 === countryCode);
                if (!country) return null;
                return (
                  <Badge
                    key={countryCode}
                    variant="secondary"
                    className="gap-2 cursor-pointer hover:bg-fd-muted transition-colors px-3 py-1.5"
                    onClick={() => handleRemoveCountry(countryCode)}
                  >
                    <img 
                      src={country.flags.svg} 
                      alt={country.name.common}
                      className="h-4 w-auto rounded-sm mt-0 mb-0"
                    />
                    <span>{country.name.common}</span>
                    <Icon icon="material-symbols:close-rounded" className="size-3" />
                  </Badge>
                );
              })
            ) : (
              <p className="text-sm text-fd-muted-foreground">{t('settings.profile.countries.none')}</p>
            )}
          </div>
        </div>

        {/* Add Countries Section */}
        {!loading && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-sm font-medium">{t('settings.profile.countries.add')}</h3>
              <div className="relative w-full sm:w-64">
                <Icon icon="material-symbols:search-rounded" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fd-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('settings.profile.countries.search_placeholder')}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground transition-colors"
                  >
                    <Icon icon="material-symbols:close-rounded" className="size-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="h-48 overflow-y-auto pr-1">
              {filteredCountries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredCountries.map((country) => (
                    <Badge
                      key={country.cca2}
                      variant="secondary"
                      className="gap-2 cursor-pointer hover:bg-fd-muted transition-colors px-3 py-1.5"
                      onClick={() => handleAddCountry(country.cca2)}
                    >
                      <img 
                        src={country.flags.svg} 
                        alt={country.name.common}
                        className="h-4 w-auto rounded-sm mt-0 mb-0"
                      />
                      <span>{country.name.common}</span>
                      <Icon icon="material-symbols:add-rounded" className="size-3" />
                    </Badge>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-4">
                  <p className="text-sm text-fd-muted-foreground">
                    {t('settings.profile.countries.no_match')}
                  </p>
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                  >
                    {t('settings.profile.countries.clear_search')}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-fd-muted-foreground py-2">
                  {t('settings.profile.countries.all_added')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State for Add Countries Section */}
        {loading && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-sm font-medium">{t('settings.profile.countries.add')}</h3>
            </div>
            <div className="h-48 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-32 bg-fd-muted animate-pulse rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
