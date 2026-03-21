import { useState } from 'react';
import { CurrentUser } from '@/lib/api/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search, XCircle } from 'lucide-react';
import { useLanguages } from '@/lib/hooks/useLanguages';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import {
  languageCodeToTag,
  tagToLanguageCode,
  extractLanguageTags,
} from './constants';

interface LanguagesSectionProps {
  tags: string[] | undefined;
  currentUser: CurrentUser | null;
  tagsFlag: number;
  canSaveFlag: number;
  onTagsChange: (tags: string[]) => void;
  onFlagChange: (flag: number) => void;
}

export default function LanguagesSection({
  tags,
  currentUser,
  tagsFlag,
  canSaveFlag,
  onTagsChange,
  onFlagChange,
}: LanguagesSectionProps) {
  const { t } = useTranslation();
  const { languages, loading, error } = useLanguages();
  const allTags = tags !== undefined ? tags : (currentUser?.tags || []);
  const selectedLanguages = extractLanguageTags(allTags);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = languages
    .filter(
      (language) =>
        !selectedLanguages.includes(language.code) &&
        (language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          language.code.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      // Mettre zxx en premier
      if (a.code === 'zxx') return -1;
      if (b.code === 'zxx') return 1;
      return 0;
    });

  const handleAddLanguage = (languageCode: string) => {
    const languageTag = languageCodeToTag(languageCode);
    const newTags = [...allTags, languageTag];
    onTagsChange(newTags);
    onFlagChange(tagsFlag | canSaveFlag);
  };

  const handleRemoveLanguage = (languageCode: string) => {
    const languageTag = languageCodeToTag(languageCode);
    const newTags = allTags.filter((tag) => tag !== languageTag);
    onTagsChange(newTags);
    onFlagChange(tagsFlag | canSaveFlag);
  };

  if (error) {
    return (
      <section id="languages">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('settings.profile.languages.title')}</h2>
          <p className="text-sm text-fd-destructive">
            {t('settings.profile.languages.load_error')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="languages">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t('settings.profile.languages.title')}</h2>
          <p className="text-sm text-fd-muted-foreground">
            {t('settings.profile.languages.description')}
          </p>
        </div>

        {/* Selected Languages Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('settings.profile.languages.selected', { count: selectedLanguages.length })}</h3>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-24 bg-fd-muted animate-pulse rounded-full"
                />
              ))
            ) : selectedLanguages.length > 0 ? (
              selectedLanguages.map((languageCode) => {
                const language = languages.find((l) => l.code === languageCode);
                if (!language) return null;
                return (
                  <Badge
                    key={languageCode}
                    variant="secondary"
                    className="gap-2 cursor-pointer hover:bg-fd-muted transition-colors px-3 py-1.5"
                    onClick={() => handleRemoveLanguage(languageCode)}
                  >
                    <img 
                      src={language.flags.svg} 
                      alt={language.name}
                      className="h-4 w-auto rounded-sm mt-0 mb-0"
                    />
                    <span>{language.name}</span>
                    <X className="size-3" />
                  </Badge>
                );
              })
            ) : (
              <p className="text-sm text-fd-muted-foreground">{t('settings.profile.languages.none')}</p>
            )}
          </div>
        </div>

        {/* Add Languages Section */}
        {!loading && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-sm font-medium">{t('settings.profile.languages.add')}</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fd-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('settings.profile.languages.search_placeholder')}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground transition-colors"
                  >
                    <XCircle className="size-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="h-48 overflow-y-auto pr-1">
              {filteredLanguages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredLanguages.map((language) => {
                    return (
                      <Badge
                        key={language.code}
                        variant="secondary"
                        className="gap-2 cursor-pointer hover:bg-fd-muted transition-colors px-3 py-1.5"
                        onClick={() => handleAddLanguage(language.code)}
                      >
                        <img 
                          src={language.flags.svg} 
                          alt={language.name}
                          className="h-4 w-auto rounded-sm mt-0 mb-0"
                        />
                        <span>{language.name}</span>
                        <Plus className="size-3" />
                      </Badge>
                    );
                  })}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-4">
                  <p className="text-sm text-fd-muted-foreground">
                    {t('settings.profile.languages.no_match')}
                  </p>
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                  >
                    {t('settings.profile.languages.clear_search')}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-fd-muted-foreground py-2">
                  {t('settings.profile.languages.all_added')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State for Add Languages Section */}
        {loading && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-sm font-medium">{t('settings.profile.languages.add')}</h3>
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
