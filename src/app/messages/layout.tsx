'use client';

import { usePageTree } from './source';
import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { useApi, ConversationsProvider } from '@/lib/api';

export default function MessagesLayout({ children }: { children: ReactNode }) {
  const Api = useApi();
  
  return (
    <ConversationsProvider>
      <MessagesLayoutContent>
        {children}
      </MessagesLayoutContent>
    </ConversationsProvider>
  );
}

function MessagesLayoutContent({ children }: { children: ReactNode }) {
  const Api = useApi();
  const tree = usePageTree(Api.currentUser);

  return <DocsLayout tree={tree} {...baseOptions()}>
    {children}
  </DocsLayout>;
}
