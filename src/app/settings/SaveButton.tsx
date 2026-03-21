import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

interface SaveButtonProps {
  onClick: () => void;
  hasChanges: boolean;
  isLoading: boolean;
  className?: string;
}

export default function SaveButton({
  onClick,
  hasChanges,
  isLoading,
  className,
}: SaveButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      disabled={!hasChanges}
      variant="primary"
      size="sm"
      className={cn(isLoading && "cursor-wait", className)}
    >
      {isLoading ? (
        <>
          <Icon icon="material-symbols:progress-activity" className="mr-2 size-4 animate-spin" />
          {t('settings.action_button.saving')}
        </>
      ) : (
        <>
          <Icon icon="material-symbols:save-rounded" className="mr-2 size-4" />
          {t('settings.action_button.save')}
        </>
      )}
    </Button>
  );
}
