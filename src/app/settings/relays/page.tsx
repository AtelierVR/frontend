'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Skeleton } from '@/components/ui/skeleton';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi, isError, RelayDetails, useSocket } from '@/lib/api';
import { cn } from '@/lib/cn';
import ActionButton from '../ActionButton';

function RelayCard({ relay, onSelect }: { relay: RelayDetails; onSelect: () => void }) {
  const getStatusColor = () => {
    if (!relay.running) return 'bg-fd-muted';
    if (typeof relay.status === 'string') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!relay.running) return 'Offline';
    if (typeof relay.status === 'string') return relay.status;
    return 'Running';
  };

  const getInstanceCount = () => {
    if (typeof relay.status === 'string') return 0;
    return relay.status.instances;
  };

  const getClientCount = () => {
    if (typeof relay.status === 'string') return 0;
    return relay.status.clients;
  };

  const getMaxInstances = () => {
    if (typeof relay.status === 'string') return 0;
    return relay.status.max_instances;
  };

  return (
    <button
      className={cn(
        'w-full p-4 rounded-lg border border-fd-border transition-all text-left',
        'hover:bg-fd-accent/50 bg-fd-accent/10'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'size-2.5 rounded-full',
            getStatusColor(),
            relay.running && typeof relay.status !== 'string' && 'animate-pulse'
          )} />
          <div>
            <div className="font-medium">Relay #{relay.id}</div>
            <div className="text-xs text-fd-muted-foreground">
              {relay.runtime} • {getStatusText()}
            </div>
          </div>
        </div>

        <div className="text-sm text-fd-muted-foreground">
          {getInstanceCount()}/{getMaxInstances()}
        </div>
      </div>
    </button>
  );
}

export default function RelaysPage() {
  const Api = useApi();
  const router = useRouter();
  const [relays, setRelays] = useState<RelayDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadRelays = async () => {
    if (!Api) return;

    // Ne montrer le loading que si on n'a pas encore de relays
    if (relays.length === 0) {
      setLoading(true);
    }
    setError(undefined);

    try {
      const res = await Api.fetchRelays();
      if (isError(res)) {
        setError(res.message);
        return;
      }

      setRelays(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load relays');
    } finally {
      setLoading(false);
    }
  };

  const removeRelay = useCallback((relayId: number) => {
    setRelays(prev => prev.filter(r => r.id !== relayId));
  }, []);

  useEffect(() => {
    loadRelays();
  }, []);

  // Écouter les changements de statut des relays via WebSocket
  useSocket('relay_status_change', (data: { relay_id: number; status: string; timestamp: number; relay?: RelayDetails | null }) => {
    console.log('Relay status changed:', data);

    if (data.status === 'destroyed') {
      // Retirer le relay de la liste
      removeRelay(data.relay_id);
    } else if (data.relay) {
      // Utiliser les données du relay directement depuis l'événement
      setRelays(prev => {
        const existingIndex = prev.findIndex(r => r.id === data.relay_id);
        if (existingIndex >= 0) {
          // Relay existe déjà, le mettre à jour
          const updated = [...prev];
          updated[existingIndex] = data.relay!;
          console.log('Updated relay from event:', data.relay);
          return updated;
        } else {
          // Nouveau relay, l'ajouter à la liste
          console.log('Added new relay from event:', data.relay);
          return [...prev, data.relay!];
        }
      });
    }
  });

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsTitle className="flex items-center justify-between">
        <span>Relays</span>

        <ActionButton
          variant="refresh"
          onClick={loadRelays}
          isLoading={loading}
        />
      </DocsTitle>
      <DocsDescription>
        Manage your relay servers. Relays handle multiplayer sessions and world hosting.
      </DocsDescription>
      <DocsBody>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icon icon="material-symbols:error-circle-rounded" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {loading && relays.length === 0 ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : relays.length === 0 ? (
            <div className="text-center py-12 text-fd-muted-foreground">
              <Icon icon="material-symbols:dns-rounded" className="size-12 mx-auto mb-4 opacity-50" />
              <p>No relays configured yet.</p>
            </div>
          ) : (
            relays.map((relay) => (
              <RelayCard
                key={relay.id}
                relay={relay}
                onSelect={() => router.push(`/settings/relays/${relay.id}`)}
              />
            ))
          )}
        </div>
      </DocsBody>
    </DocsPage>
  );
}
