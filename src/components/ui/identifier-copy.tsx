'use client';

import * as React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export interface IdentifierCopyProps {
  identifier: string;
  className?: string;
}

export function IdentifierCopy({ identifier, className }: IdentifierCopyProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(identifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn(
        'font-mono h-auto py-0 px-1 -mx-1',
        copied
          ? 'text-green-500 hover:text-green-500'
          : 'text-fd-muted-foreground hover:text-fd-foreground',
        className,
      )}
    >
      <span className="text-sm">{identifier}</span>
      {copied ? (
        <Icon icon="material-symbols:check-rounded" className="ml-1 size-3" />
      ) : (
        <Icon icon="material-symbols:content-copy-rounded" className="ml-1 size-3" />
      )}
    </Button>
  );
}
