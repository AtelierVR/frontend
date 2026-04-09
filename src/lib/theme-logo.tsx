'use client';

import { useApi } from './api';
import { cn } from './cn';

export function ThemeLogo(props: React.HTMLAttributes<HTMLDivElement>) {
  let api = useApi();

  const url = api.server instanceof Error ? '/icon.png' : api.server?.metadata?.icon ?? '/icon.png';

  return <div
    {...props}
    className={cn(
      "w-8 h-8 relative",
      props.className
    )}
    style={{
      WebkitMaskImage: `url(${url})`,
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskImage: `url(${url})`,
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
      backgroundColor: 'var(--color-fd-accent-foreground)',
      ...props.style
    }}
    aria-label={api.server instanceof Error ? 'Nox Node' : api.server?.metadata?.title ?? 'Nox Node'}
  />;
}