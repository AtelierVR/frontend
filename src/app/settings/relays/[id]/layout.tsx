'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DocsPage, DocsBody } from 'fumadocs-ui/layouts/docs/page';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import { useApi, isError, RelayDetails, useSocket, RelaySpecs } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import ActionButton from '../../ActionButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CpuCard, MemoryCard, NetworkCard } from './components';

export default function RelayLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const Api = useApi();
  const [relay, setRelay] = useState<RelayDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [stopping, setStopping] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'stop' | 'restart' | null>(null);

  function getSpecs() {
    if (!relay || typeof relay.status !== "object")
      return null;
    return relay.status.specs;
  }

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
    }
  };

  const handleStop = async () => {
    if (!Api) return;
    setStopping(true);
    setConfirmAction(null);
    try {
      const res = await Api.stopRelay(relayId);
      if (isError(res)) {
        setError(res.message);
      } else {
        await loadRelay();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop relay');
    } finally {
      setStopping(false);
    }
  };

  const handleRestart = async () => {
    if (!Api) return;
    setRestarting(true);
    setConfirmAction(null);
    try {
      const res = await Api.restartRelay(relayId);
      if (isError(res)) {
        setError(res.message);
      } else {
        await loadRelay();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart relay');
    } finally {
      setRestarting(false);
    }
  };

  useEffect(() => {
    loadRelay();
  }, [relayId]);

  // Écouter les changements de statut du relay via WebSocket
  useSocket('relay_status_change', (data: { relay_id: number; status: string; time: number; relay?: RelayDetails | null }) => {
    // Ignorer si ce n'est pas le bon relay
    if (data.relay_id !== relayId) return;

    console.log('Relay status changed:', data);

    if (data.status === 'destroyed') {
      // Rediriger vers la page des relays
      router.push('/settings/relays');
    } else if (data.relay) {
      // Mettre à jour le relay avec les nouvelles données
      setRelay({
        ...data.relay,
        status: typeof data.relay.status === 'string'
          ? data.relay.status
          : {
            ...data.relay.status,
            specs_time: new Date(data.time) // Mettre à jour le timestamp des specs pour forcer le rafraîchissement
          }
      });
    }
  });

  // Écouter les mises à jour de specs en temps réel
  useSocket('relay_specs_update', (data: { relay_id: number; time: number; details: any }) => {
    // Ignorer si ce n'est pas le bon relay
    if (data.relay_id !== relayId) return;

    // Mettre à jour uniquement les specs du relay
    setRelay(prevRelay => {
      if (!prevRelay) return prevRelay;
      if (typeof prevRelay.status === 'string') return prevRelay;
      if (!prevRelay.running) return prevRelay;

      return {
        ...prevRelay,
        status: {
          ...prevRelay.status,
          specs: data.details,
          specs_time: new Date(data.time)
        }
      };
    });
  });

  // Calculer un hash des specs pour détecter les changements réels
  const specsKey = useMemo(() => {
    if (!relay || typeof relay.status === 'string' || !relay.running) return null;
    const specs = relay.status.specs;
    if (!specs) return null;
    return JSON.stringify(specs);
  }, [relay?.status]);

  const getActiveTab = () => {
    if (pathname.endsWith('/instances')) return 'instances';
    if (pathname.endsWith('/clients')) return 'clients';
    if (pathname.endsWith('/logs')) return 'logs';
    return 'info';
  };

  const handleTabChange = (value: string) => {
    const routes: Record<string, string> = {
      info: `/settings/relays/${relayId}`,
      instances: `/settings/relays/${relayId}/instances`,
      clients: `/settings/relays/${relayId}/clients`,
      logs: `/settings/relays/${relayId}/logs`,
    };
    router.push(routes[value]);
  };

  const getStatusColor = () => {
    if (!relay?.running) return 'bg-red-500';
    if (typeof relay.status === 'string') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!relay?.running) return 'Offline';
    if (typeof relay.status === 'string') return relay.status;
    return 'Online';
  };

  const status = relay && typeof relay.status !== 'string' && relay.running ? relay.status : null;
  const specs = status?.specs;
  const instancesCount = status?.instances ?? 0;
  const clientsCount = status?.clients ?? 0;
  const responseTime = status?.response ?? 0;


  const tabs = [
    { id: 'info', label: 'General', icon: 'material-symbols:info-rounded' },
    { id: 'instances', label: 'Instances', icon: 'material-symbols:deployed-code', count: instancesCount },
    { id: 'clients', label: 'Clients', icon: 'material-symbols:dns', count: clientsCount },
    { id: 'logs', label: 'Logs', icon: 'material-symbols:description-rounded' },
  ];

  let s = getSpecs();

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsBody>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icon icon="material-symbols:error-circle-rounded" className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !relay ? (
          <Skeleton className="h-32 w-full" />
        ) : relay ? (
          <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/settings/relays">
                  <Button variant="ghost" size="icon">
                    <Icon icon="material-symbols:arrow-back-rounded" className="size-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 justify-center items-center">
                  <div className={cn(
                    'size-3 rounded-full',
                    getStatusColor(),
                    relay.running && typeof relay.status !== 'string' ? 'animate-pulse' : undefined
                  )} />
                  <div className='flex flex-col justify-center items-center'>
                    <h2 className="text-xl font-semibold mb-0 mt-0">Relay #{relay.id}</h2>
                    <p className="text-sm text-fd-muted-foreground mb-0">
                      {relay.runtime} • {getStatusText()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  variant="stop"
                  onClick={() => setConfirmAction('stop')}
                  isLoading={stopping}
                  disabled={!relay?.running}
                />
                <ActionButton
                  variant="restart"
                  onClick={() => setConfirmAction('restart')}
                  isLoading={restarting}
                  disabled={stopping || !relay?.running}
                />
                <ActionButton
                  variant="refresh"
                  onClick={loadRelay}
                  isLoading={loading}
                />
              </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
              <DialogContent className='max-w-lg'>
                <DialogHeader>
                  <DialogTitle>
                    {confirmAction === 'stop' ? 'Stop Relay' : 'Restart Relay'}
                  </DialogTitle>
                  <DialogDescription>
                    {confirmAction === 'stop'
                      ? 'Are you sure you want to stop this relay? All active instances and connections will be terminated.'
                      : 'Are you sure you want to restart this relay? This will temporarily disconnect all active instances and connections.'}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmAction(null)} className="px-4">
                    Cancel
                  </Button>
                  <ActionButton
                    variant={confirmAction === 'stop' ? 'stop' : 'restart'}
                    onClick={confirmAction === 'stop' ? handleStop : handleRestart}
                    className="px-4"
                    isLoading={confirmAction === 'stop' ? stopping : restarting}
                  />
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
                <CpuCard value={s? s.c : null} />
                <MemoryCard value={s? s.m : null} />
                <NetworkCard upload={s? s.u : null} download={s? s.d : null} />
              </div>

            {/* Tabs */}
            <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
              <TabsList>
                {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    <Icon icon={tab.icon} className="size-4 mr-2" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <Badge className="ml-2" variant="default">
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Tab Content */}
            <div className="min-h-[300px] h-full mb-6">
              {children}
            </div>
          </div>
        ) : null}
      </DocsBody>
    </DocsPage>
  );
}
