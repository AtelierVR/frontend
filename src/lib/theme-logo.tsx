'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le chargement, afficher le logo par défaut
  if (!mounted) {
    return (
      <div 
        className="w-8 h-8 relative"
        style={{
          WebkitMaskImage: 'url(/icon.png)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: 'url(/icon.png)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          backgroundColor: 'var(--color-fd-accent-foreground)',
        }}
        aria-label="Nox Logo"
      />
    );
  }

  return (
    <div 
      className="w-8 h-8 relative"
      style={{
        WebkitMaskImage: 'url(/icon.png)',
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: 'url(/icon.png)',
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        backgroundColor: 'var(--color-fd-accent-foreground)',
      }}
      aria-label="Nox Logo"
    />
  );
}
