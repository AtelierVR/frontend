import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText } from '@/components/ui/input-group';
import { CurrentUser } from '@/lib/api/types';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

interface UsernameSectionProps {
  username: string | undefined;
  currentUser: CurrentUser | null;
  usernameFlag: number;
  canSaveFlag: number;
  onUsernameChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
}

export default function UsernameSection({
  username,
  currentUser,
  usernameFlag,
  canSaveFlag,
  onUsernameChange,
  onFlagChange,
}: UsernameSectionProps) {
  const { t } = useTranslation();
  const currentServer = currentUser?.server || 'unknown';

  return (
    <section id="username">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t('settings.account.username.title')}</h2>
        <p className="text-sm text-fd-muted-foreground">
          {t('settings.account.username.description')}
        </p>
        <InputGroup>
          <InputGroupInput
            id="username"
            value={username === undefined ? (currentUser?.username || '') : username}
            onChange={(e) => {
              onUsernameChange(e.target.value);
              onFlagChange(usernameFlag | canSaveFlag);
            }}
            placeholder={currentUser?.username || t('settings.account.username.placeholder')}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>@{currentServer}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </section>
  );
}
