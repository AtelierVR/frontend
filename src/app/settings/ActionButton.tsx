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
    color: 'primary' as const,
    className: '',
  },
  refresh: {
    iconName: 'material-symbols:refresh-rounded',
    label: 'Refresh',
    loadingLabel: 'Refreshing...',
    color: 'outline' as const,
    className: '',
  },
  stop: {
    iconName: 'material-symbols:power-settings-new-rounded',
    label: 'Stop',
    loadingLabel: 'Stopping...',
    color: undefined,
    className: 'bg-red-500 text-black hover:bg-red-500/80',
  },
  restart: {
    iconName: 'material-symbols:restart-alt-rounded',
    label: 'Restart',
    loadingLabel: 'Restarting...',
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
          {config.loadingLabel}
        </>
      ) : (
        <>
          <Icon icon={config.iconName} className={cn("size-4 mr-1")} />
          {config.label}
        </>
      )}
    </Button>
  );
}
