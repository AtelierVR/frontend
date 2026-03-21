import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { CurrentUser } from '@/lib/api/types';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

interface DisplaySectionProps {
  display: string | undefined;
  currentUser: CurrentUser | null;
  displayFlag: number;
  canSaveFlag: number;
  onDisplayChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
}

export default function DisplaySection({
  display,
  currentUser,
  displayFlag,
  canSaveFlag,
  onDisplayChange,
  onFlagChange,
}: DisplaySectionProps) {
  const { t } = useTranslation();
  return (
    <section id="basic-information">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t('settings.profile.display.title')}</h2>
        <p className="text-sm text-fd-muted-foreground">
          {t('settings.profile.display.description')}
        </p>
        <InputGroup>
          <InputGroupInput
            id="display"
            value={display === undefined ? (currentUser?.display || '') : display}
            onChange={(e) => {
              onDisplayChange(e.target.value);
              onFlagChange(displayFlag | canSaveFlag);
            }}
            placeholder={currentUser?.display || t('settings.profile.display.placeholder')}
          />
        </InputGroup>
      </div>
    </section>
  );
}
