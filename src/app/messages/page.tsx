'use client';

import { useRouter } from 'next/navigation';
import { useApi, useConversations } from '@/lib/api';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { ConversationCard, ConversationListSkeleton } from './components';

export default function MessagesPage() {
  const Api = useApi();
  const router = useRouter();
  const { conversations, users, loading, error } = useConversations();
  const currentUserIid = Api.currentUser?.alias?.find(a => a.key === 'iid')?.value;

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsTitle>Messages</DocsTitle>
      <DocsDescription>
        Gérez vos conversations et messages privés
      </DocsDescription>
      <DocsBody>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icon icon="material-symbols:error-circle-rounded" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {loading && conversations.length === 0 ? (
            <ConversationListSkeleton />
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-fd-muted-foreground">
              <Icon icon="material-symbols:inbox-rounded" className="size-12 mx-auto mb-4 opacity-50" />
              <p>Aucune conversation pour le moment</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                conversation={conv}
                users={users}
                currentUserIid={currentUserIid}
                onSelect={() => router.push(`/messages/${conv.id}`)}
              />
            ))
          )}
        </div>
      </DocsBody>
    </DocsPage>
  );
}
