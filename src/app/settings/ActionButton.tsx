import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';

type ActionButtonVariant = 'save' | 'refresh';

interface ActionButtonProps {
  variant: ActionButtonVariant;
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
  },
  refresh: {
    iconName: 'material-symbols:refresh-rounded',
    label: 'Refresh',
    loadingLabel: 'Refreshing...',
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
      color={variant === 'save' ? 'primary' : 'ghost'}
      size="sm"
      className={cn(isLoading && "cursor-wait", className)}
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
