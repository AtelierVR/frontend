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
import { useApi, isError, RelayDetails, useSocket } from '@/lib/api';
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
import { CpuCard, MemoryCard, StorageCard, NetworkCard } from './components';
import { useLerpedValue } from './hooks';

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
  useSocket('relay_status_change', (data: { relay_id: number; status: string; timestamp: number; relay?: RelayDetails | null }) => {
    // Ignorer si ce n'est pas le bon relay
    if (data.relay_id !== relayId) return;
    
    console.log('Relay status changed:', data);
    
    if (data.status === 'destroyed') {
      // Rediriger vers la page des relays
      router.push('/settings/relays');
    } else if (data.relay) {
      // Mettre à jour le relay avec les nouvelles données
      setRelay(data.relay);
    }
  });

  // Écouter les mises à jour de specs en temps réel
  useSocket('relay_specs_update', (data: { relayId: number; timestamp: number; specs: any }) => {
    // Ignorer si ce n'est pas le bon relay
    if (data.relayId !== relayId) return;
    
    // Mettre à jour uniquement les specs du relay
    setRelay(prevRelay => {
      if (!prevRelay) return prevRelay;
      if (typeof prevRelay.status === 'string') return prevRelay;
      if (!prevRelay.running) return prevRelay;
      
      return {
        ...prevRelay,
        status: {
          ...prevRelay.status,
          specs: data.specs
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

  // Interpoler les valeurs des specs pour des animations fluides
  const lerpedCpu = useLerpedValue(specs?.cpu || 0, 500);
  const lerpedMemory0 = useLerpedValue(specs?.memory[0] || 0, 500);
  const lerpedMemory1 = useLerpedValue(specs?.memory[1] || 0, 500);
  const lerpedStorage0 = useLerpedValue(specs?.storage[0] || 0, 500);
  const lerpedStorage1 = useLerpedValue(specs?.storage[1] || 0, 500);
  const lerpedUpload = useLerpedValue(specs?.upload[0] || 0, 500);
  const lerpedDownload = useLerpedValue(specs?.download[0] || 0, 500);

  // Créer un objet specs avec les valeurs interpolées
  const displaySpecs = specs ? {
    cpu: lerpedCpu,
    memory: [lerpedMemory0, lerpedMemory1] as [number, number],
    storage: [lerpedStorage0, lerpedStorage1] as [number, number],
    upload: [lerpedUpload, specs.upload[1]] as [number, number],
    download: [lerpedDownload, specs.download[1]] as [number, number]
  } : null;

  const tabs = [
    { id: 'info', label: 'General', icon: 'material-symbols:info-rounded' },
    { id: 'instances', label: 'Instances', icon: 'material-symbols:deployed-code', count: instancesCount },
    { id: 'clients', label: 'Clients', icon: 'material-symbols:dns', count: clientsCount },
    { id: 'logs', label: 'Logs', icon: 'material-symbols:description-rounded' },
  ];

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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmAction('stop')}
                  disabled={stopping || !relay?.running}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800"
                >
                  <Icon icon="material-symbols:power-settings-new-rounded" className="size-4" />
                  {stopping ? 'Stopping...' : 'Stop'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmAction('restart')}
                  disabled={restarting || !relay?.running}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                >
                  <Icon icon="material-symbols:refresh-rounded" className="size-4" />
                  {restarting ? 'Restarting...' : 'Restart'}
                </Button>
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
                  <Button variant="outline" onClick={() => setConfirmAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant={'primary'}
                    onClick={confirmAction === 'stop' ? handleStop : handleRestart}
                  >
                    {confirmAction === 'stop' ? 'Stop' : 'Restart'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Stats Overview */}
            {displaySpecs && (
              <div className="grid grid-cols-4 gap-4">
                <CpuCard cpu={displaySpecs.cpu} />
                <MemoryCard memory={displaySpecs.memory} />
                <StorageCard storage={displaySpecs.storage} />
                <NetworkCard upload={displaySpecs.upload} download={displaySpecs.download} />
              </div>
            )}

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
