import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

interface ActionButtonProps {
  variant: keyof typeof variantConfig;
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  className?: string;
}

const variantConfig = {
  save: {
    iconName: 'material-symbols:save-rounded',
    labelKey: 'settings.action_button.save',
    loadingLabelKey: 'settings.action_button.saving',
    color: 'primary' as const,
    className: '',
  },
  refresh: {
    iconName: 'material-symbols:refresh-rounded',
    labelKey: 'settings.action_button.refresh',
    loadingLabelKey: 'settings.action_button.refreshing',
    color: 'outline' as const,
    className: '',
  },
  stop: {
    iconName: 'material-symbols:power-settings-new-rounded',
    labelKey: 'settings.action_button.stop',
    loadingLabelKey: 'settings.action_button.stopping',
    color: undefined,
    className: 'bg-red-500 text-black hover:bg-red-500/80',
  },
  restart: {
    iconName: 'material-symbols:restart-alt-rounded',
    labelKey: 'settings.action_button.restart',
    loadingLabelKey: 'settings.action_button.restarting',
    color: undefined,
    className: 'bg-amber-500 text-black hover:bg-amber-500/80',
  },
};

export default function ActionButton({
  variant,
  onClick,
  isLoading,
  disabled = false,
  className,
}: ActionButtonProps) {
  const { t } = useTranslation();
  const config = variantConfig[variant];

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      color={config.color}
      size="sm"
      className={cn(isLoading && "cursor-wait", config.className, className)}
    >
      {isLoading ? (
        <>
          <Icon icon="material-symbols:progress-activity" className="mr-1 size-4 animate-spin" />
          {t(config.loadingLabelKey)}
        </>
      ) : (
        <>
          <Icon icon={config.iconName} className={cn("size-4 mr-1")} />
          {t(config.labelKey)}
        </>
      )}
    </Button>
  );
}
