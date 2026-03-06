'use client';

import { getPageTree } from './source';
import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { useApi } from '@/lib/api';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const Api = useApi();
  const pageTree = getPageTree(Api.currentUser);

  return <DocsLayout tree={pageTree} {...baseOptions()}>
    {children}
  </DocsLayout>;
}
