import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { CurrentUser } from '@/lib/api/types';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

interface PronounSectionProps {
  pronoun: string | null | undefined;
  currentUser: CurrentUser | null;
  pronounFlag: number;
  canSaveFlag: number;
  onPronounChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
}

export default function PronounSection({
  pronoun,
  currentUser,
  pronounFlag,
  canSaveFlag,
  onPronounChange,
  onFlagChange,
}: PronounSectionProps) {
  const { t } = useTranslation();
  return (
    <section id="pronoun">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t('settings.profile.pronoun.title')}</h2>
        <p className="text-sm text-fd-muted-foreground">
          {t('settings.profile.pronoun.description')}
        </p>
        <InputGroup>
          <InputGroupInput
            id="pronoun"
            value={pronoun === undefined ? (currentUser?.pronoun ?? '') : (pronoun ?? '')}
            onChange={(e) => {
              onPronounChange(e.target.value);
              onFlagChange(pronounFlag | canSaveFlag);
            }}
            placeholder={currentUser?.pronoun || t('settings.profile.pronoun.placeholder')}
          />
        </InputGroup>
      </div>
    </section>
  );
}
