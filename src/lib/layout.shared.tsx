import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ThemeLogo } from './theme-logo';
import { APP_CONFIG } from './api/config';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <div className="flex items-center gap-2 font-semibold">
        <ThemeLogo />
        <span className='sr-only'>{APP_CONFIG.name}</span>
      </div>,
      transparentMode: 'top',
    },
    links: [
      {
        type: 'menu',
        text: 'Guide',
        items: [
          {
            text: 'Getting Started',
            description: 'Learn to use Fumadocs',
            url: '/docs',
          },
        ],
      },
    ],
  };
}
