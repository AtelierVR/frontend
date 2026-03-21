import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { CurrentUser } from '@/lib/api/types';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

interface BioSectionProps {
  bio: string | null | undefined;
  currentUser: CurrentUser | null;
  bioFlag: number;
  canSaveFlag: number;
  onBioChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
}

export default function BioSection({
  bio,
  currentUser,
  bioFlag,
  canSaveFlag,
  onBioChange,
  onFlagChange,
}: BioSectionProps) {
  const { t } = useTranslation();
  return (
    <section>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t('settings.profile.bio.title')}</h2>
        <p className="text-sm text-fd-muted-foreground">
          {t('settings.profile.bio.description')}
        </p>
        <InputGroup>
          <InputGroupTextarea
            id="bio"
            value={(bio === undefined ? currentUser?.bio : bio) || ''}
            onChange={(e) => {
              onBioChange(e.target.value);
              onFlagChange(bioFlag | canSaveFlag);
            }}
            placeholder={currentUser?.bio || t('settings.profile.bio.placeholder')}
            rows={12}
            maxLength={500}
          />
          <InputGroupAddon align="block-end">
            <InputGroupText className="text-xs tabular-nums">
              {(bio === undefined ? currentUser?.bio : bio)?.length || 0}/500 {t('settings.profile.bio.characters')}
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </section>
  );
}
