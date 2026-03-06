'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { useApi, isError, RelayClientsResult } from '@/lib/api';

export default function RelayClientsPage() {
  const params = useParams();
  const Api = useApi();
  const [data, setData] = useState<RelayClientsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const relayId = Number(params.id);

  useEffect(() => {
    const load = async () => {
      if (!Api || !relayId) return;
      setLoading(true);
      setError(undefined);
      try {
        const res = await Api.fetchRelayClients(relayId);
        if (isError(res)) { setError(res.message); return; }
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clients');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [Api, relayId]);

  if (loading) return (
    <div className="space-y-3">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );

  if (error) return (
    <Alert variant="destructive">
      <Icon icon="material-symbols:error-circle-rounded" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  const clients = data?.clients ?? [];

  if (clients.length === 0) return (
    <Card className="p-8 text-center text-fd-muted-foreground">
      <Icon icon="material-symbols:dns-rounded" className="size-12 mx-auto mb-4 opacity-50" />
      <p>No clients connected</p>
    </Card>
  );

  return (
    <div className="space-y-3">
      {data && (
        <div className="text-sm text-fd-muted-foreground mb-2">
          {data.total} client{data.total !== 1 ? 's' : ''} connecté{data.total !== 1 ? 's' : ''}
        </div>
      )}
      {clients.map((client, idx) => (
        <Card key={client.id ?? idx} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Icon icon="material-symbols:computer-rounded" className="size-5 text-purple-500" />
              </div>
              <div>
                <div className="font-medium font-mono text-sm">
                  {client.user ?? `Client #${client.id}`}
                </div>
                <div className="text-xs text-fd-muted-foreground mt-0.5">
                  {client.platform} • {client.engine} • {client.address}
                </div>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded-full">
              Connected
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
