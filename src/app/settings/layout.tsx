'use client';

import { getPageTree } from './source';
import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { useApi } from '@/lib/api';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const Api = useApi();
  const { t } = useTranslation();
  const pageTree = getPageTree(Api.currentUser, t);
  const options = baseOptions();

  return <DocsLayout tree={pageTree} {...options} themeSwitch={{ component: <div className="flex items-center gap-1.5 ml-auto"><ThemeToggle /><LanguageSwitcher /></div> }}>
    {children}
  </DocsLayout>;
}
