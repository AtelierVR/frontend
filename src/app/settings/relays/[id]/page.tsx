'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { useApi, isError, RelayDetails } from '@/lib/api';

export default function RelayInfoPage() {
  const params = useParams();
  const Api = useApi();
  const [relay, setRelay] = useState<RelayDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);

  const relayId = Number(params.id);

  const loadRelay = async () => {
    if (!Api || !relayId) return;

    setLoading(true);
    setError(undefined);

    try {
      const res = await Api.fetchRelay(relayId);
      if (isError(res)) {
        setError(res.message);
        return;
      }

      setRelay(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load relay');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRelay();
  }, [relayId]);

  if (loading)
    return <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
    </div>;

  if (error)
    return <Alert variant="destructive">
      <Icon icon="material-symbols:error-circle-rounded" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>;

  const status = relay && typeof relay.status !== 'string' && relay.running ? relay.status : null;

  return (
    <div className="space-y-6">
      {relay && (
        <>
          {/* General Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-fd-border">
                <span className="text-sm text-fd-muted-foreground">ID</span>
                <span className="font-medium">#{relay.id}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-fd-border">
                <span className="text-sm text-fd-muted-foreground">Runtime</span>
                <span className="font-medium">{relay.runtime}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-fd-border">
                <span className="text-sm text-fd-muted-foreground">État</span>
                <span className="font-medium flex items-center gap-2">
                  <div className={`size-2 rounded-full ${relay.running ? 'bg-green-500' : 'bg-red-500'}`} />
                  {relay.running ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </Card>

          {/* Address Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Adresses</h3>
            <div className="space-y-3">
              {Object.entries(relay.address).map(([protocol, address]) => (
                <div key={protocol} className="flex items-center justify-between py-2 border-b border-fd-border last:border-0">
                  <span className="text-sm text-fd-muted-foreground uppercase">{protocol}</span>
                  <span className="font-mono text-sm">{address}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats Summary */}
          {status && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Icon icon="material-symbols:deployed-code" className="size-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{status.instances}</div>
                    <div className="text-sm text-fd-muted-foreground">Instance{status.instances !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Icon icon="material-symbols:layers-rounded" className="size-6 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{status.max_instances}</div>
                    <div className="text-sm text-fd-muted-foreground">Capacité max</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {!relay && (
        <div className="flex flex-col items-center justify-center py-12 text-fd-muted-foreground">
          <Icon icon="material-symbols:dns-rounded" className="size-12 mb-4 opacity-50" />
          <p>Relay introuvable</p>
        </div>
      )}
    </div>
  );
}
