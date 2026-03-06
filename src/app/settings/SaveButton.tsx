import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';

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
          Saving...
        </>
      ) : (
        <>
          <Icon icon="material-symbols:save-rounded" className="mr-2 size-4" />
          Save
        </>
      )}
    </Button>
  );
}
