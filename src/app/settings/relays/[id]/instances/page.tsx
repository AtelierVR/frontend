'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { useApi, isError, RelayInstancesResult } from '@/lib/api';
import { cn } from '@/lib/cn';

export default function RelayInstancesPage() {
  const params = useParams();
  const router = useRouter();
  const Api = useApi();
  const [data, setData] = useState<RelayInstancesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const relayId = Number(params.id);

  useEffect(() => {
    const load = async () => {
      if (!Api || !relayId) return;
      setLoading(true);
      setError(undefined);
      try {
        const res = await Api.fetchRelayInstances(relayId);
        if (isError(res)) { setError(res.message); return; }
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load instances');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [Api, relayId]);

  if (loading) return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );

  if (error) return (
    <Alert variant="destructive">
      <Icon icon="material-symbols:error-circle-rounded" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  const instances = data?.instances ?? [];

  if (instances.length === 0) return (
    <Card className="p-8 text-center text-fd-muted-foreground">
      <Icon icon="material-symbols:deployed-code" className="size-12 mx-auto mb-4 opacity-50" />
      <p>No instances running</p>
    </Card>
  );

  return (
    <div className="space-y-3">
      {data && (
        <div className="text-sm text-fd-muted-foreground mb-2">
          {data.total} instance{data.total !== 1 ? 's' : ''} active{data.total !== 1 ? 's' : ''}
        </div>
      )}
      {instances.map(instance => (
        <Card key={instance.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Icon icon="material-symbols:deployed-code" className="size-5 text-blue-500" />
              </div>
              <div>
                <div className="font-medium">Instance #{instance.id}</div>
                <div className="text-xs text-fd-muted-foreground font-mono mt-0.5">{instance.world}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-semibold">{instance.player_count}</div>
                <div className="text-xs text-fd-muted-foreground">/ {instance.capacity}</div>
              </div>
              <button
                onClick={() => router.push(`/settings/relays/${relayId}/instances/${instance.id}/players`)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
                  'bg-fd-accent hover:bg-fd-accent/80 transition-colors',
                  instance.player_count === 0 && 'opacity-50 pointer-events-none'
                )}
              >
                <Icon icon="material-symbols:group-rounded" className="size-4" />
                Players
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
