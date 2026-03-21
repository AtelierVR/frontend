import { RootProvider } from 'fumadocs-ui/provider/next';
import { ApiProvider } from '@/lib/api';
import { APP_CONFIG } from '@/lib/api/config';
import { I18nProvider } from '@/lib/i18n';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen transition-all">
        <RootProvider>
          <ApiProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </ApiProvider>
        </RootProvider>
      </body>
    </html>
  );
}
