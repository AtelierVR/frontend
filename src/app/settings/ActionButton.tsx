import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';

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
    label: 'Save',
    loadingLabel: 'Saving...',
    className: 'bg-green-500/1 text-green-500 hover:bg-green-500/5 hover:text-green-400',
  },
  refresh: {
    iconName: 'material-symbols:refresh-rounded',
    label: 'Refresh',
    loadingLabel: 'Refreshing...',
    className: '',
  },
  stop: {
    iconName: 'material-symbols:power-settings-new-rounded',
    label: 'Stop',
    loadingLabel: 'Stopping...',
    className: 'bg-red-500/1 text-red-500 hover:bg-red-500/5 hover:text-red-400',
  },
  restart: {
    iconName: 'material-symbols:restart-alt-rounded',
    label: 'Restart',
    loadingLabel: 'Restarting...',
    className: 'bg-yellow-500/1 text-yellow-500 hover:bg-yellow-500/5 hover:text-yellow-400',
  },
};

export default function ActionButton({
  variant,
  onClick,
  isLoading,
  disabled = false,
  className,
}: ActionButtonProps) {
  const config = variantConfig[variant];

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      color={variant === 'save' ? 'primary' : 'outline'}
      size="sm"
      className={cn(isLoading && "cursor-wait", config.className, className)}
    >
      {isLoading ? (
        <>
          <Icon icon="material-symbols:progress-activity" className="mr-2 size-4 animate-spin" />
          {config.loadingLabel}
        </>
      ) : (
        <>
          <Icon icon={config.iconName} className={cn("size-4 mr-2")} />
          {config.label}
        </>
      )}
    </Button>
  );
}
